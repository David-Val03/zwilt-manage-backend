import { Request } from "express";
import { ErrorResponse, NormalizedError } from "./types";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants";

export function normalizeInternalError(
  error: any,
  req: Request,
  includeStack: boolean
): NormalizedError {
  const requestId = (req as any).id;

  const response: ErrorResponse = {
    type: "InternalServerError",
    message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
    code: "INTERNAL_ERROR",
    ...(requestId && { requestId }),
    ...(includeStack && error.stack && { stack: error.stack }),
  };

  return { response, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR };
}
