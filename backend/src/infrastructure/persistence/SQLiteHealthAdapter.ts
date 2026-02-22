/**
 * SQLiteHealthAdapter
 * Infrastructure implementation of HealthPort for SQLite databases.
 */

import Database from 'better-sqlite3';
import { HealthPort } from '../../domain/ports/HealthPort';

export class SQLiteHealthAdapter implements HealthPort {
  private readonly stmtPing: Database.Statement;

  constructor(db: Database.Database) {
    this.stmtPing = db.prepare('SELECT 1');
  }

  /**
   * Returns true if the database responds to a simple query, false otherwise.
   * Never throws.
   */
  ping(): boolean {
    try {
      this.stmtPing.get();
      return true;
    } catch {
      return false;
    }
  }
}
