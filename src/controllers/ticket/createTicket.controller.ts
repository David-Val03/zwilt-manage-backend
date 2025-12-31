import { RequestHandler } from "express";
import { Ticket } from "../../models/ticket";
import { BadRequest } from "http-errors";

// ============================================================================
// CREATE TICKET CONTROLLER
// ============================================================================

/**
 * Create a new ticket
 * Note: ticketKey is auto-generated via pre-save hook if project is provided
 */
interface ReqBody {
  title: string;
  description?: string;
  priority?: "urgent" | "high" | "medium" | "low";
  status?: "Backlog" | "Ongoing" | "Blocked" | "QA" | "Done";
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

export const createTicketController: RequestHandler<any, any, ReqBody> = async (
  req,
  res,
  next
) => {
  try {
    const { title, ...rest } = req.body;

    if (!title || !title.trim()) {
      throw new BadRequest("Title is required");
    }

    // Create ticket - ticketKey will be auto-generated via pre-save hook
    const ticket = await Ticket.create({
      title: title.trim(),
      status: rest.status || "Backlog",
      priority: rest.priority?.toLowerCase() || "medium",
      ticketType: rest.ticketType?.toLowerCase() || "task",
      ...rest,
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};
