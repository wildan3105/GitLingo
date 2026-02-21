/**
 * SQLiteHealthAdapter
 * Infrastructure implementation of HealthPort for SQLite databases.
 */

import Database from 'better-sqlite3';
import { HealthPort } from '../../domain/ports/HealthPort';

export class SQLiteHealthAdapter implements HealthPort {
  private readonly db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Returns true if the database responds to a simple query, false otherwise.
   * Never throws.
   */
  ping(): boolean {
    try {
      this.db.prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }
}
