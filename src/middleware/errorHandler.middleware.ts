import { NextFunction, Request, Response } from "express";
import httpErrors from "http-errors";
const { isHttpError } = httpErrors;
import { logger } from "../utils";
import { ValidationError } from "../utils/validate";
import mongoose from "mongoose";
import {
  normalizeHttpError,
  normalizeValidationError,
  normalizeMongoError,
  normalizeMongooseValidationError,
  normalizeApplicationError,
  normalizeInternalError,
} from "../utils/errors";

export type ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

const MONGO_ERRORS = ["MongoServerError", "MongoBulkWriteError"];

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next: NextFunction
) => {
  const requestId = (req as any).id;

  // Log error with request context
  const logLevel = process.env.LOG_LEVEL || "info";
  const includeStack = ["debug", "silly"].includes(logLevel);

  logger.error(err.message || "Error occurred", {
    requestId,
    method: req.method,
    url: req.url,
    errorType: err.name,
    ...(includeStack && { stack: err.stack }),
  });

  let result;

  // Custom ValidationError
  if (err instanceof ValidationError) {
    result = normalizeValidationError(err, req, includeStack);
  }
  // HTTP Errors (from http-errors package)
  else if (isHttpError(err)) {
    result = normalizeHttpError(err, req, includeStack);
  }
  // Custom errors with statusCode
  else if (err.statusCode && typeof err.statusCode === "number") {
    result = normalizeApplicationError(err, req, includeStack);
  }
  // Validation Errors (Mongoose) - must check before generic mongoose.Error
  else if (err instanceof mongoose.Error.ValidationError) {
    result = normalizeMongooseValidationError(err, req, includeStack);
  }
  // MongoDB Errors
  else if (MONGO_ERRORS.includes(err.name) || err instanceof mongoose.Error) {
    result = normalizeMongoError(err, req, includeStack);
  }
  // Default Internal Server Error
  else {
    result = normalizeInternalError(err, req, includeStack);
  }

  return res.status(result.statusCode).json(result.response);
};
