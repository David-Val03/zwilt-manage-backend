import { Request, Response, NextFunction } from "express";
import { ProjectMember } from "../models/projectMember";
import { Forbidden, Unauthorized } from "http-errors";

// ============================================================================
// PROJECT AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Check if user is a member of the project (any role)
 */
export const isProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      throw new Unauthorized("Authentication required");
    }

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership) {
      throw new Forbidden("You are not a member of this project");
    }

    // Attach membership to request for use in controllers
    (req as any).projectMembership = membership;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has specific role(s) in the project
 */
export const hasProjectRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        throw new Unauthorized("Authentication required");
      }

      const membership = await ProjectMember.findOne({
        project: projectId,
        user: userId,
      });

      if (!membership) {
        throw new Forbidden("You are not a member of this project");
      }

      if (!allowedRoles.includes(membership.role)) {
        throw new Forbidden(
          `This action requires one of these roles: ${allowedRoles.join(", ")}`
        );
      }

      // Attach membership to request for use in controllers
      (req as any).projectMembership = membership;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is a project admin (ADMIN or MANAGER)
 */
export const isProjectAdmin = hasProjectRole("ADMIN", "MANAGER");

/**
 * Check if user is a project owner (ADMIN only)
 */
export const isProjectOwner = hasProjectRole("ADMIN");
