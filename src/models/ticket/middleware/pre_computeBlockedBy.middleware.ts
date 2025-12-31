import mongoose from "mongoose";
import { ITicket } from "../types";

/**
 * Auto-compute blockedBy from dependencies
 * Checks if any dependency ticket is not 'Done'
 */
export async function pre_computeBlockedBy(this: ITicket): Promise<void> {
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
}
