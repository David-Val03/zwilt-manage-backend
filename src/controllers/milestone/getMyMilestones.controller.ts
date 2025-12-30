import { RequestHandler } from "express";
import Milestone from "../../models/milestone/Milestone";
import { ProjectMember } from "../../models/projectMember/ProjectMember";
import { PagingQuery } from "@r5v/mongoose-paginate";
import { buildQuery } from "../../utils";
import { Unauthorized } from "http-errors";

export const getMyMilestonesController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Unauthorized("Authentication required");
    }

    // Get all projects the user is a member of
    const members = await ProjectMember.find({ user: userId }).select(
      "project"
    );
    const projectIds = members.map((m) => m.project);

    // Build base config
    const config = buildQuery({
      limit: 30,
      sort: "endDate asc",
    });

    // Filter milestones by these projects
    const filter = {
      project: { $in: projectIds },
    };

    // Construct query with filter and populate
    const query = new PagingQuery(req, Milestone, {
      ...config,
      filter,
      populate: [{ path: "projectDetails", select: "projectName" }],
    });

    const milestones = await query.exec();

    res.json(milestones);
  } catch (error) {
    next(error);
  }
};
