/**
 * SQLiteCacheAdapter - Infrastructure Adapter
 * Implements CachePort using better-sqlite3 (synchronous)
 *
 * Prepared statements are created once in the constructor and reused
 * on every call — same pattern as SQLiteTopSearchAdapter.
 *
 * Normalization is applied before every read and write:
 *   - username: lowercased (GitHub logins are case-insensitive)
 *   - providerBaseUrl: trailing slashes stripped
 */

import Database from 'better-sqlite3';
import { CachePort, CacheKey } from '../../domain/ports/CachePort';
import { CacheEntry } from '../../domain/models/CacheEntry';

/**
 * Raw row shape returned by better-sqlite3 (snake_case, integer timestamps)
 */
interface CacheRow {
  provider: string;
  provider_base_url: string;
  username: string;
  schema_version: string;
  options_hash: string;
  payload_json: string;
  cached_at: number;
  cached_until: number;
  updated_at: number;
}

export class SQLiteCacheAdapter implements CachePort {
  private readonly ttlSeconds: number;
  private readonly stmtGet: Database.Statement;
  private readonly stmtUpsert: Database.Statement;

  constructor(db: Database.Database, ttlSeconds: number) {
    this.ttlSeconds = ttlSeconds;

    this.stmtGet = db.prepare(`
      SELECT
        provider, provider_base_url, username,
        schema_version, options_hash,
        payload_json, cached_at, cached_until, updated_at
      FROM cache
      WHERE provider          = ?
        AND provider_base_url = ?
        AND username          = ?
        AND schema_version    = ?
        AND options_hash      = ?
      LIMIT 1
    `);

    // ttlSeconds appears twice: once for INSERT values, once for ON CONFLICT UPDATE
    this.stmtUpsert = db.prepare(`
      INSERT INTO cache (
        provider, provider_base_url, username,
        schema_version, options_hash,
        payload_json,
        cached_at, cached_until, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        unixepoch(),
        unixepoch() + ?,
        unixepoch()
      )
      ON CONFLICT(provider, provider_base_url, username, schema_version, options_hash) DO UPDATE SET
        payload_json = excluded.payload_json,
        cached_at    = unixepoch(),
        cached_until = unixepoch() + ?,
        updated_at   = unixepoch()
    `);
  }

  public get(key: CacheKey): CacheEntry | null {
    const normalized = this.normalize(key);
    const row = this.stmtGet.get(
      normalized.provider,
      normalized.providerBaseUrl,
      normalized.username,
      normalized.schemaVersion,
      normalized.optionsHash
    ) as CacheRow | undefined;

    return row ? this.toCacheEntry(row) : null;
  }

  public upsert(key: CacheKey, payloadJson: string): CacheEntry {
    const normalized = this.normalize(key);
    const now = Math.floor(Date.now() / 1000);

    this.stmtUpsert.run(
      normalized.provider,
      normalized.providerBaseUrl,
      normalized.username,
      normalized.schemaVersion,
      normalized.optionsHash,
      payloadJson,
      this.ttlSeconds, // for unixepoch() + ? in INSERT
      this.ttlSeconds // for unixepoch() + ? in ON CONFLICT UPDATE
    );

    return {
      provider: normalized.provider,
      providerBaseUrl: normalized.providerBaseUrl,
      username: normalized.username,
      schemaVersion: normalized.schemaVersion,
      optionsHash: normalized.optionsHash,
      payloadJson,
      cachedAt: now,
      cachedUntil: now + this.ttlSeconds,
      updatedAt: now,
    };
  }

  /**
   * Normalize cache key fields to avoid accidental cache misses.
   * username is lowercased; providerBaseUrl has trailing slashes stripped.
   */
  private normalize(key: CacheKey): CacheKey {
    return {
      ...key,
      username: key.username.toLowerCase(),
      providerBaseUrl: key.providerBaseUrl.replace(/\/+$/, ''),
    };
  }

  /**
   * Map a raw DB row (snake_case, integer timestamps) to the CacheEntry domain model.
   */
  private toCacheEntry(row: CacheRow): CacheEntry {
    return {
      provider: row.provider,
      providerBaseUrl: row.provider_base_url,
      username: row.username,
      schemaVersion: row.schema_version,
      optionsHash: row.options_hash,
      payloadJson: row.payload_json,
      cachedAt: row.cached_at,
      cachedUntil: row.cached_until,
      updatedAt: row.updated_at,
    };
  }
}
