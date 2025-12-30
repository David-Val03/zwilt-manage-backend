import { Request } from "express";
import mongoose from "mongoose";
import { ErrorResponse, NormalizedError } from "./types";
import { HTTP_STATUS } from "../constants";

export function normalizeMongooseValidationError(
  error: mongoose.Error.ValidationError,
  req: Request,
  includeStack: boolean
): NormalizedError {
  const requestId = (req as any).id;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const validationDetails = Object.values(error.errors).map((error) => ({
    field: error.path,
    message: error.message,
  }));

  const response: ErrorResponse = {
    type: "ValidationError",
    message: "Validation failed",
    timestamp: new Date().toISOString(),
    code: "VALIDATION_FAILED",
    ...(isDevelopment && { details: validationDetails }),
    ...(requestId && { requestId }),
    ...(includeStack && error.stack && { stack: error.stack }),
  };

  return { response, statusCode: HTTP_STATUS.BAD_REQUEST };
}
