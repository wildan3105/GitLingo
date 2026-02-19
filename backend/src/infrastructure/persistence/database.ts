/**
 * Database - Infrastructure
 * SQLite connection factory with schema initialization
 *
 * Call createDatabase(path) once at startup. Pass ':memory:' in tests
 * for a fully isolated, zero-filesystem in-memory database.
 */

import Database from 'better-sqlite3';

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS topsearch (
    provider   TEXT    NOT NULL,
    username   TEXT    NOT NULL,
    hit        INTEGER NOT NULL DEFAULT 0,
    avatar_url TEXT,

    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

    PRIMARY KEY (provider, username)
  );

  CREATE INDEX IF NOT EXISTS idx_topsearch_provider_hit
    ON topsearch(provider, hit DESC);

  CREATE INDEX IF NOT EXISTS idx_topsearch_provider_updated
    ON topsearch(provider, updated_at DESC);
`;

/**
 * Open a SQLite database, apply performance/safety pragmas, and initialize
 * the schema. Safe to call on every startup — all DDL statements are
 * idempotent (IF NOT EXISTS).
 *
 * @param path - Filesystem path to the .db file, or ':memory:' for tests
 */
export function createDatabase(path: string): Database.Database {
  const db = new Database(path);

  // WAL mode: dramatically improves concurrent read/write throughput
  db.pragma('journal_mode = WAL');

  // Wait up to 5s before throwing SQLITE_BUSY on a locked DB
  db.pragma('busy_timeout = 5000');

  // NORMAL: safe with WAL, far faster than FULL
  db.pragma('synchronous = NORMAL');

  // Enforce foreign key constraints (future-proofing)
  db.pragma('foreign_keys = ON');

  // Initialize schema — idempotent
  db.exec(SCHEMA_SQL);

  return db;
}
