import { RequestHandler } from "express";
import { ProjectMember } from "../../models/projectMember";
import { BadRequest } from "http-errors";

// ============================================================================
// ADD PROJECT MEMBER CONTROLLER
// ============================================================================

/**
 * Add a member to a project
 */
interface ReqParams {
  projectId: string;
}

interface ReqBody {
  user: string;
  role: "MEMBER" | "MANAGER" | "QA" | "ADMIN";
  addedBy: string;
}

export const addProjectMemberController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { user, role, addedBy } = req.body;

    // Validation
    if (!user || !addedBy) {
      throw new BadRequest("User ID and addedBy are required");
    }

    const projectMember = await ProjectMember.create({
      project: projectId,
      user,
      role: role || "MEMBER",
      addedBy,
    });

    res.status(201).json(projectMember);
  } catch (error) {
    next(error);
  }
};
