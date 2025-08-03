/**
 * TV shows API module for accessing Fanart.tv TV show artwork
 */

import type { RequestOptions } from "../types/common.ts";
import type { LatestShows, ShowImages } from "../types/tv.ts";
import { ENDPOINTS } from "../utils/constants.ts";
import { BaseClient } from "./base.ts";

/**
 * TV module for accessing TV show artwork from Fanart.tv
 *
 * Provides methods to retrieve TV show logos, backgrounds, clear art,
 * season posters, banners, character art, and thumbnails using
 * The TV Database (TVDB) IDs.
 *
 * @example
 * ```typescript
 * const fanart = new Fanart('your-api-key');
 *
 * // Get artwork for a specific TV show
 * const showArt = await fanart.tv.get(81189);
 * console.log(showArt.clearlogo?.[0]?.url);
 *
 * // Get latest TV show artwork
 * const latest = await fanart.tv.latest();
 * ```
 */
export class TvModule extends BaseClient {
  /**
   * Retrieves artwork images for a specific TV show from Fanart.tv
   *
   * Returns all available artwork types for the specified TV show including:
   * - Clear logos (clearlogo)
   * - HD TV logos (hdtvlogo)
   * - Clear art (clearart)
   * - HD clear art (hdclearart)
   * - Show backgrounds (showbackground)
   * - TV thumbnails (tvthumb)
   * - Season posters (seasonposter)
   * - Season thumbnails (seasonthumb)
   * - TV banners (tvbanner)
   * - Character art (characterart)
   * - TV posters (tvposter)
   *
   * @param tvdbId - The TV Database (TVDB) ID for the TV show
   * @param options - Optional request configuration
   * @param options.usePreview - Whether to return preview-sized images (default: false)
   * @returns Promise resolving to TV show artwork data
   *
   * @throws {AuthenticationError} When API key is invalid
   * @throws {NotFoundError} When TV show ID is not found
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {TimeoutError} When request times out
   * @throws {NetworkError} When network error occurs
   * @throws {FanartApiError} For other API errors
   *
   * @example
   * ```typescript
   * // Get full-size images for Breaking Bad (TVDB ID: 81189)
   * const artwork = await fanart.tv.get(81189);
   *
   * // Get preview-sized images
   * const previews = await fanart.tv.get(81189, { usePreview: true });
   *
   * // Access specific artwork types
   * const logos = artwork.clearlogo || [];
   * const backgrounds = artwork.showbackground || [];
   * const seasonPosters = artwork.seasonposter || [];
   * ```
   */
  async get(tvdbId: number, options?: RequestOptions): Promise<ShowImages> {
    if (!Number.isInteger(tvdbId) || tvdbId <= 0) {
      throw new Error("TVDB ID must be a positive integer");
    }

    const endpoint = ENDPOINTS.TV.GET(tvdbId);
    return await this.makeRequest<ShowImages>(endpoint, options);
  }

  /**
   * Retrieves the latest TV show artwork added to Fanart.tv
   *
   * Returns recently added TV show artwork, optionally filtered by date.
   * Useful for discovering new artwork or keeping local caches up to date.
   *
   * @param date - Optional date filter in YYYY-MM-DD format (returns artwork added since this date)
   * @returns Promise resolving to latest TV show artwork data
   *
   * @throws {AuthenticationError} When API key is invalid
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {TimeoutError} When request times out
   * @throws {NetworkError} When network error occurs
   * @throws {FanartApiError} For other API errors
   *
   * @example
   * ```typescript
   * // Get all latest TV show artwork
   * const latest = await fanart.tv.latest();
   *
   * // Get artwork added since a specific date
   * const recent = await fanart.tv.latest('2024-01-01');
   *
   * // Process the results
   * for (const [showId, showData] of Object.entries(latest)) {
   *   console.log(`TV show ${showData.name} has new artwork`);
   * }
   * ```
   */
  async latest(date?: string): Promise<LatestShows> {
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Date must be in YYYY-MM-DD format");
    }

    const endpoint = ENDPOINTS.TV.LATEST(date);
    return await this.makeRequest<LatestShows>(endpoint);
  }
}
