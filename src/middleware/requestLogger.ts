import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Middleware to log incoming and outgoing HTTP requests
 * Logs include:
 * - Request method, URL, and request ID
 * - Response status code, latency (ms), and request ID
 * - All logs are in JSON format with GMT timestamps
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Record the start time
  const startTime = Date.now();
  const requestId = (req as any).id;

  // Log incoming request
  logger.info("Incoming request", {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Capture the original res.end function
  const originalEnd = res.end.bind(res);

  // Override res.end to log the response
  res.end = function (...args: any[]): Response {
    // Calculate latency
    const latency = Date.now() - startTime;

    // Log outgoing response
    logger.info("Outgoing response", {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      latency: `${latency}ms`,
    });

    // Call the original end function
    originalEnd(...args);
    return res;
  } as any;

  next();
};
