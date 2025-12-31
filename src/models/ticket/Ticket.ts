import mongoose, { Schema } from "mongoose";
import { ITicket } from "./types";
import { SubtaskSchema } from "../schemas/Subtask.schema";
import { ChecklistItemSchema } from "../schemas/ChecklistItem.schema";
import { TicketImageSchema } from "../schemas/TicketImage.schema";
import { TimeLogSchema } from "../schemas/TimeLog.schema";
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_TYPES,
} from "../../utils/constants";

// ====================== TICKET SCHEMA ======================

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    priority: {
      type: String,
      required: false,
      enum: TICKET_PRIORITIES,
    },
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    project: {
      type: String,
      required: false,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    milestone: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string) {
          return !value || mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid milestone ID format",
      },
      index: true,
    },
    ticketKey: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      immutable: true, // Cannot be changed after creation
    },
    images: [TicketImageSchema],
    video: {
      type: String,
      required: false,
      default: null,
    },
    assignees: {
      type: [String],
      default: [],
      validate: {
        validator: function (values: string[]) {
          return values.every((v) => mongoose.Types.ObjectId.isValid(v));
        },
        message: "Invalid assignee user ID format in array",
      },
    },
    ticketType: {
      type: String,
      enum: TICKET_TYPES,
      required: false,
      default: "task",
    },
    dueDate: {
      type: Date,
      required: false,
      default: null,
    },
    points: {
      type: Number,
      required: false,
      default: 0,
      min: [0, "Points cannot be negative"],
    },
    dependsOn: {
      type: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
      default: [],
    },
    blockedBy: { type: Boolean, default: false },
    flaggedByDependencies: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    subtasks: { type: [SubtaskSchema], default: [] },
    checklist: { type: [ChecklistItemSchema], default: [] },
    totalTimeSeconds: { type: Number, default: 0 },
    totalTimeByUser: { type: Map, of: Number, default: {} },
    timeLogs: { type: [TimeLogSchema], default: [] },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ====================== VIRTUALS ======================

// Completion percentage based on subtasks and checklist
ticketSchema.virtual("completionPercentage").get(function () {
  const totalItems =
    (this.subtasks?.length || 0) + (this.checklist?.length || 0);
  if (totalItems === 0) return 100;

  const completedSubtasks =
    this.subtasks?.filter((s: any) => s.status === "Done").length || 0;
  const completedChecklist =
    this.checklist?.filter((c: any) => c.checked).length || 0;

  return Math.round(
    ((completedSubtasks + completedChecklist) / totalItems) * 100
  );
});

// Virtual to populate ticket comments (opt-in via .populate('comments'))
ticketSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "ticketId",
});

// ====================== HOOKS ======================

// Auto-generate ticket key if not set and project is available
ticketSchema.pre("save", async function () {
  if (!this.ticketKey && this.projectId) {
    // Fetch project to get the project name
    const project = (await mongoose
      .model("Project")
      .findById(this.projectId)
      .select("projectName")
      .lean()) as { projectName: string } | null;

    if (!project?.projectName) {
      throw new Error("Project not found or has no name");
    }

    const projectName = project.projectName;

    const words = projectName
      .trim()
      .split(/\s+/)
      .filter((word: string) => word.length > 0)
      .map((word: string) => word.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
      .filter((word: string) => word.length > 0);

    let prefix = "";
    if (words.length === 0) {
      prefix = "TKT";
    } else {
      let charIndex = 0;
      while (prefix.length < 3 && charIndex < 10) {
        for (const word of words) {
          if (prefix.length >= 3) break;
          if (charIndex < word.length) {
            prefix += word[charIndex];
          }
        }
        charIndex++;
      }
      prefix = prefix.length < 3 ? prefix.padEnd(3, "X") : prefix.slice(0, 3);
    }

    const latestTicket = (await mongoose
      .model("Ticket")
      .findOne({
        ticketKey: { $regex: `^${prefix}-\\d{3}$`, $options: "i" },
      })
      .sort({ createdAt: -1 })
      .select("ticketKey")
      .lean()) as { ticketKey: string } | null;

    let nextNumber = 1;
    if (latestTicket?.ticketKey) {
      const currentNumber = parseInt(latestTicket.ticketKey.split("-")[1]);
      nextNumber = currentNumber + 1;
    }

    if (nextNumber > 999) {
      throw new Error(`Maximum ticket number reached for prefix ${prefix}`);
    }

    this.ticketKey = `${prefix}-${String(nextNumber).padStart(3, "0")}`;
  }
});

// Auto-compute blockedBy from dependencies
ticketSchema.pre("save", async function () {
  if (this.isModified("dependsOn") && this.dependsOn?.length) {
    const deps = await mongoose
      .model("Ticket")
      .find({ _id: { $in: this.dependsOn } })
      .select("status")
      .lean();

    this.blockedBy = deps.some((dep: any) => dep.status !== "Done");
  } else if (!this.dependsOn?.length) {
    this.blockedBy = false;
  }
});

// Auto-derive parent status from subtasks
ticketSchema.pre("save", function () {
  if (this.isModified("subtasks") && this.subtasks?.length) {
    const statuses = this.subtasks.map((s: any) => s.status || "Backlog");

    const hasBlocked = statuses.includes("Blocked");
    const allDone = statuses.every((s: string) => s === "Done");
    const hasOngoing = statuses.includes("Ongoing");
    const hasQA = statuses.includes("QA");
    const allBacklog = statuses.every((s: string) => s === "Backlog");
    const onlyDoneOrQA = statuses.every(
      (s: string) => s === "Done" || s === "QA"
    );

    let newStatus: "Backlog" | "Ongoing" | "Blocked" | "QA" | "Done" =
      "Backlog";

    if (hasBlocked) newStatus = "Blocked";
    else if (allDone) newStatus = "QA"; // Move to QA when all subtasks done
    else if (hasQA && onlyDoneOrQA) newStatus = "QA";
    else if (hasOngoing) newStatus = "Ongoing";
    else if (allBacklog) newStatus = "Backlog";
    else newStatus = "Ongoing";

    this.status = newStatus;
  }
});

// Cascade delete comments and activities when ticket is deleted
ticketSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    // Import models dynamically to avoid circular dependencies
    const Comment = mongoose.model("Comment");
    const TicketActivity = mongoose.model("TicketActivity");

    await Comment.deleteMany({ ticketId: doc._id });
    await TicketActivity.deleteMany({ ticketId: doc._id });
  }
  next();
});

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
