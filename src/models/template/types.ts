import { Document, Types } from "mongoose";
import { ISubtask, IChecklistItem } from "../ticket/types";

/**
 * Ticket template document interface
 */
export interface ITicketTemplate extends Document {
  name: string;
  defaultTitle?: string;
  description?: string;
  priority?: "urgent" | "high" | "medium" | "low";
  defaultStatus?: "Backlog" | "Ongoing" | "Blocked" | "QA" | "Done";
  project?: string;
  defaultAssignees?: string[]; // User IDs from auth backend
  ticketType?: "bug" | "feature" | "enhancement" | "task";
  defaultPoints?: number;
  defaultDueDateOffset?: number | null;
  defaultChecklist?: IChecklistItem[];
  defaultSubtasks?: ISubtask[];
  createdBy: string; // User ID from auth backend
  archived: boolean;
  createdAt: Date;
}
