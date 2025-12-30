import { RequestHandler } from "express";
import { Project } from "../../models/project";
import { NotFound } from "http-errors";

// ============================================================================
// DELETE PROJECT CONTROLLER
// ============================================================================

/**
 * Soft delete a project by setting status to DELETED
 */
interface ReqParams {
  projectId: string;
}

export const deleteProjectController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
      projectId,
      { status: "DELETED" },
      { new: true }
    );

    if (!project) {
      throw new NotFound("Project not found");
    }

    res.json({
      message: "Project deleted successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};
