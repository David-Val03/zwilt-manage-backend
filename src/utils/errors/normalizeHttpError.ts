import { Request } from "express";
import { ErrorResponse, NormalizedError } from "./types";

export function normalizeHttpError(
  error: any,
  req: Request,
  includeStack: boolean
): NormalizedError {
  const requestId = (req as any).id;

  const response: ErrorResponse = {
    type: "HttpError",
    message: error.message,
    timestamp: new Date().toISOString(),
    ...(error.code && { code: error.code }),
    ...(requestId && { requestId }),
    ...(includeStack && error.stack && { stack: error.stack }),
  };

  return { response, statusCode: error.statusCode };
}
