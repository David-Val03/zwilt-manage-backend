import mongoose, { Schema } from "mongoose";
import { IProject } from "./types";

// ====================== PROJECT SCHEMA ======================

const projectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      index: true,
    },
    projectImage: {
      type: String,
      required: false,
    },
    key: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          // Key should be 2-10 uppercase letters/numbers
          return /^[A-Z0-9]{2,10}$/.test(value);
        },
        message: "Project key must be 2-10 uppercase letters or numbers",
      },
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "DELETED"],
      default: "ACTIVE",
      required: true,
    },
    organization: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid organization ID format",
      },
    },
    createdBy: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid user ID format",
      },
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ====================== INDEXES ======================

projectSchema.index({ projectName: "text", description: "text" });
projectSchema.index({ organization: 1, status: 1 });

// ====================== VIRTUAL POPULATES ======================

// Virtual populate for all tickets in this project
projectSchema.virtual("tickets", {
  ref: "Ticket",
  localField: "_id",
  foreignField: "projectId",
  count: true, // Only return count
});

// Virtual populate for all milestones in this project
projectSchema.virtual("milestones", {
  ref: "Milestone",
  localField: "_id",
  foreignField: "project",
  count: true, // Only return count
});

// Virtual field for ticket count
projectSchema.virtual("ticketCount").get(function () {
  return this.tickets?.length || 0;
});

// Virtual field for milestone count
projectSchema.virtual("milestoneCount").get(function () {
  return this.milestones?.length || 0;
});

// ====================== MIDDLEWARE ======================

// Virtual to populate project members (opt-in via .populate('members'))
projectSchema.virtual("members", {
  ref: "ProjectMember",
  localField: "_id",
  foreignField: "project",
});

export const Project = mongoose.model<IProject>("Project", projectSchema);
