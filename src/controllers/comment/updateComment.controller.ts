import { RequestHandler } from "express";
import { Comment } from "../../models/comment";
import { NotFound } from "http-errors";

// ============================================================================
// UPDATE COMMENT CONTROLLER
// ============================================================================

/**
 * Update a comment
 */
interface ReqParams {
  ticketId: string;
  commentId: string;
}

interface ReqBody {
  message?: string;
  media?: any[];
  mentions?: any[];
}

export const updateCommentController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { ticketId, commentId } = req.params;

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, ticketId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!comment) {
      throw new NotFound("Comment not found");
    }

    res.json(comment);
  } catch (error) {
    next(error);
  }
};
