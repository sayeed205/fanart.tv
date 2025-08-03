/**
 * TypeScript interfaces for TV show-related API responses from Fanart.tv
 */

import type { ImageBase, LatestResponse } from './common.ts';

/**
 * TV show clear logo image interface
 */
export interface ClearLogo extends ImageBase {
  /** Size designation for the clear logo */
  size?: string;
}

/**
 * HD TV logo image interface (high definition)
 */
export interface HdTvLogo extends ImageBase {
  /** Size designation for the HD TV logo */
  size?: string;
}

/**
 * Clear art image interface for TV shows
 */
export interface ClearArt extends ImageBase {
  /** Size designation for the clear art */
  size?: string;
}

/**
 * HD clear art image interface for TV shows (high definition)
 */
export interface HdClearArt extends ImageBase {
  /** Size designation for the HD clear art */
  size?: string;
}

/**
 * TV show background image interface
 */
export interface ShowBackground extends ImageBase {
  /** Size designation for the background image */
  size?: string;
}

/**
 * TV show thumbnail image interface
 */
export interface TvThumb extends ImageBase {
  /** Size designation for the thumbnail */
  size?: string;
}

/**
 * Season poster image interface
 */
export interface SeasonPoster extends ImageBase {
  /** Season number this poster represents */
  season: string;
  /** Size designation for the season poster */
  size?: string;
}

/**
 * Season thumbnail image interface
 */
export interface SeasonThumb extends ImageBase {
  /** Season number this thumbnail represents */
  season: string;
  /** Size designation for the season thumbnail */
  size?: string;
}

/**
 * TV banner image interface
 */
export interface TvBanner extends ImageBase {
  /** Size designation for the TV banner */
  size?: string;
}

/**
 * Character art image interface
 */
export interface CharacterArt extends ImageBase {
  /** Size designation for the character art */
  size?: string;
}

/**
 * TV poster image interface
 */
export interface TvPoster extends ImageBase {
  /** Size designation for the TV poster */
  size?: string;
}

/**
 * Complete TV show images response from Fanart.tv API
 */
export interface ShowImages {
  /** TV show name */
  name: string;
  /** The TV Database (TVDB) ID */
  thetvdb_id: string;
  /** Array of clear logo images */
  clearlogo?: ClearLogo[];
  /** Array of HD TV logo images */
  hdtvlogo?: HdTvLogo[];
  /** Array of clear art images */
  clearart?: ClearArt[];
  /** Array of HD clear art images */
  hdclearart?: HdClearArt[];
  /** Array of show background images */
  showbackground?: ShowBackground[];
  /** Array of TV thumbnail images */
  tvthumb?: TvThumb[];
  /** Array of season poster images */
  seasonposter?: SeasonPoster[];
  /** Array of season thumbnail images */
  seasonthumb?: SeasonThumb[];
  /** Array of TV banner images */
  tvbanner?: TvBanner[];
  /** Array of character art images */
  characterart?: CharacterArt[];
  /** Array of TV poster images */
  tvposter?: TvPoster[];
}

/**
 * Response structure for latest TV show artwork endpoint
 */
export interface LatestShows extends LatestResponse<ShowImages> {
  /** Array of latest TV show artwork */
  [key: string]: ShowImages[];
}