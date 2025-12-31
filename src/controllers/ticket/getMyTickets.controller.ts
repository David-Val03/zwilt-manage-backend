import { RequestHandler } from "express";
import { Ticket } from "../../models/ticket";

// ============================================================================
// GET MY TICKETS CONTROLLER
// ============================================================================

/**
 * Get all tickets assigned to the authenticated user
 * Supports filtering by status, project, priority
 */

interface QueryParams {
  userId?: string;
  status?: string;
  projectId?: string;
  priority?: string;
  page?: string;
  limit?: string;
}

export const getMyTicketsController: RequestHandler<
  any,
  any,
  any,
  QueryParams
> = async (req, res, next) => {
  try {
    // Get userId from authenticated user
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Build query
    const query: any = {
      $or: [{ assignee: userId }, { assignees: userId }],
      deleted: { $ne: true },
    };

    // Optional filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Pagination
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "50");
    const skip = (page - 1) * limit;

    // Fetch tickets
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .select(
          "title description status priority assignee assignees projectId ticketKey dueDate createdAt updatedAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
    ]);

    res.json({
      success: true,
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
