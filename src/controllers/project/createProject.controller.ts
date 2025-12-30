import { RequestHandler } from "express";
import { Project } from "../../models/project";
import { BadRequest } from "http-errors";

// ============================================================================
// CREATE PROJECT CONTROLLER
// ============================================================================

/**
 * Create a new project
 */
interface ReqParams {}

interface ReqBody {
  projectName: string;
  projectImage?: string;
  key?: string;
  description?: string;
  organization?: string;
  createdBy: string;
}

export const createProjectController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { projectName, createdBy } = req.body;

    // Validation
    if (!projectName || !createdBy) {
      throw new BadRequest("Project name and createdBy are required");
    }

    const project = await Project.create(req.body);

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};
