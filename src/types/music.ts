/**
 * TypeScript interfaces for music-related API responses from Fanart.tv
 */

import type { ImageBase, LatestResponse } from './common.ts';

/**
 * Artist background image interface
 */
export interface ArtistBackground extends ImageBase {
  /** Size designation for the background image */
  size?: string;
}

/**
 * Artist thumbnail image interface
 */
export interface ArtistThumb extends ImageBase {
  /** Size designation for the thumbnail image */
  size?: string;
}

/**
 * Music logo image interface (standard definition)
 */
export interface MusicLogo extends ImageBase {
  /** Size designation for the logo */
  size?: string;
}

/**
 * HD music logo image interface (high definition)
 */
export interface HdMusicLogo extends ImageBase {
  /** Size designation for the HD logo */
  size?: string;
}

/**
 * Music banner image interface
 */
export interface MusicBanner extends ImageBase {
  /** Size designation for the banner */
  size?: string;
}

/**
 * Album cover image interface
 */
export interface AlbumCover extends ImageBase {
  /** Size designation for the album cover */
  size?: string;
}

/**
 * CD art image interface
 */
export interface CdArt extends ImageBase {
  /** Size designation for the CD art */
  size?: string;
  /** Disc number for multi-disc albums */
  disc?: string;
}

/**
 * Label image interface
 */
export interface LabelImage extends ImageBase {
  /** Color variant of the label image */
  colour?: string;
}

/**
 * Complete artist images response from Fanart.tv API
 */
export interface ArtistImages {
  /** Artist name */
  name: string;
  /** MusicBrainz ID for the artist */
  mbid_id: string;
  /** Array of artist background images */
  artistbackground?: ArtistBackground[];
  /** Array of artist thumbnail images */
  artistthumb?: ArtistThumb[];
  /** Array of standard definition music logos */
  musiclogo?: MusicLogo[];
  /** Array of high definition music logos */
  hdmusiclogo?: HdMusicLogo[];
  /** Array of music banner images */
  musicbanner?: MusicBanner[];
}

/**
 * Complete album images response from Fanart.tv API
 */
export interface AlbumImages {
  /** Album name */
  name: string;
  /** MusicBrainz ID for the album */
  mbid_id: string;
  /** Array of album cover images */
  albumcover?: AlbumCover[];
  /** Array of CD art images */
  cdart?: CdArt[];
}

/**
 * Complete label images response from Fanart.tv API
 */
export interface LabelImages {
  /** Label name */
  name: string;
  /** MusicBrainz ID for the label */
  mbid_id: string;
  /** Array of label images */
  musiclabel?: LabelImage[];
}

/**
 * Latest artists response structure
 */
export interface LatestArtists extends LatestResponse<ArtistImages> {
  /** Array of latest artist artwork */
  [key: string]: ArtistImages[];
}