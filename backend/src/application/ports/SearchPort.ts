/**
 * SearchPort - Application Port (Primary / Driving Port)
 *
 * Defines the contract for the search use case as seen by the interface layer.
 * Controllers depend on this interface, not on any concrete service class.
 *
 * Lives in the application layer (not domain) because its return types —
 * SearchResult and SearchError — are application-layer response shapes.
 * Domain ports (ProviderPort, CachePort, etc.) are secondary/driven ports
 * and live in the domain layer. SearchPort is a primary/driving port.
 */

import { SearchResult } from '../types/SearchResult';
import { SearchError } from '../types/SearchError';
import { SearchOptions } from '../types/SearchOptions';

export interface SearchPort {
  searchLanguageStatistics(
    username: string,
    options?: SearchOptions
  ): Promise<SearchResult | SearchError>;
}
