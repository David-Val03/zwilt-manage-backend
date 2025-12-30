import { RequestHandler } from "express";
import Milestone from "../../models/milestone/Milestone";
import { NotFound } from "http-errors";
import { ParamsDictionary } from "express-serve-static-core";

interface ReqParams extends ParamsDictionary {
  milestoneId: string;
}

export const getMilestoneController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { milestoneId } = req.params;
    const milestone = await Milestone.findById(milestoneId);

    if (!milestone) {
      throw new NotFound("Milestone not found");
    }

    res.json(milestone);
  } catch (error) {
    next(error);
  }
};
