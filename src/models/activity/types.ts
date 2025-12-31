import { Document, Types } from "mongoose";

/**
 * Ticket activity document interface
 */
export interface ITicketActivity extends Document {
  ticketId: Types.ObjectId;
  author: string; // User ID from auth backend
  action: string;
  details: string;
  message: string;
  createdAt: Date;
}
