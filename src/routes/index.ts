import { Router } from "express";
import DatabaseService from "../services/database";
import { ProjectRouter } from "./project.router";
import UserRouter from "./user.router";

export const BaseRouter = Router();

/**
 * Root endpoint - API information
 */
BaseRouter.get("/", async (req, res) => {
  res.json({
    message: "Zwilt Ticketing API",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: {
      user: {
        metrics: "GET /api/user/metrics",
      },
      projects: {
        my: "GET /api/projects/my",
        list: "GET /api/projects",
        get: "GET /api/projects/:projectId",
        create: "POST /api/projects",
        update: "PUT /api/projects/:projectId",
        delete: "DELETE /api/projects/:projectId",
        members: {
          list: "GET /api/projects/:projectId/members",
          add: "POST /api/projects/:projectId/members",
          update: "PATCH /api/projects/:projectId/members/:userId",
          remove: "DELETE /api/projects/:projectId/members/:userId",
        },
      },

      health: "GET /health",
    },
  });
});

/**
 * Health check endpoint
 */
BaseRouter.get("/health", (req, res) => {
  const dbStatus = DatabaseService.getInstance().getConnectionStatus();

  res.json({
    status: "OK",
    database: dbStatus ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Mount routers
BaseRouter.use("/api/user", UserRouter);
BaseRouter.use("/api/projects", ProjectRouter);
