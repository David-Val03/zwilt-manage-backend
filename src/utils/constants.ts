// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================

/**
 * Ticket status constants
 */
export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
}
export type TicketStatusType = `${TicketStatus}`;

/**
 * Ticket priority constants
 */
export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}
export type TicketPriorityType = `${TicketPriority}`;

/**
 * Ticket type constants
 */
export enum TicketType {
  BUG = "bug",
  FEATURE = "feature",
  ENHANCEMENT = "enhancement",
  TASK = "task",
}
export type TicketTypeType = `${TicketType}`;

/**
 * Sprint status constants
 */
export enum SprintStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
export type SprintStatusType = `${SprintStatus}`;

/**
 * Project status constants
 */
export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}
export type ProjectStatusType = `${ProjectStatus}`;

/**
 * Milestone status constants
 */
export enum MilestoneStatus {
  NOT_STARTED = "NOT STARTED",
  IN_PROGRESS = "IN PROGRESS",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
}
export type MilestoneStatusType = `${MilestoneStatus}`;

/**
 * Enum values as arrays for Mongoose schemas
 */
export const TICKET_STATUSES = Object.values(TicketStatus);
export const TICKET_PRIORITIES = Object.values(TicketPriority);
export const TICKET_TYPES = Object.values(TicketType);
export const SPRINT_STATUSES = Object.values(SprintStatus);
export const PROJECT_STATUSES = Object.values(ProjectStatus);
export const MILESTONE_STATUSES = Object.values(MilestoneStatus);

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  ALL_FIELDS_REQUIRED: "All fields are required",
  NOT_FOUND: "Entity not found",
  INTERNAL_ERROR: "Internal server error",
  VALIDATION_FAILED: "Validation failed",
  DATABASE_ERROR: "Database operation failed",
  RESOURCE_NOT_FOUND: "Requested resource not found",
  UNAUTHORIZED_ACCESS: "Unauthorized access",
  FORBIDDEN_ACTION: "Action not permitted",
  BAD_INPUT: (name: string) => `Bad input for ${name}`,
  MISSING_REQUIRED_FIELDS: "Invalid inputs for required fields",
  TICKET_NOT_FOUND: "Ticket not found",
  INVALID_TICKET_STATUS: "Invalid ticket status",
  INVALID_TICKET_PRIORITY: "Invalid ticket priority",
  INVALID_TICKET_TYPE: "Invalid ticket type",
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  TICKET_CREATED: "Ticket created successfully",
  TICKET_UPDATED: "Ticket updated successfully",
  TICKET_DELETED: "Ticket deleted successfully",
  TICKET_RETRIEVED: "Ticket retrieved successfully",
  TICKETS_RETRIEVED: "Tickets retrieved successfully",
};

/**
 * Query constants
 */
export const DEFAULT_QUERY_CONFIG = {
  limit: 50,
  sort: "createdAt desc",
  lean: true,
};

/**
 * Server constants
 */
export const SERVER = {
  PORT: parseInt(process.env.PORT || "8081"),
};
