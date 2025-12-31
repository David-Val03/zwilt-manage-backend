import { RequestHandler } from "express";
import { Project } from "../../models/project";
import { ProjectDocument } from "../../models/projectDocument";
import { ProjectMember } from "../../models/projectMember";
import Milestone from "../../models/milestone";
import { BadRequest } from "http-errors";
import { MilestoneStatusType } from "../../utils/constants";

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
  members?: Array<{ email: string; role: string; userId: string }>;
  documents?: Array<{
    name: string;
    url: string;
    type?: string;
    size?: number;
  }>;
  milestones?: Array<{
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: MilestoneStatusType;
  }>;
}

export const createProjectController: RequestHandler<
  ReqParams,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { projectName, createdBy, members, documents, milestones } = req.body;

    if (!projectName || !createdBy) {
      throw new BadRequest("Project name and createdBy are required");
    }

    const project = await Project.create(req.body);

    if (members && members.length > 0) {
      const membersToCreate = members.map((member) => ({
        project: project._id,
        user: member.userId,
        role: member.role,
        addedBy: createdBy,
        addedAt: new Date(),
      }));

      await ProjectMember.insertMany(membersToCreate);
    }

    if (documents && documents.length > 0) {
      const docsToCreate = documents.map((doc) => ({
        ...doc,
        project: project._id,
        uploadedBy: createdBy,
        uploadedAt: new Date(),
      }));

      await ProjectDocument.insertMany(docsToCreate);
    }

    if (milestones && milestones.length > 0) {
      const milestonesToCreate = milestones.map((ms) => ({
        ...ms,
        project: project._id,
        createdBy: createdBy,
        startDate: ms.startDate ? new Date(ms.startDate) : undefined,
        endDate: ms.endDate ? new Date(ms.endDate) : undefined,
      }));

      await Milestone.insertMany(milestonesToCreate);
    }

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};
