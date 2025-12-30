import { RequestHandler } from "express";
import { ProjectMember } from "../../models/projectMember";
import { Project } from "../../models/project";
import mongoose from "mongoose";

// ============================================================================
// GET MY PROJECTS CONTROLLER
// ============================================================================

/**
 * Get all projects where the authenticated user is a member
 * Returns projects with basic info and user's role
 */

export const getMyProjectsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const memberships = await ProjectMember.find({
      user: userId,
    })
      .select("project role")
      .lean();

    if (!memberships.length) {
      return res.status(200).json({
        success: true,
        projects: [],
        count: 0,
      });
    }

    const projectIds = memberships.map((m) => m.project);

    const projects = await Project.find({
      _id: { $in: projectIds },
      status: { $ne: "DELETED" },
    })
      .select("projectName description status key projectImage createdAt")
      .populate("milestones")
      .lean();

    return res.json({
      success: true,
      projects: projects,
      count: projects.length,
    });
  } catch (error) {
    next(error);
  }
};
