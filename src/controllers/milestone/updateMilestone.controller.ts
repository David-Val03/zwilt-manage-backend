import { RequestHandler } from "express";
import Milestone from "../../models/milestone/Milestone";
import { NotFound } from "http-errors";
import { ParamsDictionary } from "express-serve-static-core";

interface ReqParams extends ParamsDictionary {
  milestoneId: string;
}

export const updateMilestoneController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { milestoneId } = req.params;

    const existing = await Milestone.findById(milestoneId);
    if (!existing) {
      throw new NotFound("Milestone not found");
    }

    const updated = await Milestone.findByIdAndUpdate(milestoneId, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
