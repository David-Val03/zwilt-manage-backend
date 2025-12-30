import { Document, Types } from "mongoose";

/**
 * Project status enum
 */
export type ProjectStatusType = "ACTIVE" | "ARCHIVED" | "DELETED";

/**
 * Project document interface
 */
export interface IProject extends Document {
  projectName: string;
  projectImage?: string;
  key?: string; // Short project key like "PROJ"
  description?: string;
  status: ProjectStatusType;
  organization?: string; // MongoDB ID string (auth backend)
  createdBy: string; // MongoDB ID string (auth backend)
  createdAt: Date;
  updatedAt: Date;
  // Virtual fields
  tickets?: any[];
  milestones?: any[];
  ticketCount?: number;
  milestoneCount?: number;

  // Note: Project membership (members, managers, qa) is managed via ProjectMember model
}
