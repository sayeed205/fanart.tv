/**
 * Main Fanart.tv API client for accessing movie, music, and TV show artwork
 */

import { MovieModule } from './modules/movies.ts';
import { MusicModule } from './modules/music.ts';
import { TvModule } from './modules/tv.ts';

/**
 * Main Fanart.tv API client providing unified access to all artwork endpoints
 * 
 * The Fanart class serves as the primary entry point for accessing Fanart.tv's
 * extensive collection of movie, music, and TV show artwork. It provides a
 * modular interface with separate modules for different content types while
 * maintaining a unified API key management system.
 * 
 * Features:
 * - Type-safe access to all Fanart.tv API endpoints
 * - Modular architecture with separate modules for movies, music, and TV shows
 * - Support for both preview and full-size image URLs
 * - Comprehensive error handling with custom error types
 * - Native Deno fetch implementation without external dependencies
 * - Nested module access (e.g., fanart.music.artists.get())
 * 
 * @example
 * ```typescript
 * import { Fanart } from './fanart.ts';
 * 
 * // Initialize with your API key
 * const fanart = new Fanart('your-api-key-here');
 * 
 * // Access movie artwork
 * const movieArt = await fanart.movie.get(550); // Fight Club
 * console.log(movieArt.movieposter?.[0]?.url);
 * 
 * // Access music artwork with nested structure
 * const artistArt = await fanart.music.artists.get('5b11f4ce-a62d-471e-81fc-a69a8278c7da');
 * console.log(artistArt.artistbackground?.[0]?.url);
 * 
 * // Access album artwork
 * const albumArt = await fanart.music.album('f5093c06-23e3-404f-afe0-f259bbc4b5b6');
 * console.log(albumArt.albumcover?.[0]?.url);
 * 
 * // Access TV show artwork
 * const tvArt = await fanart.tv.get(81189); // Breaking Bad
 * console.log(tvArt.clearlogo?.[0]?.url);
 * 
 * // Use preview images for faster loading
 * const previews = await fanart.movie.get(550, { usePreview: true });
 * ```
 * 
 * @since 1.0.0
 */
export class Fanart {
  /** Movie module for accessing movie artwork via TMDb IDs */
  public readonly movie: MovieModule;
  
  /** Music module for accessing artist, album, and label artwork via MusicBrainz IDs */
  public readonly music: MusicModule;
  
  /** TV module for accessing TV show artwork via TVDB IDs */
  public readonly tv: TvModule;

  /**
   * Creates a new Fanart.tv API client instance
   * 
   * Initializes all module instances (movie, music, tv) with the provided API key.
   * The API key can be either a personal API key or a project API key obtained
   * from your Fanart.tv account settings.
   * 
   * @param apiKey - Your Fanart.tv API key (personal or project key)
   * 
   * @throws {Error} When API key is not provided or is empty
   * @throws {AuthenticationError} When API key is invalid (detected on first request)
   * 
   * @example
   * ```typescript
   * // Initialize with personal API key
   * const fanart = new Fanart('your-personal-api-key');
   * 
   * // Initialize with project API key
   * const fanart = new Fanart('your-project-api-key');
   * 
   * // API key validation occurs on first request
   * try {
   *   const artwork = await fanart.movie.get(550);
   * } catch (error) {
   *   if (error instanceof AuthenticationError) {
   *     console.error('Invalid API key provided');
   *   }
   * }
   * ```
   * 
   * @since 1.0.0
   */
  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error('API key is required and must be a non-empty string');
    }

    const trimmedApiKey = apiKey.trim();

    // Initialize all module instances with the same API key
    this.movie = new MovieModule(trimmedApiKey);
    this.music = new MusicModule(trimmedApiKey);
    this.tv = new TvModule(trimmedApiKey);
  }
}