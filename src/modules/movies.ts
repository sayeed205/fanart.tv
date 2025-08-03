/**
 * Movies API module for accessing Fanart.tv movie artwork
 */

import type { RequestOptions } from '../types/common.ts';
import type { LatestMovies, MovieImages } from '../types/movies.ts';
import { ENDPOINTS } from '../utils/constants.ts';
import { BaseClient } from './base.ts';

/**
 * Movie module for accessing movie artwork from Fanart.tv
 * 
 * Provides methods to retrieve movie posters, backgrounds, logos, disc art,
 * banners, and thumbnails using The Movie Database (TMDb) IDs.
 * 
 * @example
 * ```typescript
 * const fanart = new Fanart('your-api-key');
 * 
 * // Get artwork for a specific movie
 * const movieArt = await fanart.movie.get(550);
 * console.log(movieArt.movieposter?.[0]?.url);
 * 
 * // Get latest movie artwork
 * const latest = await fanart.movie.latest();
 * ```
 */
export class MovieModule extends BaseClient {
  /**
   * Retrieves artwork images for a specific movie from Fanart.tv
   * 
   * Returns all available artwork types for the specified movie including:
   * - Movie posters (movieposter)
   * - Movie backgrounds (moviebackground) 
   * - Movie logos (movielogo)
   * - Movie disc art (moviedisc)
   * - Movie banners (moviebanner)
   * - Movie thumbnails (moviethumb)
   * 
   * @param movieId - The Movie Database (TMDb) ID for the movie
   * @param options - Optional request configuration
   * @param options.usePreview - Whether to return preview-sized images (default: false)
   * @returns Promise resolving to movie artwork data
   * 
   * @throws {AuthenticationError} When API key is invalid
   * @throws {NotFoundError} When movie ID is not found
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {TimeoutError} When request times out
   * @throws {NetworkError} When network error occurs
   * @throws {FanartApiError} For other API errors
   * 
   * @example
   * ```typescript
   * // Get full-size images for Fight Club (TMDb ID: 550)
   * const artwork = await fanart.movie.get(550);
   * 
   * // Get preview-sized images
   * const previews = await fanart.movie.get(550, { usePreview: true });
   * 
   * // Access specific artwork types
   * const posters = artwork.movieposter || [];
   * const backgrounds = artwork.moviebackground || [];
   * ```
   */
  async get(movieId: number, options?: RequestOptions): Promise<MovieImages> {
    if (!Number.isInteger(movieId) || movieId <= 0) {
      throw new Error('Movie ID must be a positive integer');
    }

    const endpoint = ENDPOINTS.MOVIES.GET(movieId);
    return await this.makeRequest<MovieImages>(endpoint, options);
  }

  /**
   * Retrieves the latest movie artwork added to Fanart.tv
   * 
   * Returns recently added movie artwork, optionally filtered by date.
   * Useful for discovering new artwork or keeping local caches up to date.
   * 
   * @param date - Optional date filter in YYYY-MM-DD format (returns artwork added since this date)
   * @returns Promise resolving to latest movie artwork data
   * 
   * @throws {AuthenticationError} When API key is invalid
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {TimeoutError} When request times out
   * @throws {NetworkError} When network error occurs
   * @throws {FanartApiError} For other API errors
   * 
   * @example
   * ```typescript
   * // Get all latest movie artwork
   * const latest = await fanart.movie.latest();
   * 
   * // Get artwork added since a specific date
   * const recent = await fanart.movie.latest('2024-01-01');
   * 
   * // Process the results
   * for (const [movieId, movieData] of Object.entries(latest)) {
   *   console.log(`Movie ${movieData.name} has new artwork`);
   * }
   * ```
   */
  async latest(date?: string): Promise<LatestMovies> {
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    const endpoint = ENDPOINTS.MOVIES.LATEST(date);
    return await this.makeRequest<LatestMovies>(endpoint);
  }
}