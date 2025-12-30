import { RequestHandler } from "express";
import { Project } from "../../models/project";
import { NotFound } from "http-errors";

// ============================================================================
// GET PROJECT CONTROLLER
// ============================================================================

/**
 * Get a single project by ID with members populated
 */
interface ReqParams {
  projectId: string;
}

export const getProjectController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate("members");

    if (!project) {
      throw new NotFound("Project not found");
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};
