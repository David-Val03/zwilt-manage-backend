import { ITicket } from "../types";

/**
 * Auto-derive parent ticket status from subtask statuses
 * Implements complex business logic for status propagation
 */
export function pre_deriveStatusFromSubtasks(this: ITicket): void {
  if (this.isModified("subtasks") && this.subtasks?.length) {
    const statuses = this.subtasks.map((s: any) => s.status || "Backlog");

    const hasBlocked = statuses.includes("Blocked");
    const allDone = statuses.every((s) => s === "Done");
    const hasOngoing = statuses.includes("Ongoing");
    const hasQA = statuses.includes("QA");
    const allBacklog = statuses.every((s) => s === "Backlog");
    const onlyDoneOrQA = statuses.every((s) => s === "Done" || s === "QA");

    let newStatus: "Backlog" | "Ongoing" | "Blocked" | "QA" | "Done" =
      "Backlog";

    if (hasBlocked) newStatus = "Blocked";
    else if (allDone) newStatus = "QA"; // Move to QA when all subtasks done
    else if (hasQA && onlyDoneOrQA) newStatus = "QA";
    else if (hasOngoing) newStatus = "Ongoing";
    else if (allBacklog) newStatus = "Backlog";
    else newStatus = "Ongoing";

    this.status = newStatus;
  }
}
