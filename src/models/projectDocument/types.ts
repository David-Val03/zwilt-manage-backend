import { Document } from "mongoose";

export interface IProjectDocument extends Document {
  project: string; // ProjectID as validated string
  name: string;
  url: string;
  type?: string; // MIME type
  size?: number; // File size in bytes
  uploadedBy: string; // UserID as validated string
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
