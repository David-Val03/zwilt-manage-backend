import { RequestHandler } from "express";
import { Ticket } from "../../models/ticket";
import { NotFound } from "http-errors";

// ============================================================================
// UPDATE TICKET CONTROLLER
// ============================================================================

/**
 * Update a ticket by ID
 * Note: Status cannot be updated via this endpoint - use updateTicketStatus instead
 */
interface ReqParams {
  ticketId: string;
}

interface ReqBody {
  title?: string;
  description?: string;
  priority?: "urgent" | "high" | "medium" | "low";
  // status is excluded - use separate endpoint
  assignee?: string;
  assignees?: string[];
  project?: string;
  projectId?: string;
  ticketType?: "bug" | "feature" | "enhancement" | "task";
  dueDate?: string;
  points?: number;
  subtasks?: any[];
  checklist?: any[];
  images?: any[];
}

export const updateTicketController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { ...updates } = req.body;

    // Explicitly remove status if somehow included
    delete (updates as any).status;

    const ticket = await Ticket.findByIdAndUpdate(ticketId, updates, {
      new: true,
      runValidators: true,
    });

    if (!ticket) {
      throw new NotFound("Ticket not found");
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};
