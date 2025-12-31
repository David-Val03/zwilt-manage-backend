import { RequestHandler } from "express";
import { Ticket } from "../../models/ticket";
import { NotFound } from "http-errors";

// ============================================================================
// GET TICKET CONTROLLER
// ============================================================================

/**
 * Get a single ticket by ID with comments populated
 */
interface ReqParams {
  ticketId: string;
}

export const getTicketController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId).populate("comments");

    if (!ticket) {
      throw new NotFound("Ticket not found");
    }

    // Check if ticket is deleted or archived
    if (ticket.deleted || ticket.archived) {
      throw new NotFound("Ticket not found");
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};
