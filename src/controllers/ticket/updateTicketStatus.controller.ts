import { RequestHandler } from "express";
import { Ticket } from "../../models/ticket";
import { NotFound, Conflict } from "http-errors";

// ============================================================================
// UPDATE TICKET STATUS CONTROLLER
// ============================================================================

/**
 * Update ticket status with dependency checking and permission validation
 *
 * Business rules:
 * - Only admins/managers/QA can mark tickets as "Done"
 * - Cannot start (Ongoing/Blocked/QA) if dependencies are not Done
 * - Reopening from Done flags/blocks dependent tickets
 * - Moving to Done unblocks dependents whose deps are all Done
 */
interface ReqParams {
  ticketId: string;
}

interface ReqBody {
  status: "Backlog" | "Ongoing" | "Blocked" | "QA" | "Done";
  author?: string; // User ID making the change (for activity log)
}

export const updateTicketStatusController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    let { status: newStatus } = req.body;

    // Validate status is provided
    if (!newStatus) {
      throw new Conflict("Status is required");
    }

    // Fetch current ticket - only fields we need
    const ticket = await Ticket.findById(ticketId)
      .select("status dependsOn projectId")
      .lean();

    if (!ticket) {
      throw new NotFound("Ticket not found");
    }

    const oldStatus = ticket.status || "Backlog";
    const oldStatusLc = oldStatus.toLowerCase();
    const newStatusLc = newStatus.toLowerCase();

    // Skip if no change
    if (newStatusLc === oldStatusLc) {
      return res.json(ticket);
    }

    const movingToActive = ["ongoing", "blocked", "qa"].includes(newStatusLc);
    const wasDone = oldStatusLc === "done";

    // TODO: Add permission check for moving to Done
    // Only admins, project managers, or QA can move tickets to Done
    // if (newStatusLc === "done") {
    //   const hasPermission = await checkAdminOrManager(req, ticket.projectId);
    //   if (!hasPermission) {
    //     newStatus = "QA" as any; // Downgrade to QA
    //   }
    // }

    // Check dependencies when starting ticket
    if (movingToActive && ticket.dependsOn?.length) {
      const deps = await Ticket.find({ _id: { $in: ticket.dependsOn } })
        .select("status title")
        .lean();

      const blockers = deps.filter((d) => d.status?.toLowerCase() !== "done");

      if (blockers.length > 0) {
        // Mark ticket as blocked
        await Ticket.updateOne(
          { _id: ticketId },
          { $set: { blockedBy: true } }
        );

        // Return conflict with blockers
        return res.status(409).json({
          message: "Cannot start: dependent tickets are not Done",
          blockers: blockers.map((b) => ({
            _id: b._id,
            title: b.title,
            status: b.status,
          })),
        });
      }

      // Ensure unblocked if all dependencies are Done
      await Ticket.updateOne({ _id: ticketId }, { $set: { blockedBy: false } });
    }

    // Handle reopening from Done - flag/block dependents
    if (wasDone && newStatusLc !== "done") {
      const dependents = await Ticket.find({ dependsOn: ticketId })
        .select("_id status")
        .lean();

      if (dependents.length) {
        const backlogs = dependents
          .filter((t) => t.status?.toLowerCase() === "backlog")
          .map((t) => t._id);

        const actives = dependents
          .filter((t) =>
            ["ongoing", "blocked", "qa"].includes(t.status?.toLowerCase() || "")
          )
          .map((t) => t._id);

        if (backlogs.length) {
          await Ticket.updateMany(
            { _id: { $in: backlogs } },
            { $set: { blockedBy: true } }
          );
        }

        if (actives.length) {
          await Ticket.updateMany(
            { _id: { $in: actives } },
            { $set: { flaggedByDependencies: true } }
          );
        }
      }
    }

    // Handle moving to Done - unblock dependents whose deps are all Done
    if (newStatusLc === "done") {
      const dependents = await Ticket.find({ dependsOn: ticketId })
        .select("_id dependsOn")
        .lean();

      if (dependents.length) {
        const uniqueDepIds = Array.from(
          new Set(
            dependents.flatMap((d) =>
              (d.dependsOn || []).map((id) => String(id))
            )
          )
        );

        const depDocs = await Ticket.find({ _id: { $in: uniqueDepIds } })
          .select("status deleted")
          .lean();

        const statusMap = new Map<
          string,
          { status: string; deleted?: boolean }
        >();
        depDocs.forEach((doc) =>
          statusMap.set(String(doc._id), {
            status: doc.status?.toLowerCase() || "backlog",
            deleted: doc.deleted,
          })
        );

        // Treat current ticket as done
        statusMap.set(String(ticketId), { status: "done", deleted: false });

        const toUnblock: string[] = [];
        for (const dep of dependents) {
          const hasUnfinished = (dep.dependsOn || []).some((depId) => {
            const info = statusMap.get(String(depId));
            return info && info.status !== "done" && !info.deleted;
          });

          if (!hasUnfinished) {
            toUnblock.push(String(dep._id));
          }
        }

        if (toUnblock.length) {
          await Ticket.updateMany(
            { _id: { $in: toUnblock } },
            { $set: { blockedBy: false, flaggedByDependencies: false } }
          );
        }
      }
    }

    // Update the status
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedTicket) {
      throw new NotFound("Ticket not found after update");
    }

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
};
