/**
 * Constants and configuration values for the Fanart.tv API client
 */

/**
 * Base URL for the Fanart.tv API
 */
export const FANART_API_BASE_URL = "https://webservice.fanart.tv/v3";

/**
 * API endpoints for different content types
 */
export const ENDPOINTS = {
  MOVIES: {
    GET: (movieId: number) => `/movies/${movieId}`,
    LATEST: (date?: string) => `/movies/latest${date ? `/${date}` : ""}`,
  },
  MUSIC: {
    ARTISTS: {
      GET: (mbid: string) => `/music/${mbid}`,
      LATEST: (date?: string) => `/music/latest${date ? `/${date}` : ""}`,
    },
    ALBUMS: {
      GET: (mbid: string) => `/music/albums/${mbid}`,
    },
    LABELS: {
      GET: (mbid: string) => `/music/labels/${mbid}`,
    },
  },
  TV: {
    GET: (tvdbId: number) => `/tv/${tvdbId}`,
    LATEST: (date?: string) => `/tv/latest${date ? `/${date}` : ""}`,
  },
} as const;

/**
 * HTTP headers used in API requests
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "Deno-Fanart-Client/1.0.0",
} as const;

/**
 * Default timeout for API requests (in milliseconds)
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Preview URL suffix for generating preview image URLs
 */
export const PREVIEW_SUFFIX = "/preview";
