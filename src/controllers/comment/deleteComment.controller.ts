import { RequestHandler } from "express";
import { Comment } from "../../models/comment";
import { NotFound } from "http-errors";

// ============================================================================
// DELETE COMMENT CONTROLLER
// ============================================================================

/**
 * Delete a comment (hard delete)
 */
interface ReqParams {
  ticketId: string;
  commentId: string;
}

export const deleteCommentController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { ticketId, commentId } = req.params;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      ticketId,
    });

    if (!comment) {
      throw new NotFound("Comment not found");
    }

    res.json({
      message: "Comment deleted successfully",
      comment,
    });
  } catch (error) {
    next(error);
  }
};
