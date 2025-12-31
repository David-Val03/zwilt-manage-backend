import { RequestHandler } from "express";
import { Comment } from "../../models/comment";
import { Ticket } from "../../models/ticket";
import { BadRequest, NotFound } from "http-errors";

// ============================================================================
// CREATE COMMENT CONTROLLER
// ============================================================================

/**
 * Create a comment on a ticket
 */
interface ReqParams {
  ticketId: string;
}

interface ReqBody {
  author: string; // User ID from auth backend
  message: string;
  media?: any[];
  mentions?: any[];
}

export const createCommentController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { author, message, media, mentions } = req.body;

    if (!author || !message?.trim()) {
      throw new BadRequest("Author and message are required");
    }

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.deleted || ticket.archived) {
      throw new NotFound("Ticket not found");
    }

    const comment = await Comment.create({
      ticketId,
      author,
      message: message.trim(),
      media: media || [],
      mentions: mentions || [],
      readBy: [],
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
