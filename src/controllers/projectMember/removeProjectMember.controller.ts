import { RequestHandler } from "express";
import { ProjectMember } from "../../models/projectMember";
import { NotFound } from "http-errors";

// ============================================================================
// REMOVE PROJECT MEMBER CONTROLLER
// ============================================================================

/**
 * Remove a member from a project
 */
interface ReqParams {
  projectId: string;
  userId: string;
}

export const removeProjectMemberController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { projectId, userId } = req.params;

    const projectMember = await ProjectMember.findOneAndDelete({
      project: projectId,
      user: userId,
    });

    if (!projectMember) {
      throw new NotFound("Project member not found");
    }

    res.json({
      message: "Project member removed successfully",
      projectMember,
    });
  } catch (error) {
    next(error);
  }
};
