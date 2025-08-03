/**
 * Common types and interfaces shared across all Fanart.tv API modules
 */

/**
 * Base interface for all image types in the Fanart.tv API
 */
export interface ImageBase {
  /** Unique identifier for the image */
  id: string;
  /** Direct URL to the image */
  url: string;
  /** Number of likes the image has received */
  likes: string;
  /** Language code for the image (optional) */
  lang?: string;
  /** Size designation for the image (optional) */
  size?: string;
}

/**
 * Generic collection type for artwork arrays
 */
export interface ArtworkCollection<T extends ImageBase> {
  [key: string]: T[];
}

/**
 * Request options that can be passed to API methods
 */
export interface RequestOptions {
  /** Whether to return preview-sized images instead of full-size (default: false) */
  usePreview?: boolean;
}

/**
 * Base response structure for latest endpoints
 */
export interface LatestResponse<T> {
  /** Array of latest items */
  [key: string]: T[];
}
