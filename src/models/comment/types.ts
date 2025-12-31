import { Document, Types } from "mongoose";

/**
 * Media attachment interface
 */
export interface ICommentMedia {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

/**
 * Mentioned user interface
 */
export interface ICommentMention {
  _id: string;
  name: string;
  email: string;
}

/**
 * Read tracking interface
 */
export interface IReadBy {
  userId: string; // User ID from auth backend
  readAt: Date;
}

/**
 * Comment document interface
 */
export interface IComment extends Document {
  ticketId: Types.ObjectId;
  author: string; // User ID from auth backend
  media?: ICommentMedia[];
  mentions?: ICommentMention[];
  message: string;
  readBy: IReadBy[];
  createdAt: Date;
}
