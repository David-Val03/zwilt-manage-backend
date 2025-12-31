import mongoose, { Schema } from "mongoose";
import { ITicketActivity } from "./types";

// ====================== TICKET ACTIVITY SCHEMA ======================

const ticketActivitySchema = new Schema<ITicketActivity>({
  ticketId: {
    type: Schema.Types.ObjectId,
    ref: "Ticket",
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

export const TicketActivity = mongoose.model<ITicketActivity>(
  "TicketActivity",
  ticketActivitySchema
);
