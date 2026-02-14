/**
 * LanguageStatistic - Domain Model
 * Represents aggregated statistics for a programming language
 * Chart-ready format for frontend consumption
 */

export interface LanguageStatistic {
  /**
   * Unique identifier (e.g., "JavaScript", "__forks__")
   */
  key: string;

  /**
   * Display label for the language
   */
  label: string;

  /**
   * Count of repositories using this language
   */
  value: number;

  /**
   * Hex color code for visualization (e.g., "#f1e05a")
   */
  color: string;
}
