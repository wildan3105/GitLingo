/**
 * SQLiteHealthAdapter Unit Tests
 * Uses an in-memory SQLite database — no filesystem I/O, fully isolated.
 */

import { createDatabase } from '../../infrastructure/persistence/database';
import { SQLiteHealthAdapter } from '../../infrastructure/persistence/SQLiteHealthAdapter';

describe('SQLiteHealthAdapter', () => {
  describe('ping', () => {
    it('should return true when the database is open and healthy', () => {
      const db = createDatabase(':memory:');
      const adapter = new SQLiteHealthAdapter(db);

      expect(adapter.ping()).toBe(true);

      db.close();
    });

    it('should return false when the database has been closed', () => {
      const db = createDatabase(':memory:');
      const adapter = new SQLiteHealthAdapter(db);

      db.close();

      expect(adapter.ping()).toBe(false);
    });

    it('should not throw even when the database is unavailable', () => {
      const db = createDatabase(':memory:');
      const adapter = new SQLiteHealthAdapter(db);
      db.close();

      expect(() => adapter.ping()).not.toThrow();
    });
  });
});
