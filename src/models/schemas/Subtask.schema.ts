import mongoose, { Schema } from "mongoose";
import { ISubtask } from "../ticket/types";
import { TICKET_STATUSES } from "../../utils/constants";

// ====================== SUBTASK SCHEMA ======================

export const SubtaskSchema = new Schema<ISubtask>({
  title: { type: String, required: true },
  done: { type: Boolean, default: undefined },
  status: {
    type: String,
    enum: TICKET_STATUSES,
    default: "Backlog",
  },
  assignee: {
    type: String,
    required: false,
    validate: {
      validator: function (value: string) {
        return !value || mongoose.Types.ObjectId.isValid(value);
      },
      message: "Invalid assignee user ID format",
    },
  },
  dueDate: { type: Date, required: false, default: null },
  createdAt: { type: Date, default: Date.now },
});
