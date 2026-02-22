/**
 * Database - Infrastructure
 * SQLite connection factory with versioned schema migrations.
 *
 * Call createDatabase(path) once at startup. Pass ':memory:' in tests
 * for a fully isolated, zero-filesystem in-memory database.
 *
 * ## Adding a migration
 * Append a new entry to MIGRATIONS with the next sequential id.
 * Never edit or reorder existing entries — only append.
 */

import Database from 'better-sqlite3';

interface Migration {
  id: number;
  name: string;
  sql: string;
}

/**
 * Ordered list of all schema migrations.
 * Rules:
 *   - IDs must be sequential and never change once merged
 *   - Never edit an existing migration — append a new one instead
 *   - DDL should use IF NOT EXISTS / IF EXISTS guards where possible
 */
const MIGRATIONS: Migration[] = [
  {
    id: 1,
    name: '001_create_topsearch',
    sql: `
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
    `,
  },
  {
    id: 2,
    name: '002_create_cache',
    sql: `
      CREATE TABLE IF NOT EXISTS cache (
        provider          TEXT    NOT NULL,
        provider_base_url TEXT    NOT NULL,
        username          TEXT    NOT NULL,
        schema_version    TEXT    NOT NULL,
        options_hash      TEXT    NOT NULL,
        payload_json      TEXT    NOT NULL,

        cached_at         INTEGER NOT NULL DEFAULT (unixepoch()),
        cached_until      INTEGER NOT NULL,
        updated_at        INTEGER NOT NULL DEFAULT (unixepoch()),

        PRIMARY KEY (provider, provider_base_url, username, schema_version, options_hash)
      );
    `,
  },
];

/**
 * Apply all pending migrations to the database.
 * Safe to call multiple times — already-applied migrations are skipped.
 * Exported for direct testing.
 */
export function applyMigrations(db: Database.Database): void {
  // Ensure the migrations tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         INTEGER PRIMARY KEY,
      name       TEXT    NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  const applied = new Set(
    (db.prepare('SELECT id FROM migrations').all() as Array<{ id: number }>).map((r) => r.id)
  );

  const record = db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)');

  const runPendingMigrations = db.transaction(() => {
    for (const migration of MIGRATIONS) {
      if (!applied.has(migration.id)) {
        db.exec(migration.sql);
        record.run(migration.id, migration.name);
      }
    }
  });

  runPendingMigrations();
}

/**
 * Open a SQLite database, apply performance/safety pragmas, and run
 * any pending schema migrations.
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

  applyMigrations(db);

  return db;
}
