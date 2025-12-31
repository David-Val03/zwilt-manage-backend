import mongoose, { Schema } from "mongoose";
import { ITicketTemplate } from "./types";
import { SubtaskSchema } from "../schemas/Subtask.schema";
import { ChecklistItemSchema } from "../schemas/ChecklistItem.schema";
import {
  TICKET_PRIORITIES,
  TICKET_TYPES,
  TICKET_STATUSES,
} from "../../utils/constants";

// ====================== TEMPLATE SCHEMA ======================

const ticketTemplateSchema = new Schema<ITicketTemplate>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  defaultTitle: { type: String, required: false },
  priority: {
    type: String,
    enum: TICKET_PRIORITIES,
    default: "medium",
  },
  ticketType: {
    type: String,
    enum: TICKET_TYPES,
    required: true,
  },
  defaultStatus: {
    type: String,
    enum: TICKET_STATUSES,
    default: "Backlog",
  },
  defaultAssignees: {
    type: [String],
    default: [],
    validate: {
      validator: function (values: string[]) {
        return values.every((v) => mongoose.Types.ObjectId.isValid(v));
      },
      message: "Invalid user ID format in defaultAssignees array",
    },
  },
  defaultChecklist: { type: [ChecklistItemSchema], default: [] },
  defaultSubtasks: { type: [SubtaskSchema], default: [] },
  defaultPoints: { type: Number, default: 0 },
  defaultDueDateOffset: { type: Number, default: null },
  project: { type: String, required: false },
  createdBy: {
    type: String,
    required: true,
    validate: {
      validator: function (value: string) {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: "Invalid user ID format",
    },
  },
  archived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const TicketTemplate = mongoose.model<ITicketTemplate>(
  "TicketTemplate",
  ticketTemplateSchema
);
