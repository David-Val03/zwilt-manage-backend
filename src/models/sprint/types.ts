import { Document, Types } from "mongoose";
import { SprintStatusType } from "../../utils/constants";

/**
 * Sprint document interface
 */
export interface ISprint extends Document {
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatusType;
  project: string;
  projectId: Types.ObjectId;
  tickets: Types.ObjectId[];
  createdBy: string; // User ID from auth backend
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  totalPoints?: number;
  completedPoints?: number;
  velocity?: number;

  // Methods
  calculatePoints(): Promise<{ totalPoints: number; completedPoints: number }>;

  // Virtuals
  isActive?: boolean;
}
