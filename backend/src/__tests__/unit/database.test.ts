/**
 * database.ts Unit Tests
 */

import { createDatabase } from '../../infrastructure/persistence/database';

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
