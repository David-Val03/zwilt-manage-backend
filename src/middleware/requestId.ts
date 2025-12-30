import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware to attach a unique request ID to each incoming request
 * The ID is generated using UUID v4 and attached to the req object
 * This allows tracking of requests throughout their lifecycle
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate a unique ID for this request
  const requestId = uuidv4();

  // Attach the ID to the request object
  (req as any).id = requestId;

  // Also attach it to the response headers for client reference
  res.setHeader("X-Request-ID", requestId);

  next();
};
