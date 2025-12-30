import { RequestHandler } from "express";
import { ProjectMember } from "../../models/projectMember";

// ============================================================================
// GET PROJECT MEMBERS CONTROLLER
// ============================================================================

/**
 * Get all members of a project
 */
interface ReqParams {
  projectId: string;
}

export const getProjectMembersController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { projectId } = req.params;
    const { role } = req.query;

    const filter: any = { project: projectId };

    // Optional role filtering
    if (role && typeof role === "string") {
      filter.role = role;
    }

    const members = await ProjectMember.find(filter).sort({ addedAt: -1 });

    res.json(members);
  } catch (error) {
    next(error);
  }
};
