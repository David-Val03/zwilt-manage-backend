import { RequestHandler } from "express";
import { Project } from "../../models/project";
import { PagingQuery } from "@r5v/mongoose-paginate";
import { ParamsDictionary } from "express-serve-static-core";
import { buildQuery } from "../../utils";

// ============================================================================
// GET PROJECTS CONTROLLER
// ============================================================================

/**
 * Get all projects with pagination and filtering
 *
 * Query params:
 * - limit: Number of items per page
 * - page: Page number
 * - sort: Sort field and direction (e.g., "createdAt desc")
 * - $populate: Comma-separated list of fields to populate (e.g., "members")
 *   NOTE: Use $populate instead of populate (PagingQuery convention)
 */
interface ReqParams extends ParamsDictionary {}

export const getProjectsController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const config = buildQuery({
      limit: 20,
    });

    // PagingQuery automatically handles $populate from query params
    const query = new PagingQuery(req, Project, config);
    const projects = await query.exec();

    res.json(projects);
  } catch (error) {
    next(error);
  }
};
