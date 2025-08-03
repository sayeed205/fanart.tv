/**
 * Music API module with nested structure for accessing Fanart.tv music artwork
 */

import type { RequestOptions } from "../types/common.ts";
import type {
  AlbumImages,
  ArtistImages,
  LabelImages,
  LatestArtists,
} from "../types/music.ts";
import { ENDPOINTS } from "../utils/constants.ts";
import { BaseClient } from "./base.ts";

/**
 * Artists module for accessing artist-specific artwork from Fanart.tv
 * Handles artist backgrounds, thumbnails, logos, and banners
 */
export class ArtistsModule extends BaseClient {
  /**
   * Retrieves artwork images for a specific artist from Fanart.tv
   *
   * @param mbid - The MusicBrainz ID for the artist
   * @param options - Optional request configuration
   * @param options.usePreview - Whether to return preview-sized images (default: false)
   * @returns Promise resolving to artist artwork data
   *
   * @throws {AuthenticationError} When API key is invalid
   * @throws {NotFoundError} When artist MBID is not found
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {NetworkError} When network error occurs
   * @throws {TimeoutError} When request times out
   *
   * @example
   * ```typescript
   * const fanart = new Fanart('your-api-key');
   * const artwork = await fanart.music.artists.get('5b11f4ce-a62d-471e-81fc-a69a8278c7da');
   * console.log(artwork.artistbackground?.[0]?.url);
   * ```
   */
  async get(mbid: string, options?: RequestOptions): Promise<ArtistImages> {
    if (!mbid || typeof mbid !== "string" || mbid.trim().length === 0) {
      throw new Error(
        "MusicBrainz ID is required and must be a non-empty string",
      );
    }

    const endpoint = ENDPOINTS.MUSIC.ARTISTS.GET(mbid.trim());
    return await this.makeRequest<ArtistImages>(endpoint, options);
  }

  /**
   * Retrieves the latest artist artwork additions from Fanart.tv
   *
   * @param date - Optional date string in YYYY-MM-DD format to get artwork added since that date
   * @param options - Optional request configuration
   * @param options.usePreview - Whether to return preview-sized images (default: false)
   * @returns Promise resolving to latest artist artwork data
   *
   * @throws {AuthenticationError} When API key is invalid
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {NetworkError} When network error occurs
   * @throws {TimeoutError} When request times out
   *
   * @example
   * ```typescript
   * const fanart = new Fanart('your-api-key');
   * const latest = await fanart.music.artists.latest('2024-01-01');
   * console.log(Object.keys(latest)); // Array of artist MBIDs with new artwork
   * ```
   */
  async latest(
    date?: string,
    options?: RequestOptions,
  ): Promise<LatestArtists> {
    if (
      date && (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    ) {
      throw new Error("Date must be in YYYY-MM-DD format");
    }

    const endpoint = ENDPOINTS.MUSIC.ARTISTS.LATEST(date);
    return await this.makeRequest<LatestArtists>(endpoint, options);
  }
}

/**
 * Main music module providing access to all music-related artwork endpoints
 * Includes nested artists module and direct methods for albums and labels
 */
export class MusicModule extends BaseClient {
  /** Artists sub-module for artist-specific artwork */
  public readonly artists: ArtistsModule;

  /**
   * Creates a new MusicModule instance with nested artists module
   *
   * @param apiKey - The Fanart.tv API key (personal or project key)
   * @throws {AuthenticationError} When API key is not provided or invalid
   */
  constructor(apiKey: string) {
    super(apiKey);
    this.artists = new ArtistsModule(apiKey);
  }

  /**
   * Retrieves artwork images for a specific album from Fanart.tv
   *
   * @param mbid - The MusicBrainz ID for the album
   * @param options - Optional request configuration
   * @param options.usePreview - Whether to return preview-sized images (default: false)
   * @returns Promise resolving to album artwork data
   *
   * @throws {AuthenticationError} When API key is invalid
   * @throws {NotFoundError} When album MBID is not found
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {NetworkError} When network error occurs
   * @throws {TimeoutError} When request times out
   *
   * @example
   * ```typescript
   * const fanart = new Fanart('your-api-key');
   * const artwork = await fanart.music.album('f5093c06-23e3-404f-afe0-f259bbc4b5b6');
   * console.log(artwork.albumcover?.[0]?.url);
   * ```
   */
  async album(mbid: string, options?: RequestOptions): Promise<AlbumImages> {
    if (!mbid || typeof mbid !== "string" || mbid.trim().length === 0) {
      throw new Error(
        "MusicBrainz ID is required and must be a non-empty string",
      );
    }

    const endpoint = ENDPOINTS.MUSIC.ALBUMS.GET(mbid.trim());
    return await this.makeRequest<AlbumImages>(endpoint, options);
  }

  /**
   * Retrieves artwork images for a specific record label from Fanart.tv
   *
   * @param mbid - The MusicBrainz ID for the label
   * @param options - Optional request configuration
   * @param options.usePreview - Whether to return preview-sized images (default: false)
   * @returns Promise resolving to label artwork data
   *
   * @throws {AuthenticationError} When API key is invalid
   * @throws {NotFoundError} When label MBID is not found
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {NetworkError} When network error occurs
   * @throws {TimeoutError} When request times out
   *
   * @example
   * ```typescript
   * const fanart = new Fanart('your-api-key');
   * const artwork = await fanart.music.label('50c384a2-0b44-401b-b893-8181173339c7');
   * console.log(artwork.musiclabel?.[0]?.url);
   * ```
   */
  async label(mbid: string, options?: RequestOptions): Promise<LabelImages> {
    if (!mbid || typeof mbid !== "string" || mbid.trim().length === 0) {
      throw new Error(
        "MusicBrainz ID is required and must be a non-empty string",
      );
    }

    const endpoint = ENDPOINTS.MUSIC.LABELS.GET(mbid.trim());
    return await this.makeRequest<LabelImages>(endpoint, options);
  }
}
