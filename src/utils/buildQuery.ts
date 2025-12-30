import { DEFAULT_QUERY_CONFIG } from "./constants";

export type QueryConfig = typeof DEFAULT_QUERY_CONFIG;

export const buildQuery = (
  overrides: Partial<QueryConfig> = {}
): QueryConfig => ({
  ...DEFAULT_QUERY_CONFIG,
  ...overrides,
});
