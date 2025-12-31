import { Schema } from "mongoose";
import { ITicketImage } from "../ticket/types";

// ====================== TICKET IMAGE SCHEMA ======================

export const TicketImageSchema = new Schema<ITicketImage>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: false },
  type: { type: String, required: false },
});
