import { RequestHandler } from "express";
import Milestone from "../../models/milestone/Milestone";
import { NotFound } from "http-errors";
import { ParamsDictionary } from "express-serve-static-core";

interface ReqParams extends ParamsDictionary {
  milestoneId: string;
}

export const deleteMilestoneController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const { milestoneId } = req.params;
    const deleted = await Milestone.findByIdAndDelete(milestoneId);

    if (!deleted) {
      throw new NotFound("Milestone not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
