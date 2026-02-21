/**
 * TopSearchResult - Application Type
 * Response shape for GET /api/v1/topsearch
 */

export interface TopSearchEntry {
  username: string;
  provider: string;
  hit: number;
  avatarUrl: string | null;
  /** ISO 8601 string, converted from unix epoch at the service boundary */
  createdAt: string;
  /** ISO 8601 string, converted from unix epoch at the service boundary */
  updatedAt: string;
}

export interface TopSearchResult {
  ok: true;
  data: TopSearchEntry[];
  pagination: {
    /** Total records matching the provider filter */
    total: number;
    /** Number of records in this response */
    count: number;
    /** Offset used in the query */
    offset: number;
    /** Limit used in the query */
    limit: number;
  };
}
