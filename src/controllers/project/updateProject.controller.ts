import { RequestHandler } from "express";
import { Project } from "../../models/project";
import { NotFound } from "http-errors";

// ============================================================================
// UPDATE PROJECT CONTROLLER
// ============================================================================

/**
 * Update a project by ID
 */
interface ReqParams {
  projectId: string;
}

interface ReqBody {
  projectName?: string;
  projectImage?: string;
  key?: string;
  description?: string;
  status?: string;
}

export const updateProjectController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(projectId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      throw new NotFound("Project not found");
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};
