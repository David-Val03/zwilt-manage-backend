import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

/**
 * Extract and decode JWT token from Authorization header
 * Sets req.user with decoded user information
 * Does NOT validate the token - assumes auth service already validated it
 */

interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { id: string }; // Add id for convenience
    }
  }
}

export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided");
      throw createHttpError.Unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Invalid token format");
      throw createHttpError.Unauthorized("Invalid token format");
    }

    // Decode token (without verification since auth service already validated it)
    // If you want to verify, use jwt.verify() with the JWT_SECRET
    const decoded = jwt.decode(token) as JWTPayload;

    if (!decoded || !decoded.userId) {
      console.log("Invalid token payload", decoded, token);
      throw createHttpError.Unauthorized("Invalid token payload");
    }

    // Set user info on request object with id mapped from userId for convenience
    req.user = {
      ...decoded,
      id: decoded.userId, // Map userId to id for easier access
    };

    next();
  } catch (error: any) {
    // If it's already an HTTP error, pass it through
    if (error.status) {
      next(error);
    } else {
      // Otherwise, create a new Unauthorized error
      next(createHttpError.Unauthorized("Authentication failed"));
    }
  }
};

/**
 * Optional auth middleware - doesn't throw error if no token
 * Useful for endpoints that work with or without authentication
 */
export const optionalAuthMiddleware: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.decode(token) as JWTPayload;

      if (decoded && decoded.userId) {
        req.user = {
          ...decoded,
          id: decoded.userId, // Map userId to id
        };
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
