import mongoose, { Schema } from "mongoose";
import { IProjectMember } from "./types";

// ====================== PROJECT MEMBER SCHEMA ======================

const projectMemberSchema = new Schema<IProjectMember>(
  {
    project: {
      type: String,
      required: [true, "Project ID is required"],
      validate: {
        validator: function (value: string) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid project ID format",
      },
      index: true,
    },
    user: {
      type: String,
      required: [true, "User ID is required"],
      validate: {
        validator: function (value: string) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid user ID format",
      },
      index: true,
    },
    role: {
      type: String,
      enum: ["MEMBER", "MANAGER", "QA", "ADMIN"],
      default: "MEMBER",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    addedBy: {
      type: String,
      required: [true, "Added by user ID is required"],
      validate: {
        validator: function (value: string) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid user ID format for addedBy",
      },
    },
  },
  {
    timestamps: true,
  }
);

// ====================== INDEXES ======================

// Compound index for efficient project member queries
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

// Index for querying all projects a user belongs to
projectMemberSchema.index({ user: 1, role: 1 });

// Index for querying members by role within a project
projectMemberSchema.index({ project: 1, role: 1 });

export const ProjectMember = mongoose.model<IProjectMember>(
  "ProjectMember",
  projectMemberSchema
);
