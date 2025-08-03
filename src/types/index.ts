/**
 * Re-exports all type definitions for the Fanart.tv API client
 */

// Common types
export type {
    ArtworkCollection, ImageBase, LatestResponse, RequestOptions
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
    AlbumImages, ArtistImages, LabelImages
} from './music.ts';

// TV types
export type {
    ShowImages
} from './tv.ts';

// Error classes
export {
    AuthenticationError, FanartApiError, NetworkError, NotFoundError, RateLimitError, TimeoutError
} from '../utils/errors.ts';
