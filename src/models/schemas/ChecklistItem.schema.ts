import { Schema } from "mongoose";
import { IChecklistItem } from "../ticket/types";

// ====================== CHECKLIST ITEM SCHEMA ======================

export const ChecklistItemSchema = new Schema<IChecklistItem>({
  text: { type: String, required: true },
  checked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
