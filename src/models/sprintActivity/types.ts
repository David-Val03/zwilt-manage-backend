import { Document, Types } from "mongoose";

/**
 * Sprint activity document interface
 */
export interface ISprintActivity extends Document {
  sprintId: Types.ObjectId;
  author: string; // User ID from auth backend
  action: string;
  details: string;
  message: string;
  createdAt: Date;
}
