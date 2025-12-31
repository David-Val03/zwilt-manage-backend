import { ISprint } from "../types";

/**
 * Calculate total and completed points for this sprint
 * Queries all tickets in the sprint and sums their points
 */
export async function calculatePoints(
  this: ISprint
): Promise<{ totalPoints: number; completedPoints: number }> {
  // Import Ticket model dynamically to avoid circular dependencies
  const mongoose = require("mongoose");
  const Ticket = mongoose.model("Ticket");

  const tickets = await Ticket.find({
    _id: { $in: this.tickets },
    deleted: { $ne: true },
  }).select("points status");

  this.totalPoints = tickets.reduce(
    (sum: number, ticket: any) => sum + (ticket.points || 0),
    0
  );

  this.completedPoints = tickets
    .filter((ticket: any) => ticket.status === "Done")
    .reduce((sum: number, ticket: any) => sum + (ticket.points || 0), 0);

  return {
    totalPoints: this.totalPoints ?? 0,
    completedPoints: this.completedPoints ?? 0,
  };
}
