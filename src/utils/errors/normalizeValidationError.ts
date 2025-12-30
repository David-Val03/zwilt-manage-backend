import { Request } from "express";
import { ErrorResponse, NormalizedError } from "./types";
import { ValidationError } from "../validate";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants";

export function normalizeValidationError(
  error: ValidationError,
  req: Request,
  includeStack: boolean
): NormalizedError {
  const requestId = (req as any).id;
  const isDevelopment = process.env.NODE_ENV !== "production";

  const response: ErrorResponse = {
    type: "ValidationError",
    message: error.message || ERROR_MESSAGES.VALIDATION_FAILED,
    timestamp: new Date().toISOString(),
    code: "VALIDATION_ERROR",
    ...(error.field && isDevelopment && { details: { field: error.field } }),
    ...(requestId && { requestId }),
    ...(includeStack && error.stack && { stack: error.stack }),
  };

  return { response, statusCode: HTTP_STATUS.BAD_REQUEST };
}
