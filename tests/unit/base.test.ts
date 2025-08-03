/**
 * Unit tests for BaseClient and main Fanart class
 */

import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { Fanart } from "../../src/main.ts";
import { MovieModule } from "../../src/modules/movies.ts";
import { MusicModule } from "../../src/modules/music.ts";
import { TvModule } from "../../src/modules/tv.ts";
import { AuthenticationError, FanartApiError } from "../../src/utils/errors.ts";

describe("Fanart Client", () => {
  const apiKey = Deno.env.get("FANART_API_KEY");

  beforeAll(() => {
    if (!apiKey) {
      throw new Error(
        "FANART_API_KEY environment variable is required for testing",
      );
    }
  });

  describe("constructor", () => {
    it("should create Fanart instance with valid API key", () => {
      const fanart = new Fanart(apiKey!);

      expect(fanart).toBeInstanceOf(Fanart);
      expect(fanart.movie).toBeInstanceOf(MovieModule);
      expect(fanart.music).toBeInstanceOf(MusicModule);
      expect(fanart.tv).toBeInstanceOf(TvModule);
    });

    it("should throw error with empty API key", () => {
      expect(() => new Fanart("")).toThrow(
        "API key is required and must be a non-empty string",
      );
    });

    it("should throw error with null API key", () => {
      expect(() => new Fanart(null as any)).toThrow(
        "API key is required and must be a non-empty string",
      );
    });

    it("should throw error with undefined API key", () => {
      expect(() => new Fanart(undefined as any)).toThrow(
        "API key is required and must be a non-empty string",
      );
    });

    it("should throw error with whitespace-only API key", () => {
      expect(() => new Fanart("   ")).toThrow(
        "API key is required and must be a non-empty string",
      );
    });

    it("should trim API key whitespace", () => {
      const fanart = new Fanart(`  ${apiKey}  `);
      expect(fanart).toBeInstanceOf(Fanart);
    });
  });

  describe("module initialization", () => {
    let fanart: Fanart;

    beforeAll(() => {
      fanart = new Fanart(apiKey!);
    });

    it("should initialize movie module correctly", () => {
      expect(fanart.movie).toBeDefined();
      expect(fanart.movie).toBeInstanceOf(MovieModule);
      expect(typeof fanart.movie.get).toBe("function");
      expect(typeof fanart.movie.latest).toBe("function");
    });

    it("should initialize music module correctly", () => {
      expect(fanart.music).toBeDefined();
      expect(fanart.music).toBeInstanceOf(MusicModule);
      expect(typeof fanart.music.album).toBe("function");
      expect(typeof fanart.music.label).toBe("function");
      expect(fanart.music.artists).toBeDefined();
      expect(typeof fanart.music.artists.get).toBe("function");
      expect(typeof fanart.music.artists.latest).toBe("function");
    });

    it("should initialize TV module correctly", () => {
      expect(fanart.tv).toBeDefined();
      expect(fanart.tv).toBeInstanceOf(TvModule);
      expect(typeof fanart.tv.get).toBe("function");
      expect(typeof fanart.tv.latest).toBe("function");
    });
  });

  describe("nested module access", () => {
    let fanart: Fanart;

    beforeAll(() => {
      fanart = new Fanart(apiKey!);
    });

    it("should support nested music.artists access", () => {
      expect(fanart.music.artists).toBeDefined();
      expect(typeof fanart.music.artists.get).toBe("function");
      expect(typeof fanart.music.artists.latest).toBe("function");
    });

    it("should allow chained method calls", async () => {
      // Test that the nested structure works for actual API calls
      const testArtistMbid = "5b11f4ce-a62d-471e-81fc-a69a8278c7da"; // Nirvana
      const result = await fanart.music.artists.get(testArtistMbid);

      expect(result).toBeDefined();
      expect(result.mbid_id).toBe(testArtistMbid);
    });
  });

  describe("API key validation", () => {
    it("should detect invalid API key on first request", async () => {
      const invalidFanart = new Fanart("invalid-api-key-12345");

      // The constructor should succeed, but the first API call should fail
      expect(invalidFanart).toBeInstanceOf(Fanart);

      // Test with movie module
      await expect(invalidFanart.movie.get(550)).rejects.toThrow(
        AuthenticationError,
      );

      // Test with music module
      await expect(
        invalidFanart.music.artists.get("5b11f4ce-a62d-471e-81fc-a69a8278c7da"),
      ).rejects.toThrow(AuthenticationError);

      // Test with TV module
      await expect(invalidFanart.tv.get(81189)).rejects.toThrow(
        AuthenticationError,
      );
    });
  });

  describe("preview functionality integration", () => {
    let fanart: Fanart;

    beforeAll(() => {
      fanart = new Fanart(apiKey!);
    });

    it("should handle preview option across all modules", async () => {
      // Test movie module preview
      const movieResult = await fanart.movie.get(550, { usePreview: true });
      if (movieResult.movieposter && movieResult.movieposter.length > 0) {
        expect(movieResult.movieposter[0].url).toContain("/preview");
      }

      // Test music module preview
      const artistResult = await fanart.music.artists.get(
        "5b11f4ce-a62d-471e-81fc-a69a8278c7da",
        { usePreview: true },
      );
      if (
        artistResult.artistbackground &&
        artistResult.artistbackground.length > 0
      ) {
        expect(artistResult.artistbackground[0].url).toContain("/preview");
      }

      // Test TV module preview
      const tvResult = await fanart.tv.get(81189, { usePreview: true });
      if (tvResult.clearlogo && tvResult.clearlogo.length > 0) {
        expect(tvResult.clearlogo[0].url).toContain("/preview");
      }
    });

    it("should not modify URLs when preview is false", async () => {
      const movieResult = await fanart.movie.get(550, { usePreview: false });
      if (movieResult.movieposter && movieResult.movieposter.length > 0) {
        const url = movieResult.movieposter[0].url;
        expect(typeof url).toBe("string");
        expect(url.length).toBeGreaterThan(0);
        // URL should not contain preview suffix unless it was already there
      }
    });
  });

  describe("error handling consistency", () => {
    let fanart: Fanart;

    beforeAll(() => {
      fanart = new Fanart(apiKey!);
    });

    it("should throw consistent error types across modules", async () => {
      // Test NotFoundError consistency
      await expect(fanart.movie.get(99999999)).rejects.toThrow(
        "Resource not found",
      );
      await expect(
        fanart.music.artists.get("00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow("Resource not found");
      await expect(fanart.tv.get(99999999)).rejects.toThrow(
        "Resource not found",
      );
    });

    it("should provide meaningful error messages", async () => {
      try {
        await fanart.movie.get(99999999);
      } catch (error) {
        expect(error).toBeInstanceOf(FanartApiError);
        if (error instanceof FanartApiError) {
          expect(error.message).toBeDefined();
          expect(error.message.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("type safety validation", () => {
    let fanart: Fanart;

    beforeAll(() => {
      fanart = new Fanart(apiKey!);
    });

    it("should return properly typed responses", async () => {
      // Test that TypeScript types are correctly applied
      const movieResult = await fanart.movie.get(550);
      expect(typeof movieResult.name).toBe("string");
      expect(typeof movieResult.tmdb_id).toBe("string");
      expect(typeof movieResult.imdb_id).toBe("string");

      const artistResult = await fanart.music.artists.get(
        "5b11f4ce-a62d-471e-81fc-a69a8278c7da",
      );
      expect(typeof artistResult.name).toBe("string");
      expect(typeof artistResult.mbid_id).toBe("string");

      const tvResult = await fanart.tv.get(81189);
      expect(typeof tvResult.name).toBe("string");
      expect(typeof tvResult.thetvdb_id).toBe("string");
    });
  });
});
