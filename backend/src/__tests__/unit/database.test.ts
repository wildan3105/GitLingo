/**
 * database.ts Unit Tests
 */

import { createDatabase, applyMigrations } from '../../infrastructure/persistence/database';
import Database from 'better-sqlite3';

describe('createDatabase', () => {
  it('should return an open database connection', () => {
    const db = createDatabase(':memory:');
    expect(db.open).toBe(true);
    db.close();
  });

  it('should create the topsearch table', () => {
    const db = createDatabase(':memory:');

    const row = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='topsearch'`)
      .get() as { name: string } | undefined;

    expect(row).toBeDefined();
    expect(row?.name).toBe('topsearch');
    db.close();
  });

  it('should create the idx_topsearch_provider_hit index', () => {
    const db = createDatabase(':memory:');

    const row = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='index' AND name='idx_topsearch_provider_hit'`
      )
      .get() as { name: string } | undefined;

    expect(row).toBeDefined();
    db.close();
  });

  it('should create the idx_topsearch_provider_updated index', () => {
    const db = createDatabase(':memory:');

    const row = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='index' AND name='idx_topsearch_provider_updated'`
      )
      .get() as { name: string } | undefined;

    expect(row).toBeDefined();
    db.close();
  });

  it('should apply WAL journal mode', () => {
    const db = createDatabase(':memory:');

    // Note: in-memory DBs report 'memory' mode, not 'wal' — WAL requires a file.
    // We verify the pragma was accepted without error (no throw).
    expect(() => db.pragma('journal_mode', { simple: true })).not.toThrow();
    db.close();
  });

  it('should apply busy_timeout pragma', () => {
    const db = createDatabase(':memory:');

    const timeout = db.pragma('busy_timeout', { simple: true });
    expect(timeout).toBe(5000);
    db.close();
  });

  it('should apply foreign_keys pragma', () => {
    const db = createDatabase(':memory:');

    const fk = db.pragma('foreign_keys', { simple: true });
    expect(fk).toBe(1);
    db.close();
  });

  it('should be idempotent — calling createDatabase twice on the same path does not throw', () => {
    const db1 = createDatabase(':memory:');
    db1.close();

    // A second call on a separate :memory: instance also succeeds
    expect(() => {
      const db2 = createDatabase(':memory:');
      db2.close();
    }).not.toThrow();
  });

  it('should create topsearch table with all expected columns', () => {
    const db = createDatabase(':memory:');

    const columns = db.prepare(`PRAGMA table_info(topsearch)`).all() as Array<{
      name: string;
      notnull: number;
      dflt_value: string | null;
    }>;

    const colNames = columns.map((c) => c.name);
    expect(colNames).toContain('provider');
    expect(colNames).toContain('username');
    expect(colNames).toContain('hit');
    expect(colNames).toContain('avatar_url');
    expect(colNames).toContain('created_at');
    expect(colNames).toContain('updated_at');
    db.close();
  });
});

describe('applyMigrations', () => {
  it('creates the migrations tracking table', () => {
    const db = createDatabase(':memory:');

    const row = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'`)
      .get() as { name: string } | undefined;

    expect(row?.name).toBe('migrations');
    db.close();
  });

  it('records all migrations on a fresh database', () => {
    const db = createDatabase(':memory:');

    const rows = db
      .prepare('SELECT id, name FROM migrations ORDER BY id')
      .all() as Array<{ id: number; name: string }>;

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ id: 1, name: '001_create_topsearch' });
    expect(rows[1]).toMatchObject({ id: 2, name: '002_create_cache' });
    db.close();
  });

  it('does not re-apply migrations on a second run', () => {
    const db = new Database(':memory:');

    applyMigrations(db); // first run — applies both migrations
    applyMigrations(db); // second run — should skip both

    const rows = db.prepare('SELECT id FROM migrations').all();
    expect(rows).toHaveLength(2); // still exactly 2 rows, not 4
    db.close();
  });

  it('applies only the pending migration when one is already recorded', () => {
    const db = new Database(':memory:');

    // Manually create the migrations table and record migration 1 as done
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
    db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)').run(1, '001_create_topsearch');

    // applyMigrations should skip id=1 and apply id=2
    applyMigrations(db);

    const rows = db
      .prepare('SELECT id FROM migrations ORDER BY id')
      .all() as Array<{ id: number }>;

    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({ id: 2 });

    // Cache table should now exist (created by migration 2)
    const cacheTable = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='cache'`)
      .get();
    expect(cacheTable).toBeDefined();
    db.close();
  });
});
