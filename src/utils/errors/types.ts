import { Request } from "express";

export interface ErrorResponse {
  type: string;
  message: string;
  code?: string;
  details?: any;
  requestId?: string;
  timestamp: string;
  stack?: string;
}

export interface NormalizedError {
  response: ErrorResponse;
  statusCode: number;
}

export type ErrorNormalizer = (
  error: any,
  req: Request,
  includeStack: boolean
) => NormalizedError;
