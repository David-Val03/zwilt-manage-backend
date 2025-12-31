import { Router } from "express";
import { getMyMetricsController } from "../controllers/user";
import { authMiddleware } from "../middleware/auth";

// ============================================================================
// USER ROUTER
// ============================================================================

const UserRouter = Router();

/**
 * GET /api/user/metrics - Get dashboard metrics for authenticated user (requires auth)
 */
UserRouter.get(
  "/metrics/:organisationId",
  authMiddleware,
  getMyMetricsController
);

export default UserRouter;
