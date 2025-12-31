import mongoose, { Schema } from "mongoose";
import { ITimeLog } from "../ticket/types";

// ====================== TIME LOG SCHEMA ======================

export const TimeLogSchema = new Schema<ITimeLog>({
  userId: {
    type: String,
    required: true,
    validate: {
      validator: function (value: string) {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: "Invalid user ID format",
    },
  },
  seconds: { type: Number, required: true },
  loggedAt: { type: Date, default: Date.now },
});
