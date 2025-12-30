import { RequestHandler } from "express";
import Milestone from "../../models/milestone/Milestone";
import { BadRequest } from "http-errors";

interface ReqBody {
  name: string;
  project: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  createdBy: string;
}

export const createMilestoneController: RequestHandler<
  unknown,
  any,
  ReqBody
> = async (req, res, next) => {
  try {
    const { name, project, createdBy } = req.body;

    if (!name || !project || !createdBy) {
      throw new BadRequest("Name, project and createdBy are required");
    }

    const milestone = await Milestone.create({
      ...req.body,
    });

    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
};
