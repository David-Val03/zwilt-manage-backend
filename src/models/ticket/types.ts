import { Document, Types } from "mongoose";

/**
 * Ticket image/attachment interface
 */
export interface ITicketImage {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

/**
 * Time log entry interface - tracks individual time entries
 */
export interface ITimeLog {
  userId: string; // User ID from auth backend
  seconds: number;
  loggedAt: Date;
}

/**
 * Subtask interface
 */
export interface ISubtask {
  _id?: Types.ObjectId;
  title: string;
  done?: boolean; // Deprecated: kept for backward compatibility
  status?: "Backlog" | "Ongoing" | "Blocked" | "QA" | "Done";
  assignee?: string | null; // User ID from auth backend
  dueDate?: Date | null;
  createdAt: Date;
}

/**
 * Checklist item interface
 */
export interface IChecklistItem {
  _id?: Types.ObjectId;
  text: string;
  checked: boolean;
  createdAt: Date;
}

/**
 * Main ticket document interface
 */
export interface ITicket extends Document {
  title: string;
  description?: string;
  priority?: string;
  status: string;
  assignee?: string;
  createdAt: Date;
  project?: string;
  projectId?: Types.ObjectId | string;
  milestone?: string; // Reference to Milestone (stored as string ID)
  ticketKey?: string;
  images?: ITicketImage[];
  video?: string | null;
  assignees?: string[];
  ticketType?: string;
  dueDate?: Date | null;
  points?: number;
  dependsOn?: Types.ObjectId[];
  blockedBy?: boolean;
  flaggedByDependencies?: boolean;
  deleted?: boolean;
  archived?: boolean;
  subtasks?: ISubtask[];
  checklist?: IChecklistItem[];
  labels?: string[];
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  reporter?: string;
  watchers?: string[];
  createdBy?: string;
  updatedAt: Date;

  // Time tracking fields
  totalTimeSeconds?: number;
  totalTimeByUser?: Map<string, number>;
  timeLogs?: ITimeLog[];

  // Virtual fields
  comments?: any[];
}
