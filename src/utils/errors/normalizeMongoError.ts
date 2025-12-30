import { Request } from "express";
import { ErrorResponse, NormalizedError } from "./types";
import { MongoErrorNormalizer } from "../mongoErrorNormalizer";
import { HTTP_STATUS } from "../constants";

export function normalizeMongoError(
  error: any,
  req: Request,
  includeStack: boolean
): NormalizedError {
  const requestId = (req as any).id;
  const isDevelopment = process.env.NODE_ENV !== "production";
  const mongoError = new MongoErrorNormalizer(error);

  const response: ErrorResponse = {
    type: "DatabaseError",
    message: mongoError.message || "Database operation failed",
    timestamp: new Date().toISOString(),
    ...(mongoError.mongoErrorCode && {
      code: mongoError.mongoErrorCode.toString(),
    }),
    ...(isDevelopment && error.keyValue && { details: error.keyValue }),
    ...(requestId && { requestId }),
    ...(includeStack && error.stack && { stack: error.stack }),
  };

  return { response, statusCode: HTTP_STATUS.BAD_REQUEST };
}
