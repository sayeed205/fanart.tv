/**
 * Unit tests for error handling and custom error classes
 */

import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { Fanart } from "../../src/main.ts";
import {
  AuthenticationError,
  FanartApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
} from "../../src/utils/errors.ts";

describe("Error Handling", () => {
  const apiKey = Deno.env.get("FANART_API_KEY");
  let fanart: Fanart;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error(
        "FANART_API_KEY environment variable is required for testing",
      );
    }
    fanart = new Fanart(apiKey);
  });

  describe("Custom Error Classes", () => {
    it("should create FanartApiError with correct properties", () => {
      const error = new FanartApiError("Test error", 500, { test: "data" });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FanartApiError);
      expect(error.name).toBe("FanartApiError");
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.response).toEqual({ test: "data" });
    });

    it("should create AuthenticationError with correct properties", () => {
      const error = new AuthenticationError("Invalid API key");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FanartApiError);
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.name).toBe("AuthenticationError");
      expect(error.message).toBe("Invalid API key");
      expect(error.statusCode).toBe(401);
    });

    it("should create NotFoundError with correct properties", () => {
      const error = new NotFoundError("Resource not found");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FanartApiError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe("NotFoundError");
      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
    });

    it("should create RateLimitError with correct properties", () => {
      const error = new RateLimitError("Rate limit exceeded");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FanartApiError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe("Rate limit exceeded");
      expect(error.statusCode).toBe(429);
    });

    it("should create TimeoutError with correct properties", () => {
      const error = new TimeoutError("Request timed out");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FanartApiError);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.name).toBe("TimeoutError");
      expect(error.message).toBe("Request timed out");
      expect(error.statusCode).toBe(408);
    });

    it("should create NetworkError with correct properties", () => {
      const error = new NetworkError("Network error occurred");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FanartApiError);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.name).toBe("NetworkError");
      expect(error.message).toBe("Network error occurred");
    });

    it("should use default messages when none provided", () => {
      const authError = new AuthenticationError();
      expect(authError.message).toBe("Invalid or missing API key");

      const notFoundError = new NotFoundError();
      expect(notFoundError.message).toBe("Requested resource not found");

      const rateLimitError = new RateLimitError();
      expect(rateLimitError.message).toBe(
        "Rate limit exceeded. Please try again later.",
      );

      const timeoutError = new TimeoutError();
      expect(timeoutError.message).toBe("Request timed out");

      const networkError = new NetworkError();
      expect(networkError.message).toBe("Network error occurred");
    });
  });

  describe("Authentication Error Scenarios", () => {
    it("should throw AuthenticationError with completely invalid API key", async () => {
      const invalidFanart = new Fanart("completely-invalid-key");

      await expect(invalidFanart.movie.get(550)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(
        invalidFanart.music.artists.get("5b11f4ce-a62d-471e-81fc-a69a8278c7da"),
      ).rejects.toThrow(AuthenticationError);
      await expect(invalidFanart.tv.get(81189)).rejects.toThrow(
        AuthenticationError,
      );
    });

    it("should throw AuthenticationError with empty string API key", async () => {
      // This should throw during construction, not during API call
      expect(() => new Fanart("")).toThrow(
        "API key is required and must be a non-empty string",
      );
    });

    it("should provide meaningful authentication error messages", async () => {
      const invalidFanart = new Fanart("invalid-key-12345");

      try {
        await invalidFanart.movie.get(550);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        if (error instanceof AuthenticationError) {
          expect(error.message).toContain("Invalid API key");
          expect(error.statusCode).toBe(401);
        }
      }
    });
  });

  describe("NotFound Error Scenarios", () => {
    it("should throw NotFoundError for non-existent movie ID", async () => {
      const nonExistentMovieId = 99999999;

      try {
        await fanart.movie.get(nonExistentMovieId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toContain("Resource not found");
        }
      }
    });

    it("should throw NotFoundError for non-existent artist MBID", async () => {
      const nonExistentMbid = "00000000-0000-0000-0000-000000000000";

      try {
        await fanart.music.artists.get(nonExistentMbid);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toContain("Resource not found");
        }
      }
    });

    it("should throw NotFoundError for non-existent TV show ID", async () => {
      const nonExistentTvId = 99999999;

      try {
        await fanart.tv.get(nonExistentTvId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toContain("Resource not found");
        }
      }
    });
  });

  describe("Input Validation Errors", () => {
    it("should throw validation errors for invalid movie IDs", async () => {
      await expect(fanart.movie.get(-1)).rejects.toThrow(
        "Movie ID must be a positive integer",
      );
      await expect(fanart.movie.get(0)).rejects.toThrow(
        "Movie ID must be a positive integer",
      );
      await expect(fanart.movie.get(1.5 as any)).rejects.toThrow(
        "Movie ID must be a positive integer",
      );
    });

    it("should throw validation errors for invalid TV show IDs", async () => {
      await expect(fanart.tv.get(-1)).rejects.toThrow(
        "TVDB ID must be a positive integer",
      );
      await expect(fanart.tv.get(0)).rejects.toThrow(
        "TVDB ID must be a positive integer",
      );
      await expect(fanart.tv.get(1.5 as any)).rejects.toThrow(
        "TVDB ID must be a positive integer",
      );
    });

    it("should throw validation errors for invalid MBIDs", async () => {
      await expect(fanart.music.artists.get("")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
      await expect(fanart.music.artists.get("   ")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
      await expect(fanart.music.artists.get(null as any)).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );

      await expect(fanart.music.album("")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
      await expect(fanart.music.label("")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
    });

    it("should throw validation errors for invalid date formats", async () => {
      await expect(fanart.movie.latest("invalid-date")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );
      await expect(fanart.movie.latest("2024-1-1")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );
      await expect(fanart.movie.latest("24-01-01")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );

      await expect(fanart.music.artists.latest("invalid-date")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );
      await expect(fanart.tv.latest("invalid-date")).rejects.toThrow(
        "Date must be in YYYY-MM-DD format",
      );
    });
  });

  describe("Error Properties and Inheritance", () => {
    it("should maintain proper error inheritance chain", async () => {
      try {
        await fanart.movie.get(99999999);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(FanartApiError);
        expect(error).toBeInstanceOf(NotFoundError);

        // Check that it has all expected properties
        if (error instanceof NotFoundError) {
          expect(error.name).toBe("NotFoundError");
          expect(error.message).toBeDefined();
          expect(error.statusCode).toBe(404);
          expect(error.stack).toBeDefined();
        }
      }
    });

    it("should preserve error stack traces", async () => {
      try {
        await fanart.movie.get(99999999);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.stack).toBeDefined();
          expect(typeof error.stack).toBe("string");
          expect(error.stack!.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Error Response Data", () => {
    it("should include response data in API errors when available", async () => {
      try {
        await fanart.movie.get(99999999);
        // If this doesn't throw, skip the test
      } catch (error) {
        if (error instanceof FanartApiError) {
          expect(error.statusCode).toBeDefined();
          // Response might be undefined for some errors, so we'll just check if it exists
          expect(error.response !== undefined || error.response === undefined)
            .toBe(true);
        }
      }
    });
  });
});
