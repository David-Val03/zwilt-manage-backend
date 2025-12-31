import { RequestHandler } from "express";
import { Ticket } from "../../models/ticket";
import { PagingQuery } from "@r5v/mongoose-paginate";
import { ParamsDictionary } from "express-serve-static-core";
import { buildQuery } from "../../utils";

// ============================================================================
// GET TICKETS CONTROLLER
// ============================================================================

/**
 * Get all tickets with pagination and filtering
 *
 * Query params:
 * - $limit: Number of items per page
 * - $skip: Number of items to skip
 * - $sort: Sort field and direction (e.g., "createdAt desc")
 * - $populate: Comma-separated list of fields to populate
 * - $filter: JSON filter object
 */
interface ReqParams extends ParamsDictionary {}

export const getTicketsController: RequestHandler<ReqParams> = async (
  req,
  res,
  next
) => {
  try {
    const config = buildQuery({
      limit: 50,
    });

    // PagingQuery automatically handles $populate, $filter, $sort from query params
    const query = new PagingQuery(req, Ticket, config);
    const tickets = await query.exec();

    res.json(tickets);
  } catch (error) {
    next(error);
  }
};
