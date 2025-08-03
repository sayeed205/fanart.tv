/**
 * Re-exports all type definitions for the Fanart.tv API client
 * 
 * This module provides a centralized export point for all TypeScript interfaces
 * and types used throughout the Fanart.tv API client. Import types from here
 * when you need type definitions for API responses or client configuration.
 * 
 * @example
 * ```typescript
 * import type { MovieImages, ArtistImages, RequestOptions } from '@hitarashi/fanart/types';
 * 
 * const options: RequestOptions = { usePreview: true };
 * const movieData: MovieImages = await fanart.movie.get(550, options);
 * ```
 * 
 * @module
 */

// Common types
export type {
    ArtworkCollection,
    ImageBase,
    LatestResponse,
    RequestOptions
} from './common.ts';

// Movie types
export type {
    LatestMovies,
    MovieBackground,
    MovieBanner,
    MovieDisc,
    MovieImages,
    MovieLogo,
    MoviePoster,
    MovieThumb
} from './movies.ts';

// Music types
export type {
    AlbumCover,
    AlbumImages,
    ArtistBackground,
    ArtistImages,
    ArtistThumb,
    CdArt,
    HdMusicLogo,
    LabelImage,
    LabelImages,
    LatestArtists,
    MusicBanner,
    MusicLogo
} from './music.ts';

// TV types
export type {
    CharacterArt,
    ClearArt,
    ClearLogo,
    HdClearArt,
    HdTvLogo,
    LatestShows,
    SeasonPoster,
    SeasonThumb,
    ShowBackground,
    ShowImages,
    TvBanner,
    TvPoster,
    TvThumb
} from './tv.ts';

// Error classes
export {
    AuthenticationError,
    FanartApiError,
    NetworkError,
    NotFoundError,
    RateLimitError,
    TimeoutError
} from '../utils/errors.ts';

