import { Request, Response, NextFunction } from "express";
import { BadRequest } from "http-errors";
import { ProjectMember, Project } from "../../models";
import Milestone from "../../models/milestone/Milestone";

// ============================================================================
// GET MY METRICS CONTROLLER
// ============================================================================

/**
 * Get dashboard metrics for authenticated user
 * Returns:
 * - Count of assigned projects
 * - Count of assigned tickets
 * - Count of overdue tasks
 */

export const getMyMetricsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequest("User ID is required");
    }

    const AUTH_URL = process.env.AUTH_URL || "http://localhost:8080/api";
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new BadRequest("Authentication token required for metrics");
    }

    // 1. Fetch Profile to determine roles
    const profileRes = await fetch(`${AUTH_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!profileRes.ok) {
      // Fallback or error? If auth service is down, we can't determine role.
      console.error("Failed to fetch profile for metrics", profileRes.status);
    }

    const profile = profileRes.ok ? ((await profileRes.json()) as any) : null;

    // Check if user is an OWNER in any organization
    const ownedOrgs =
      profile?.organizations?.filter((org: any) =>
        org.roles?.some((role: string) => role.toLowerCase() === "owner")
      ) || [];

    const isOwner = ownedOrgs.length > 0;

    if (isOwner) {
      // OWNER METRICS
      const ownedOrgIds = ownedOrgs.map((org: any) => org.organizationId);

      // Fetch user counts from Auth Service
      const [activeMembersRes, projectManagersRes] = await Promise.all([
        fetch(`${AUTH_URL}/users?status=ACTIVE`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${AUTH_URL}/users?role=project_manager`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const activeMembersData = activeMembersRes.ok
        ? ((await activeMembersRes.json()) as any)
        : { total: 0 };
      const projectManagersData = projectManagersRes.ok
        ? ((await projectManagersRes.json()) as any)
        : { total: 0 };

      // Count ACTIVE projects in owned organizations
      // Project model stores organization as verified string
      const activeProjects = await Project.countDocuments({
        organization: { $in: ownedOrgIds },
        status: "ACTIVE",
      });

      res.status(200).json({
        metrics: {
          activeProjects,
          activeMembers: activeMembersData.total || 0,
          projectManagers: projectManagersData.total || 0,
        },
      });
    } else {
      // MEMBER METRICS (Existing logic)

      // Get all project IDs where user is a member
      const userProjects = await ProjectMember.find({
        user: userId,
      }).select("project");

      const projectIds = userProjects.map((pm) => pm.project);

      const [assignedProjects, totalMilestones] = await Promise.all([
        ProjectMember.countDocuments({
          user: userId,
        }),
        Milestone.countDocuments({
          project: { $in: projectIds },
        }),
      ]);

      res.status(200).json({
        metrics: {
          assignedProjects,
          totalMilestones,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Export with both names for compatibility
export const getMyMetricsController = getMyMetricsHandler;
