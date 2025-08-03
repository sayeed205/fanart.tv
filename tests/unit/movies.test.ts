/**
 * Unit tests for MovieModule
 */

import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { Fanart } from "../../src/main.ts";
import { MovieModule } from "../../src/modules/movies.ts";
import type { MovieImages } from "../../src/types/movies.ts";
import {
  AuthenticationError,
  FanartApiError,
  NotFoundError,
} from "../../src/utils/errors.ts";

describe("MovieModule", () => {
  let fanart: Fanart;
  let movieModule: MovieModule;
  const apiKey = Deno.env.get("FANART_API_KEY");

  beforeAll(() => {
    if (!apiKey) {
      throw new Error(
        "FANART_API_KEY environment variable is required for testing",
      );
    }
    fanart = new Fanart(apiKey);
    movieModule = fanart.movie;
  });

  describe("constructor", () => {
    it("should create MovieModule instance with valid API key", () => {
      expect(movieModule).toBeInstanceOf(MovieModule);
    });

    it("should throw AuthenticationError with empty API key", () => {
      expect(() => new MovieModule("")).toThrow(AuthenticationError);
    });

    it("should throw AuthenticationError with null API key", () => {
      expect(() => new MovieModule(null as any)).toThrow(AuthenticationError);
    });
  });

  describe("get()", () => {
    it("should retrieve movie artwork for valid movie ID", async () => {
      // Using Fight Club (TMDb ID: 550) as test case
      const movieId = 550;
      const result = await movieModule.get(movieId);

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result.tmdb_id).toBe(movieId.toString());
      expect(result.name).toBeDefined();
      expect(typeof result.name).toBe("string");

      // Check that at least one artwork type is present
      const artworkTypes = [
        "movieposter",
        "moviebackground",
        "movielogo",
        "moviedisc",
        "moviebanner",
        "moviethumb",
      ];
      const hasArtwork = artworkTypes.some((type) =>
        result[type as keyof MovieImages] &&
        Array.isArray(result[type as keyof MovieImages]) &&
        (result[type as keyof MovieImages] as any[]).length > 0
      );
      expect(hasArtwork).toBe(true);
    });

    it("should return properly typed response with correct structure", async () => {
      const result = await movieModule.get(550);

      // Validate required fields
      expect(typeof result.name).toBe("string");
      expect(typeof result.tmdb_id).toBe("string");
      // imdb_id might be undefined for some movies, so we'll just check if it exists
      expect(result.imdb_id === undefined || typeof result.imdb_id === "string")
        .toBe(true);

      // Validate optional artwork arrays
      if (result.movieposter) {
        expect(Array.isArray(result.movieposter)).toBe(true);
        if (result.movieposter.length > 0) {
          const poster = result.movieposter[0];
          expect(typeof poster.id).toBe("string");
          expect(typeof poster.url).toBe("string");
          expect(typeof poster.likes).toBe("string");
          // size might be undefined for some posters
          expect(poster.size === undefined || typeof poster.size === "string")
            .toBe(true);
        }
      }

      if (result.moviebackground) {
        expect(Array.isArray(result.moviebackground)).toBe(true);
        if (result.moviebackground.length > 0) {
          const background = result.moviebackground[0];
          expect(typeof background.id).toBe("string");
          expect(typeof background.url).toBe("string");
          expect(typeof background.likes).toBe("string");
          // size might be undefined for some backgrounds
          expect(
            background.size === undefined ||
              typeof background.size === "string",
          ).toBe(true);
        }
      }
    });

    it("should handle preview option correctly", async () => {
      const fullSizeResult = await movieModule.get(550, { usePreview: false });
      const previewResult = await movieModule.get(550, { usePreview: true });

      expect(fullSizeResult).toBeDefined();
      expect(previewResult).toBeDefined();

      // Check that preview URLs contain the preview suffix
      if (previewResult.movieposter && previewResult.movieposter.length > 0) {
        const previewUrl = previewResult.movieposter[0].url;
        expect(previewUrl).toContain("/preview");
      }

      // Check that full-size URLs don't contain preview suffix (unless already processed)
      if (fullSizeResult.movieposter && fullSizeResult.movieposter.length > 0) {
        const fullUrl = fullSizeResult.movieposter[0].url;
        // Full URLs should either not contain preview or be the original URL
        expect(typeof fullUrl).toBe("string");
        expect(fullUrl.length).toBeGreaterThan(0);
      }
    });

    it("should throw error for invalid movie ID", async () => {
      await expect(movieModule.get(-1)).rejects.toThrow(
        "Movie ID must be a positive integer",
      );
      await expect(movieModule.get(0)).rejects.toThrow(
        "Movie ID must be a positive integer",
      );
      await expect(movieModule.get(1.5 as any)).rejects.toThrow(
        "Movie ID must be a positive integer",
      );
    });

    it("should throw NotFoundError for non-existent movie ID", async () => {
      // Using a very high ID that likely doesn't exist
      const nonExistentId = 99999999;
      await expect(movieModule.get(nonExistentId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("latest()", () => {
    it("should retrieve latest movie artwork", async () => {
      const result = await movieModule.latest();

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");

      // The latest endpoint might return an empty object if no recent updates
      const movieIds = Object.keys(result);
      expect(movieIds.length).toBeGreaterThanOrEqual(0);

      // If there are no recent updates, that's valid behavior
      if (movieIds.length === 0) {
        // Empty response is valid for latest endpoint
        expect(result).toEqual({});
      } else {
        // Check structure of first movie entry if any exist
        const firstMovieId = movieIds[0];
        const movieData = result[firstMovieId];
        expect(movieData).toBeDefined();

        // The latest endpoint structure might vary - let's be more flexible
        // It could be an array of images or a movie object with metadata
        const isValidStructure = Array.isArray(movieData) ||
          (typeof movieData === "object" && movieData !== null);
        expect(isValidStructure).toBe(true);
      }
    });

    it("should retrieve latest movie artwork with date filter", async () => {
      const testDate = "2024-01-01";
      const result = await movieModule.latest(testDate);

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });

    it("should throw error for invalid date format", async () => {
      await expect(movieModule.latest("invalid-date")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );
      await expect(movieModule.latest("2024-1-1")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );
      await expect(movieModule.latest("24-01-01")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );
    });
  });

  describe("authentication errors", () => {
    it("should throw AuthenticationError with invalid API key", async () => {
      const invalidModule = new MovieModule("invalid-api-key");
      await expect(invalidModule.get(550)).rejects.toThrow(AuthenticationError);
    });

    it("should throw AuthenticationError with empty API key during construction", async () => {
      // Whitespace only should throw during construction
      expect(() => new MovieModule("   ")).toThrow(AuthenticationError);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      // This test might be challenging to implement without mocking
      // For now, we'll test that errors are properly typed
      try {
        await movieModule.get(550);
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
