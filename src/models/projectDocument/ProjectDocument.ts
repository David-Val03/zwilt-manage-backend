import mongoose, { Schema } from "mongoose";
import { IProjectDocument } from "./types";

// ====================== PROJECT DOCUMENT SCHEMA ======================

const projectDocumentSchema = new Schema<IProjectDocument>(
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
    name: {
      type: String,
      required: [true, "Document name is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Document URL is required"],
    },
    type: {
      type: String,
      required: false,
      // e.g., 'application/pdf', 'image/png', etc.
    },
    size: {
      type: Number,
      required: false,
      // Size in bytes
    },
    uploadedBy: {
      type: String,
      required: [true, "Uploaded by user ID is required"],
      validate: {
        validator: function (value: string) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid user ID format for uploadedBy",
      },
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ====================== INDEXES ======================
projectDocumentSchema.index({ project: 1, name: 1 });

export const ProjectDocument = mongoose.model<IProjectDocument>(
  "ProjectDocument",
  projectDocumentSchema
);
