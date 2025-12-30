import { RequestHandler } from "express";
import Milestone from "../../models/milestone/Milestone";
import { PagingQuery } from "@r5v/mongoose-paginate";
import { buildQuery } from "../../utils";

export const getMilestonesController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { project, status } = req.query;

    const filter: any = {};
    if (project) filter.project = project;
    if (status) filter.status = status;

    const config = buildQuery({
      limit: 20,
      sort: "endDate asc",
    });

    const query = new PagingQuery(req, Milestone, { ...config, filter });
    const milestones = await query.exec();

    res.json(milestones);
  } catch (error) {
    next(error);
  }
};
