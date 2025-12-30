import { Request } from "express";
import { ErrorResponse, NormalizedError } from "./types";
import { ERROR_MESSAGES } from "../constants";

export function normalizeApplicationError(
  error: any,
  req: Request,
  includeStack: boolean
): NormalizedError {
  const requestId = (req as any).id;
  const isDevelopment = process.env.NODE_ENV !== "production";

  const response: ErrorResponse = {
    type: error.name || "ApplicationError",
    message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
    ...(error.code && { code: error.code }),
    ...(isDevelopment && error.details && { details: error.details }),
    ...(requestId && { requestId }),
    ...(includeStack && error.stack && { stack: error.stack }),
  };

  return { response: response, statusCode: error.statusCode };
}
