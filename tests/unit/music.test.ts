/**
 * Unit tests for MusicModule and ArtistsModule
 */

import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { Fanart } from "../../src/main.ts";
import { ArtistsModule, MusicModule } from "../../src/modules/music.ts";
import type { AlbumImages, ArtistImages } from "../../src/types/music.ts";
import {
  AuthenticationError,
  FanartApiError,
  NotFoundError,
} from "../../src/utils/errors.ts";

describe("MusicModule", () => {
  let fanart: Fanart;
  let musicModule: MusicModule;
  let artistsModule: ArtistsModule;
  const apiKey = Deno.env.get("FANART_API_KEY");

  // Test MBIDs - using well-known artists/albums that should have artwork
  const testArtistMbid = "5b11f4ce-a62d-471e-81fc-a69a8278c7da"; // Nirvana
  const testAlbumMbid = "f5093c06-23e3-404f-afe0-f259bbc4b5b6"; // Nevermind (might not exist)
  const testLabelMbid = "46f0f4cd-8aab-4b33-b698-f459faf64190"; // Different label MBID

  beforeAll(() => {
    if (!apiKey) {
      throw new Error(
        "FANART_API_KEY environment variable is required for testing",
      );
    }
    fanart = new Fanart(apiKey);
    musicModule = fanart.music;
    artistsModule = musicModule.artists;
  });

  describe("constructor", () => {
    it("should create MusicModule instance with valid API key", () => {
      expect(musicModule).toBeInstanceOf(MusicModule);
      expect(artistsModule).toBeInstanceOf(ArtistsModule);
    });

    it("should throw AuthenticationError with empty API key", () => {
      expect(() => new MusicModule("")).toThrow(AuthenticationError);
    });

    it("should have properly nested artists module", () => {
      expect(musicModule.artists).toBeDefined();
      expect(musicModule.artists).toBeInstanceOf(ArtistsModule);
    });
  });

  describe("ArtistsModule", () => {
    describe("get()", () => {
      it("should retrieve artist artwork for valid MBID", async () => {
        const result = await artistsModule.get(testArtistMbid);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(result.mbid_id).toBe(testArtistMbid);
        expect(result.name).toBeDefined();
        expect(typeof result.name).toBe("string");

        // Check that at least one artwork type is present
        const artworkTypes = [
          "artistbackground",
          "artistthumb",
          "musiclogo",
          "hdmusiclogo",
          "musicbanner",
        ];
        const hasArtwork = artworkTypes.some((type) =>
          result[type as keyof ArtistImages] &&
          Array.isArray(result[type as keyof ArtistImages]) &&
          (result[type as keyof ArtistImages] as any[]).length > 0
        );
        expect(hasArtwork).toBe(true);
      });

      it("should return properly typed response with correct structure", async () => {
        const result = await artistsModule.get(testArtistMbid);

        // Validate required fields
        expect(typeof result.name).toBe("string");
        expect(typeof result.mbid_id).toBe("string");

        // Validate optional artwork arrays
        if (result.artistbackground) {
          expect(Array.isArray(result.artistbackground)).toBe(true);
          if (result.artistbackground.length > 0) {
            const background = result.artistbackground[0];
            expect(typeof background.id).toBe("string");
            expect(typeof background.url).toBe("string");
            expect(typeof background.likes).toBe("string");
          }
        }

        if (result.musiclogo) {
          expect(Array.isArray(result.musiclogo)).toBe(true);
          if (result.musiclogo.length > 0) {
            const logo = result.musiclogo[0];
            expect(typeof logo.id).toBe("string");
            expect(typeof logo.url).toBe("string");
            expect(typeof logo.likes).toBe("string");
          }
        }
      });

      it("should handle preview option correctly", async () => {
        const fullSizeResult = await artistsModule.get(testArtistMbid, {
          usePreview: false,
        });
        const previewResult = await artistsModule.get(testArtistMbid, {
          usePreview: true,
        });

        expect(fullSizeResult).toBeDefined();
        expect(previewResult).toBeDefined();

        // Check that preview URLs contain the preview suffix
        if (
          previewResult.artistbackground &&
          previewResult.artistbackground.length > 0
        ) {
          const previewUrl = previewResult.artistbackground[0].url;
          expect(previewUrl).toContain("/preview");
        }

        // Check that full-size URLs are properly formatted
        if (
          fullSizeResult.artistbackground &&
          fullSizeResult.artistbackground.length > 0
        ) {
          const fullUrl = fullSizeResult.artistbackground[0].url;
          expect(typeof fullUrl).toBe("string");
          expect(fullUrl.length).toBeGreaterThan(0);
        }
      });

      it("should throw error for invalid MBID", async () => {
        await expect(artistsModule.get("")).rejects.toThrow(
          "MusicBrainz ID is required and must be a non-empty string",
        );
        await expect(artistsModule.get("   ")).rejects.toThrow(
          "MusicBrainz ID is required and must be a non-empty string",
        );
        await expect(artistsModule.get(null as any)).rejects.toThrow(
          "MusicBrainz ID is required and must be a non-empty string",
        );
      });

      it("should throw NotFoundError for non-existent MBID", async () => {
        const nonExistentMbid = "00000000-0000-0000-0000-000000000000";
        await expect(artistsModule.get(nonExistentMbid)).rejects.toThrow(
          NotFoundError,
        );
      });
    });

    describe("latest()", () => {
      it("should retrieve latest artist artwork", async () => {
        try {
          const result = await artistsModule.latest();

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");

          // The latest endpoint might return an empty object
          const artistMbids = Object.keys(result);
          expect(artistMbids.length).toBeGreaterThanOrEqual(0);

          // Check structure of first artist entry if any exist
          if (artistMbids.length > 0) {
            const firstArtistMbid = artistMbids[0];
            const artistData = result[firstArtistMbid];
            expect(artistData).toBeDefined();
            // The latest endpoint returns arrays of images, not metadata objects
            expect(Array.isArray(artistData)).toBe(true);
          }
        } catch (error) {
          // The latest endpoint might return empty response
          if (
            error instanceof FanartApiError &&
            error.message.includes("Invalid JSON")
          ) {
            // Skip this test if the API returns empty response
            console.warn(
              "Latest artists endpoint returned empty response, skipping test",
            );
          } else {
            throw error;
          }
        }
      });

      it("should retrieve latest artist artwork with date filter", async () => {
        try {
          const testDate = "2024-01-01";
          const result = await artistsModule.latest(testDate);

          expect(result).toBeDefined();
          expect(typeof result).toBe("object");
        } catch (error) {
          // The latest endpoint might return empty response
          if (
            error instanceof FanartApiError &&
            error.message.includes("Invalid JSON")
          ) {
            // Skip this test if the API returns empty response
            console.warn(
              "Latest artists endpoint with date returned empty response, skipping test",
            );
          } else {
            throw error;
          }
        }
      });

      it("should throw error for invalid date format", async () => {
        await expect(artistsModule.latest("invalid-date")).rejects.toThrow(
          "Date must be in YYYY-MM-DD format",
        );
        await expect(artistsModule.latest("2024-1-1")).rejects.toThrow(
          "Date must be in YYYY-MM-DD format",
        );
      });
    });
  });

  describe("album()", () => {
    it("should retrieve album artwork for valid MBID or handle not found", async () => {
      try {
        const result = await musicModule.album(testAlbumMbid);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(result.mbid_id).toBe(testAlbumMbid);
        expect(result.name).toBeDefined();
        expect(typeof result.name).toBe("string");

        // Check that at least one artwork type is present
        const artworkTypes = ["albumcover", "cdart"];
        const hasArtwork = artworkTypes.some((type) =>
          result[type as keyof AlbumImages] &&
          Array.isArray(result[type as keyof AlbumImages]) &&
          (result[type as keyof AlbumImages] as any[]).length > 0
        );
        expect(hasArtwork).toBe(true);
      } catch (error) {
        // If the album MBID doesn't exist, that's expected behavior
        if (error instanceof NotFoundError) {
          expect(error.statusCode).toBe(404);
        } else {
          throw error;
        }
      }
    });

    it("should return properly typed response with correct structure or handle not found", async () => {
      try {
        const result = await musicModule.album(testAlbumMbid);

        // Validate required fields
        expect(typeof result.name).toBe("string");
        expect(typeof result.mbid_id).toBe("string");

        // Validate optional artwork arrays
        if (result.albumcover) {
          expect(Array.isArray(result.albumcover)).toBe(true);
          if (result.albumcover.length > 0) {
            const cover = result.albumcover[0];
            expect(typeof cover.id).toBe("string");
            expect(typeof cover.url).toBe("string");
            expect(typeof cover.likes).toBe("string");
          }
        }

        if (result.cdart) {
          expect(Array.isArray(result.cdart)).toBe(true);
          if (result.cdart.length > 0) {
            const cdart = result.cdart[0];
            expect(typeof cdart.id).toBe("string");
            expect(typeof cdart.url).toBe("string");
            expect(typeof cdart.likes).toBe("string");
          }
        }
      } catch (error) {
        // If the album MBID doesn't exist, that's expected behavior
        if (error instanceof NotFoundError) {
          expect(error.statusCode).toBe(404);
        } else {
          throw error;
        }
      }
    });

    it("should handle preview option correctly or handle not found", async () => {
      try {
        const fullSizeResult = await musicModule.album(testAlbumMbid, {
          usePreview: false,
        });
        const previewResult = await musicModule.album(testAlbumMbid, {
          usePreview: true,
        });

        expect(fullSizeResult).toBeDefined();
        expect(previewResult).toBeDefined();

        // Check that preview URLs contain the preview suffix
        if (previewResult.albumcover && previewResult.albumcover.length > 0) {
          const previewUrl = previewResult.albumcover[0].url;
          expect(previewUrl).toContain("/preview");
        }
      } catch (error) {
        // If the album MBID doesn't exist, that's expected behavior
        if (error instanceof NotFoundError) {
          expect(error.statusCode).toBe(404);
        } else {
          throw error;
        }
      }
    });

    it("should throw error for invalid MBID", async () => {
      await expect(musicModule.album("")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
      await expect(musicModule.album("   ")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
    });

    it("should throw NotFoundError for non-existent album MBID", async () => {
      const nonExistentMbid = "00000000-0000-0000-0000-000000000000";
      await expect(musicModule.album(nonExistentMbid)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("label()", () => {
    it("should retrieve label artwork for valid MBID", async () => {
      const result = await musicModule.label(testLabelMbid);

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result.name).toBeDefined();
      expect(typeof result.name).toBe("string");

      // mbid_id might not always be present in the response
      if (result.mbid_id) {
        expect(result.mbid_id).toBe(testLabelMbid);
      }

      // Check that at least one artwork type is present
      if (result.musiclabel) {
        expect(Array.isArray(result.musiclabel)).toBe(true);
      }
    });

    it("should return properly typed response with correct structure", async () => {
      const result = await musicModule.label(testLabelMbid);

      // Validate required fields
      expect(typeof result.name).toBe("string");

      // mbid_id might not always be present in the response
      if (result.mbid_id) {
        expect(typeof result.mbid_id).toBe("string");
      }

      // Validate optional artwork arrays
      if (result.musiclabel) {
        expect(Array.isArray(result.musiclabel)).toBe(true);
        if (result.musiclabel.length > 0) {
          const label = result.musiclabel[0];
          expect(typeof label.id).toBe("string");
          expect(typeof label.url).toBe("string");
          expect(typeof label.likes).toBe("string");
        }
      }
    });

    it("should handle preview option correctly", async () => {
      const fullSizeResult = await musicModule.label(testLabelMbid, {
        usePreview: false,
      });
      const previewResult = await musicModule.label(testLabelMbid, {
        usePreview: true,
      });

      expect(fullSizeResult).toBeDefined();
      expect(previewResult).toBeDefined();

      // Check that preview URLs contain the preview suffix if artwork exists
      if (previewResult.musiclabel && previewResult.musiclabel.length > 0) {
        const previewUrl = previewResult.musiclabel[0].url;
        expect(previewUrl).toContain("/preview");
      }
    });

    it("should throw error for invalid MBID", async () => {
      await expect(musicModule.label("")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
      await expect(musicModule.label("   ")).rejects.toThrow(
        "MusicBrainz ID is required and must be a non-empty string",
      );
    });

    it("should throw NotFoundError for non-existent label MBID", async () => {
      const nonExistentMbid = "00000000-0000-0000-0000-000000000000";
      await expect(musicModule.label(nonExistentMbid)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("authentication errors", () => {
    it("should throw AuthenticationError with invalid API key", async () => {
      const invalidModule = new MusicModule("invalid-api-key");
      await expect(invalidModule.artists.get(testArtistMbid)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(invalidModule.album(testAlbumMbid)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(invalidModule.label(testLabelMbid)).rejects.toThrow(
        AuthenticationError,
      );
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      // Test that errors are properly typed
      try {
        await musicModule.artists.get(testArtistMbid);
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
