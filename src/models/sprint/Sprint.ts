import mongoose, { Schema } from "mongoose";
import { ISprint } from "./types";
import { calculatePoints } from "./methods/calculatePoints.method";
import { SPRINT_STATUSES } from "../../utils/constants";

// ====================== SPRINT SCHEMA ======================

const sprintSchema = new Schema<ISprint>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      required: false,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: ISprint, value: Date) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    status: {
      type: String,
      enum: SPRINT_STATUSES,
      default: "planned",
      required: true,
    },
    project: {
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    tickets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ticket",
        default: [],
      },
    ],
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
    completedAt: {
      type: Date,
      required: false,
      default: null,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    velocity: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ====================== INDEXES ======================

sprintSchema.index({ projectId: 1, status: 1 });
sprintSchema.index({ projectId: 1, startDate: -1 });

// ====================== VIRTUALS ======================

sprintSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    this.status === "active" && this.startDate <= now && this.endDate >= now
  );
});

// Progress percentage
sprintSchema.virtual("progress").get(function () {
  if (!this.totalPoints || this.totalPoints === 0) return 0;
  return Math.round(((this.completedPoints || 0) / this.totalPoints) * 100);
});

// Days remaining in sprint
sprintSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  if (now > this.endDate) return 0;
  if (now < this.startDate) return null; // Not started

  const diff = this.endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Check if sprint is overdue
sprintSchema.virtual("isOverdue").get(function () {
  return this.status !== "completed" && new Date() > this.endDate;
});

// ====================== METHODS ======================

sprintSchema.methods.calculatePoints = calculatePoints;

// ====================== HOOKS ======================

sprintSchema.pre("save", function (next) {
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
    this.velocity = this.completedPoints || 0;
  }
  next();
});

export const Sprint = mongoose.model<ISprint>("Sprint", sprintSchema);
