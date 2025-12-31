import mongoose, { Schema } from "mongoose";
import { MILESTONE_STATUSES, MilestoneStatus } from "../../utils/constants";
import { IMilestone } from "./Milestone.types";

// ====================== MILESTONE SCHEMA ======================

const milestoneSchema = new Schema<IMilestone>(
  {
    name: {
      type: String,
      required: [true, "Milestone name is required"],
      trim: true,
      maxlength: [200, "Milestone name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    project: {
      type: String,
      required: [true, "Project reference is required"],
      validate: {
        validator: function (value: string) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid project ID format",
      },
      index: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
      validate: {
        validator: function (this: IMilestone, value: Date) {
          // End date should be after start date if both exist
          if (this.startDate && value) {
            return value >= this.startDate;
          }
          return true;
        },
        message: "End date must be after start date",
      },
    },
    status: {
      type: String,
      enum: {
        values: MILESTONE_STATUSES,
        message: "{VALUE} is not a valid milestone status",
      },
      default: MilestoneStatus.NOT_STARTED,
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: [true, "Creator reference is required"],
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

// Compound indexes for common queries
milestoneSchema.index({ project: 1, endDate: 1 }); // Project timeline view
milestoneSchema.index({ endDate: 1, status: 1 }); // Find overdue/upcoming milestones
milestoneSchema.index({ project: 1, status: 1 }); // Project milestones by status

// ====================== VIRTUAL POPULATES ======================

// Virtual populate for project details
milestoneSchema.virtual("projectDetails", {
  ref: "Project",
  localField: "project",
  foreignField: "_id",
  justOne: true,
});

// ====================== INSTANCE METHODS ======================

// Check if milestone is overdue
milestoneSchema.methods.isOverdue = function (): boolean {
  if (
    !this.endDate ||
    this.status === "COMPLETED" ||
    this.status === "CANCELLED"
  ) {
    return false;
  }
  return new Date() > this.endDate;
};

// Check if milestone is active
milestoneSchema.methods.isActive = function (): boolean {
  return this.status === "ACTIVE";
};

// ====================== STATIC METHODS ======================

// Find overdue milestones
milestoneSchema.statics.findOverdue = function () {
  return this.find({
    endDate: { $lt: new Date() },
    status: { $nin: ["COMPLETED", "CANCELLED"] },
  });
};

// Find milestones ending within a date range
milestoneSchema.statics.findEndingBetween = function (
  startDate: Date,
  endDate: Date
) {
  return this.find({
    endDate: {
      $gte: startDate,
      $lte: endDate,
    },
    status: { $nin: ["COMPLETED", "CANCELLED"] },
  });
};

// ====================== MIDDLEWARE ======================

// Pre-save middleware
milestoneSchema.pre("save", function (next) {
  // Auto-convert name to title case if needed
  if (this.isModified("name")) {
    this.name = this.name.trim();
  }
  next();
});

// ====================== MODEL EXPORT ======================

const Milestone = mongoose.model<IMilestone>("Milestone", milestoneSchema);

export default Milestone;
