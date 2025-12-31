import mongoose, { Schema } from "mongoose";
import { ISprintActivity } from "./types";

// ====================== SPRINT ACTIVITY SCHEMA ======================

const sprintActivitySchema = new Schema<ISprintActivity>({
  sprintId: {
    type: Schema.Types.ObjectId,
    ref: "Sprint",
    required: true,
  },
  author: {
    type: String,
    required: true,
    validate: {
      validator: function (value: string) {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: "Invalid user ID format",
    },
  },
  action: { type: String, required: true },
  details: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const SprintActivity = mongoose.model<ISprintActivity>(
  "SprintActivity",
  sprintActivitySchema
);
