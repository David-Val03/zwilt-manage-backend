import { RequestHandler } from "express";
import { ProjectMember } from "../../models/projectMember";
import { BadRequest, NotFound } from "http-errors";

// ============================================================================
// UPDATE PROJECT MEMBER ROLE CONTROLLER
// ============================================================================

/**
 * Update a member's role in a project
 */
interface ReqParams {
  projectId: string;
  userId: string;
}

interface ReqBody {
  role: "MEMBER" | "MANAGER" | "QA" | "ADMIN";
}

export const updateProjectMemberRoleController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new BadRequest("Role is required");
    }

    const projectMember = await ProjectMember.findOneAndUpdate(
      { project: projectId, user: userId },
      { role },
      { new: true, runValidators: true }
    );

    if (!projectMember) {
      throw new NotFound("Project member not found");
    }

    res.json(projectMember);
  } catch (error) {
    next(error);
  }
};
