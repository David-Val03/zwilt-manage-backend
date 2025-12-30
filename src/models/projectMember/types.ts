import { Document } from "mongoose";

/**
 * Project member role enum
 */
type ProjectMemberRole = "MEMBER" | "MANAGER" | "QA" | "ADMIN";

/**
 * Project member document interface
 */
export interface IProjectMember extends Document {
  project: string; // Project ID
  user: string; // User ID from auth backend
  role: ProjectMemberRole;
  addedAt: Date;
  addedBy: string; // User ID who added this member
  createdAt: Date;
  updatedAt: Date;
}
