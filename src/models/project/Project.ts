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

// Auto-generate project key if not set
projectSchema.pre("save", async function () {
  if (!this.key && this.projectName) {
    // Generate base key from project name
    const words = this.projectName
      .trim()
      .split(/\s+/)
      .filter((word: string) => word.length > 0)
      .map((word: string) => word.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
      .filter((word: string) => word.length > 0);

    let baseKey = "";
    if (words.length === 0) {
      baseKey = "PROJ";
    } else {
      // Take first letters of each word up to 10 characters
      let charIndex = 0;
      while (baseKey.length < 10 && charIndex < 10) {
        for (const word of words) {
          if (baseKey.length >= 10) break;
          if (charIndex < word.length) {
            baseKey += word[charIndex];
          }
        }
        charIndex++;
      }
      // Ensure minimum 2 characters
      baseKey =
        baseKey.length < 2 ? baseKey.padEnd(2, "X") : baseKey.slice(0, 10);
    }

    // Check for uniqueness and append number if needed
    let finalKey = baseKey;
    let suffix = 1;
    let isUnique = false;

    while (!isUnique && suffix <= 99) {
      const existing = await mongoose
        .model("Project")
        .findOne({ key: finalKey })
        .select("_id")
        .lean();

      if (!existing) {
        isUnique = true;
      } else {
        // Try with numeric suffix
        const maxLength = 10 - String(suffix).length;
        finalKey = baseKey.slice(0, maxLength) + suffix;
        suffix++;
      }
    }

    if (!isUnique) {
      throw new Error(
        `Unable to generate unique key for project: ${this.projectName}`
      );
    }

    this.key = finalKey;
  }
});

// Virtual to populate project members (opt-in via .populate('members'))
projectSchema.virtual("members", {
  ref: "ProjectMember",
  localField: "_id",
  foreignField: "project",
});

export const Project = mongoose.model<IProject>("Project", projectSchema);
