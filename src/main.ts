/**
 * Main entry point for the Fanart.tv API client
 *
 * This module exports the main Fanart class and all type definitions
 * for accessing Fanart.tv's extensive collection of movie, music, and TV show artwork.
 *
 * @example
 * ```typescript
 * import { Fanart } from '@hitarashi/fanart';
 * import type { MovieImages, ArtistImages } from '@hitarashi/fanart/types';
 *
 * const fanart = new Fanart('your-api-key');
 * const movieArt = await fanart.movie.get(550);
 * const artistArt = await fanart.music.artists.get('artist-mbid');
 * ```
 *
 * @module
 */

// Export the main Fanart client class
export * from "./fanart.ts";

// Re-export all types for convenience
export type * from "./types/index.ts";

// Export error classes
export * from "./utils/errors.ts";
