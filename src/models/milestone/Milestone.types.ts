import { Document } from "mongoose";
import { MilestoneStatusType } from "../../utils/constants";

export interface IMilestone extends Document {
  name: string;
  description?: string;
  project: string; // Reference to Project (stored as string ID)
  startDate?: Date;
  endDate?: Date;
  status: MilestoneStatusType;
  createdBy: string; // Reference to User (stored as string ID)
  createdAt: Date;
  updatedAt: Date;
}
