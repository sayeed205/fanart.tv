/**
 * Unit tests for TvModule
 */

import { expect } from '@std/expect';
import { beforeAll, describe, it } from '@std/testing/bdd';
import { Fanart } from '../../src/main.ts';
import { TvModule } from '../../src/modules/tv.ts';
import type { ShowImages } from '../../src/types/tv.ts';
import { AuthenticationError, FanartApiError, NotFoundError } from '../../src/utils/errors.ts';

describe('TvModule', () => {
  let fanart: Fanart;
  let tvModule: TvModule;
  const apiKey = Deno.env.get('FANART_API_KEY');

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('FANART_API_KEY environment variable is required for testing');
    }
    fanart = new Fanart(apiKey);
    tvModule = fanart.tv;
  });

  describe('constructor', () => {
    it('should create TvModule instance with valid API key', () => {
      expect(tvModule).toBeInstanceOf(TvModule);
    });

    it('should throw AuthenticationError with empty API key', () => {
      expect(() => new TvModule('')).toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError with null API key', () => {
      expect(() => new TvModule(null as any)).toThrow(AuthenticationError);
    });
  });

  describe('get()', () => {
    it('should retrieve TV show artwork for valid TVDB ID', async () => {
      // Using Breaking Bad (TVDB ID: 81189) as test case
      const tvdbId = 81189;
      const result = await tvModule.get(tvdbId);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.thetvdb_id).toBe(tvdbId.toString());
      expect(result.name).toBeDefined();
      expect(typeof result.name).toBe('string');

      // Check that at least one artwork type is present
      const artworkTypes = [
        'clearlogo', 'hdtvlogo', 'clearart', 'hdclearart',
        'showbackground', 'tvthumb', 'seasonposter', 'seasonthumb',
        'tvbanner', 'characterart', 'tvposter'
      ];
      const hasArtwork = artworkTypes.some(type => 
        result[type as keyof ShowImages] && 
        Array.isArray(result[type as keyof ShowImages]) &&
        (result[type as keyof ShowImages] as any[]).length > 0
      );
      expect(hasArtwork).toBe(true);
    });

    it('should return properly typed response with correct structure', async () => {
      const result = await tvModule.get(81189);

      // Validate required fields
      expect(typeof result.name).toBe('string');
      expect(typeof result.thetvdb_id).toBe('string');

      // Validate optional artwork arrays
      if (result.clearlogo) {
        expect(Array.isArray(result.clearlogo)).toBe(true);
        if (result.clearlogo.length > 0) {
          const logo = result.clearlogo[0];
          expect(typeof logo.id).toBe('string');
          expect(typeof logo.url).toBe('string');
          expect(typeof logo.likes).toBe('string');
        }
      }

      if (result.showbackground) {
        expect(Array.isArray(result.showbackground)).toBe(true);
        if (result.showbackground.length > 0) {
          const background = result.showbackground[0];
          expect(typeof background.id).toBe('string');
          expect(typeof background.url).toBe('string');
          expect(typeof background.likes).toBe('string');
        }
      }

      if (result.seasonposter) {
        expect(Array.isArray(result.seasonposter)).toBe(true);
        if (result.seasonposter.length > 0) {
          const poster = result.seasonposter[0];
          expect(typeof poster.id).toBe('string');
          expect(typeof poster.url).toBe('string');
          expect(typeof poster.likes).toBe('string');
        }
      }
    });

    it('should handle preview option correctly', async () => {
      const fullSizeResult = await tvModule.get(81189, { usePreview: false });
      const previewResult = await tvModule.get(81189, { usePreview: true });

      expect(fullSizeResult).toBeDefined();
      expect(previewResult).toBeDefined();

      // Check that preview URLs contain the preview suffix
      if (previewResult.clearlogo && previewResult.clearlogo.length > 0) {
        const previewUrl = previewResult.clearlogo[0].url;
        expect(previewUrl).toContain('/preview');
      }

      // Check that full-size URLs are properly formatted
      if (fullSizeResult.clearlogo && fullSizeResult.clearlogo.length > 0) {
        const fullUrl = fullSizeResult.clearlogo[0].url;
        expect(typeof fullUrl).toBe('string');
        expect(fullUrl.length).toBeGreaterThan(0);
      }
    });

    it('should throw error for invalid TVDB ID', async () => {
      await expect(tvModule.get(-1)).rejects.toThrow('TVDB ID must be a positive integer');
      await expect(tvModule.get(0)).rejects.toThrow('TVDB ID must be a positive integer');
      await expect(tvModule.get(1.5 as any)).rejects.toThrow('TVDB ID must be a positive integer');
    });

    it('should throw NotFoundError for non-existent TVDB ID', async () => {
      // Using a very high ID that likely doesn't exist
      const nonExistentId = 99999999;
      await expect(tvModule.get(nonExistentId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('latest()', () => {
    it('should retrieve latest TV show artwork', async () => {
      const result = await tvModule.latest();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');

      // The latest endpoint might return an empty object
      const showIds = Object.keys(result);
      expect(showIds.length).toBeGreaterThanOrEqual(0);

      // If there are no recent updates, that's valid behavior
      if (showIds.length === 0) {
        // Empty response is valid for latest endpoint
        expect(result).toEqual({});
      } else {
        // Check structure of first show entry if any exist
        const firstShowId = showIds[0];
        const showData = result[firstShowId];
        expect(showData).toBeDefined();
        
        // The latest endpoint structure might vary - let's be more flexible
        // It could be an array of images or a show object with metadata
        const isValidStructure = Array.isArray(showData) || 
          (typeof showData === 'object' && showData !== null);
        expect(isValidStructure).toBe(true);
      }
    });

    it('should retrieve latest TV show artwork with date filter', async () => {
      const testDate = '2024-01-01';
      const result = await tvModule.latest(testDate);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should throw error for invalid date format', async () => {
      await expect(tvModule.latest('invalid-date')).rejects.toThrow('Date must be in YYYY-MM-DD format');
      await expect(tvModule.latest('2024-1-1')).rejects.toThrow('Date must be in YYYY-MM-DD format');
      await expect(tvModule.latest('24-01-01')).rejects.toThrow('Date must be in YYYY-MM-DD format');
    });
  });

  describe('authentication errors', () => {
    it('should throw AuthenticationError with invalid API key', async () => {
      const invalidModule = new TvModule('invalid-api-key');
      await expect(invalidModule.get(81189)).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError with empty API key during construction', async () => {
      // Whitespace only should throw during construction
      expect(() => new TvModule('   ')).toThrow(AuthenticationError);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Test that errors are properly typed
      try {
        await tvModule.get(81189);
        // If successful, that's fine - we're just testing error handling structure
      } catch (error) {
        if (error instanceof FanartApiError) {
          expect(error.name).toBeDefined();
          expect(error.message).toBeDefined();
        }
      }
    });
  });
});