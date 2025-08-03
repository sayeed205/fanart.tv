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
export { Fanart } from "./fanart.ts";

// Re-export all types for convenience
export type {
  // Music types
  AlbumCover,
  AlbumImages,
  ArtistBackground,
  ArtistImages,
  ArtistThumb,
  // Common types
  ArtworkCollection,
  CdArt,
  // TV types
  CharacterArt,
  ClearArt,
  ClearLogo,
  HdClearArt,
  HdMusicLogo,
  HdTvLogo,
  ImageBase,
  LabelImage,
  LabelImages,
  LatestArtists,
  // Movie types
  LatestMovies,
  LatestResponse,
  LatestShows,
  MovieBackground,
  MovieBanner,
  MovieDisc,
  MovieImages,
  MovieLogo,
  MoviePoster,
  MovieThumb,
  MusicBanner,
  MusicLogo,
  RequestOptions,
  SeasonPoster,
  SeasonThumb,
  ShowBackground,
  ShowImages,
  TvBanner,
  TvPoster,
  TvThumb,
} from "./types/index.ts";

// Export error classes
export {
  AuthenticationError,
  FanartApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
} from "./utils/errors.ts";
