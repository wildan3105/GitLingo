/**
 * CacheEntry - Domain Model
 * Represents a single cached search result stored in the database.
 * Time fields are Unix epoch seconds (INTEGER), matching DB storage.
 * Conversion to ISO-8601 string for API responses happens at the service layer.
 */

export interface CacheEntry {
  provider: string;
  providerBaseUrl: string;
  username: string;
  schemaVersion: string;
  optionsHash: string;

  /**
   * Full computed API response payload (JSON string), excluding the metadata field.
   */
  payloadJson: string;

  /**
   * Unix epoch timestamp (seconds) when this entry was cached
   */
  cachedAt: number;

  /**
   * Unix epoch timestamp (seconds) when this cache entry expires
   */
  cachedUntil: number;

  /**
   * Unix epoch timestamp (seconds) when this entry was last written
   */
  updatedAt: number;
}
