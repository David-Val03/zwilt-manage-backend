import { Router } from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectController,
  getMyProjectsController,
  updateProjectController,
  deleteProjectController,
  addProjectMemberController,
  getProjectMembersController,
  updateProjectMemberRoleController,
  removeProjectMemberController,
  getSignedUrlController,
} from "../controllers";
import { authMiddleware } from "../middleware/auth";

export const ProjectRouter = Router();

// ============================================================================
// PROJECT ROUTES
// ============================================================================

/**
 * GET /api/projects/my - Get projects I'm a member of (requires auth)
 */
ProjectRouter.get("/my", authMiddleware, getMyProjectsController);

/**
 * GET /api/projects/signed-url - Get S3 signed URL for upload
 */
ProjectRouter.post("/signed-url", authMiddleware, getSignedUrlController);

/**
 * GET /api/projects - Get all projects
 */
ProjectRouter.get("/", getProjectsController);

/**
 * POST /api/projects - Create a new project
 */
ProjectRouter.post("/", createProjectController);

/**
 * GET /api/projects/:projectId - Get a single project
 */
ProjectRouter.get("/:projectId", getProjectController);

/**
 * PUT /api/projects/:projectId - Update a project
 */
ProjectRouter.put("/:projectId", updateProjectController);

/**
 * DELETE /api/projects/:projectId - Delete a project (soft delete)
 */
ProjectRouter.delete("/:projectId", deleteProjectController);

// ============================================================================
// PROJECT MEMBER ROUTES (Nested)
// ============================================================================

/**
 * GET /api/projects/:projectId/members - Get all members of a project
 */
ProjectRouter.get("/:projectId/members", getProjectMembersController);

/**
 * POST /api/projects/:projectId/members - Add a member to a project
 */
ProjectRouter.post("/:projectId/members", addProjectMemberController);

/**
 * PATCH /api/projects/:projectId/members/:userId - Update member role
 */
ProjectRouter.patch(
  "/:projectId/members/:userId",
  updateProjectMemberRoleController
);

/**
 * DELETE /api/projects/:projectId/members/:userId - Remove member from project
 */
ProjectRouter.delete(
  "/:projectId/members/:userId",
  removeProjectMemberController
);
