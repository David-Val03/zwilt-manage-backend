import { RequestHandler } from "express";
import { Comment } from "../../models/comment";

// ============================================================================
// GET COMMENTS CONTROLLER
// ============================================================================

/**
 * Get all comments for a ticket
 */
interface ReqParams {
  ticketId: string;
}

export const getCommentsController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { ticketId } = req.params;

    const comments = await Comment.find({ ticketId }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};
