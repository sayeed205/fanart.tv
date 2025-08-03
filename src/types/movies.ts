/**
 * TypeScript interfaces for movie-related API responses from Fanart.tv
 */

import type { ImageBase, LatestResponse } from "./common.ts";

/**
 * Movie poster image with size information
 */
export interface MoviePoster extends ImageBase {
  /** Size designation for the poster (e.g., "1000", "1426") */
  size: string;
}

/**
 * Movie background image with size information
 */
export interface MovieBackground extends ImageBase {
  /** Size designation for the background (e.g., "1920x1080") */
  size: string;
}

/**
 * Movie logo image (extends base image interface)
 */
export interface MovieLogo extends ImageBase {}

/**
 * Movie disc art image (extends base image interface)
 */
export interface MovieDisc extends ImageBase {}

/**
 * Movie banner image (extends base image interface)
 */
export interface MovieBanner extends ImageBase {}

/**
 * Movie thumbnail image (extends base image interface)
 */
export interface MovieThumb extends ImageBase {}

/**
 * Complete movie artwork response from Fanart.tv API
 */
export interface MovieImages {
  /** Movie title */
  name: string;
  /** The Movie Database (TMDb) ID */
  tmdb_id: string;
  /** Internet Movie Database (IMDb) ID */
  imdb_id: string;
  /** Array of movie poster images */
  movieposter?: MoviePoster[];
  /** Array of movie background images */
  moviebackground?: MovieBackground[];
  /** Array of movie logo images */
  movielogo?: MovieLogo[];
  /** Array of movie disc art images */
  moviedisc?: MovieDisc[];
  /** Array of movie banner images */
  moviebanner?: MovieBanner[];
  /** Array of movie thumbnail images */
  moviethumb?: MovieThumb[];
}

/**
 * Response structure for latest movie artwork endpoint
 */
export interface LatestMovies extends LatestResponse<MovieImages> {}
