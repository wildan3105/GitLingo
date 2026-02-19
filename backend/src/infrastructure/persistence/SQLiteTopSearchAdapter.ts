/**
 * SQLiteTopSearchAdapter - Infrastructure Adapter
 * Implements TopSearchPort using better-sqlite3 (synchronous)
 *
 * Prepared statements are created once in the constructor and reused
 * on every call — this is the recommended pattern for better-sqlite3
 * and avoids repeated parse/compile overhead.
 */

import Database from 'better-sqlite3';
import {
  TopSearchPort,
  TopSearchUpsertParams,
  TopSearchQueryParams,
  TopSearchQueryResult,
} from '../../domain/ports/TopSearchPort';
import { TopSearch } from '../../domain/models/TopSearch';

/**
 * Raw row shape returned by better-sqlite3 (snake_case, integer timestamps)
 */
interface TopSearchRow {
  username: string;
  provider: string;
  hit: number;
  avatar_url: string | null;
  created_at: number;
  updated_at: number;
}

interface CountRow {
  total: number;
}

export class SQLiteTopSearchAdapter implements TopSearchPort {
  private readonly stmtUpsert: Database.Statement;
  private readonly stmtFindPage: Database.Statement;
  private readonly stmtCount: Database.Statement;

  constructor(db: Database.Database) {
    this.stmtUpsert = db.prepare(`
      INSERT INTO topsearch (provider, username, hit, avatar_url, created_at, updated_at)
      VALUES (?, ?, 1, ?, unixepoch(), unixepoch())
      ON CONFLICT(provider, username) DO UPDATE SET
        hit        = hit + 1,
        updated_at = unixepoch(),
        avatar_url = COALESCE(excluded.avatar_url, topsearch.avatar_url)
    `);

    this.stmtFindPage = db.prepare(`
      SELECT username, hit, provider, updated_at, created_at, avatar_url
      FROM topsearch
      WHERE provider = ?
      ORDER BY hit DESC, updated_at DESC, username ASC
      LIMIT ? OFFSET ?
    `);

    this.stmtCount = db.prepare(`
      SELECT COUNT(*) AS total
      FROM topsearch
      WHERE provider = ?
    `);
  }

  /**
   * Upsert a search record.
   * On first insert: hit = 1, timestamps set to now.
   * On conflict: hit incremented, updated_at refreshed, avatar_url kept if new value is null.
   */
  public upsert(params: TopSearchUpsertParams): void {
    this.stmtUpsert.run(params.provider, params.username, params.avatarUrl);
  }

  /**
   * Return a paginated page of top search records and the total matching count.
   */
  public findTopSearches(params: TopSearchQueryParams): TopSearchQueryResult {
    const rows = this.stmtFindPage.all(
      params.provider,
      params.limit,
      params.offset
    ) as TopSearchRow[];

    const countRow = this.stmtCount.get(params.provider) as CountRow;

    return {
      data: rows.map((row) => this.toTopSearch(row)),
      total: countRow.total,
    };
  }

  /**
   * Map a raw DB row (snake_case, integers) to the TopSearch domain model (camelCase).
   */
  private toTopSearch(row: TopSearchRow): TopSearch {
    return {
      username: row.username,
      provider: row.provider,
      hit: row.hit,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
