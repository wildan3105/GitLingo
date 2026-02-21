/**
 * TopSearchService - Application Service
 * Orchestrates recording searches and retrieving the top search leaderboard
 */

import { createLogger } from '../../shared/utils/logger';
import { TopSearchPort } from '../../domain/ports/TopSearchPort';
import { TopSearch } from '../../domain/models/TopSearch';
import { TopSearchResult, TopSearchEntry } from '../types/TopSearchResult';

const logger = createLogger('TopSearchService');

export interface GetTopSearchesParams {
  provider: string;
  limit: number;
  offset: number;
}

export class TopSearchService {
  private readonly port: TopSearchPort;

  constructor(port: TopSearchPort) {
    this.port = port;
  }

  /**
   * Record a successful search.
   * - Normalizes username to lowercase and trims whitespace before storing.
   * - Never throws — DB errors are logged and swallowed so the search
   *   response is never affected by a persistence failure.
   */
  public record(username: string, provider: string, avatarUrl: string | null): void {
    try {
      const normalized = username.toLowerCase().trim();
      this.port.upsert({ username: normalized, provider, avatarUrl });
    } catch (error) {
      logger.error({ error, username, provider }, 'Failed to record top search entry');
    }
  }

  /**
   * Retrieve the paginated top search leaderboard.
   * - Converts unix epoch timestamps to ISO 8601 strings at this boundary.
   * - Never throws — DB errors are logged and an empty result is returned,
   *   per spec (client receives ok: true with empty data).
   */
  public getTopSearches(params: GetTopSearchesParams): TopSearchResult {
    try {
      const { data, total } = this.port.findTopSearches(params);
      return {
        ok: true,
        data: data.map((ts) => this.toEntry(ts)),
        pagination: {
          total,
          count: data.length,
          offset: params.offset,
          limit: params.limit,
        },
      };
    } catch (error) {
      logger.error({ error, params }, 'Failed to fetch top searches');
      return this.emptyResult(params);
    }
  }

  private toEntry(ts: TopSearch): TopSearchEntry {
    return {
      username: ts.username,
      provider: ts.provider,
      hit: ts.hit,
      avatarUrl: ts.avatarUrl,
      createdAt: new Date(ts.createdAt * 1000).toISOString(),
      updatedAt: new Date(ts.updatedAt * 1000).toISOString(),
    };
  }

  private emptyResult(params: GetTopSearchesParams): TopSearchResult {
    return {
      ok: true,
      data: [],
      pagination: { total: 0, count: 0, offset: params.offset, limit: params.limit },
    };
  }
}
