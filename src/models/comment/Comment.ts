import mongoose, { Schema } from "mongoose";
import { IComment } from "./types";

// ====================== COMMENT SCHEMA ======================

const commentSchema = new Schema<IComment>({
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
  media: {
    type: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: false },
        size: { type: Number, required: false },
      },
    ],
    default: [],
  },
  mentions: {
    type: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    default: [],
  },
  readBy: {
    type: [
      {
        userId: {
          type: String,
          validate: {
            validator: function (value: string) {
              return mongoose.Types.ObjectId.isValid(value);
            },
            message: "Invalid user ID format",
          },
        },
        readAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
