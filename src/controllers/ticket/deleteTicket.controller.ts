import { RequestHandler } from "express";
import { Ticket } from "../../models/ticket";
import { NotFound } from "http-errors";

// ============================================================================
// DELETE TICKET CONTROLLER
// ============================================================================

/**
 * Soft delete a ticket by setting deleted flag
 */
interface ReqParams {
  ticketId: string;
}

export const deleteTicketController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { deleted: true },
      { new: true }
    );

    if (!ticket) {
      throw new NotFound("Ticket not found");
    }

    res.json({
      message: "Ticket deleted successfully",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
