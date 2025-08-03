/**
 * Base client class with common functionality for all Fanart.tv API modules
 */

import type { RequestOptions } from "../types/common.ts";
import {
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT,
  FANART_API_BASE_URL,
  PREVIEW_SUFFIX,
} from "../utils/constants.ts";
import {
  AuthenticationError,
  FanartApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
} from "../utils/errors.ts";

/**
 * Abstract base client class that provides common HTTP request handling
 * and image URL processing functionality for all Fanart.tv API modules
 */
export abstract class BaseClient {
  protected readonly apiKey: string;
  protected readonly baseUrl: string = FANART_API_BASE_URL;

  /**
   * Creates a new BaseClient instance
   *
   * @param apiKey - The Fanart.tv API key (personal or project key)
   * @throws {AuthenticationError} When API key is not provided
   */
  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      throw new AuthenticationError(
        "API key is required and must be a non-empty string",
      );
    }
    this.apiKey = apiKey.trim();
  }

  /**
   * Makes an HTTP request to the Fanart.tv API with proper error handling
   *
   * @param endpoint - The API endpoint path (e.g., '/movies/550')
   * @param options - Optional request configuration
   * @returns Promise resolving to the parsed JSON response
   *
   * @throws {AuthenticationError} When API key is invalid
   * @throws {NotFoundError} When resource is not found
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {TimeoutError} When request times out
   * @throws {NetworkError} When network error occurs
   * @throws {FanartApiError} For other API errors
   */
  protected async makeRequest<T>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...DEFAULT_HEADERS,
          "api-key": this.apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");

        switch (response.status) {
          case 401:
            throw new AuthenticationError(`Invalid API key: ${errorText}`);
          case 404:
            throw new NotFoundError(`Resource not found: ${errorText}`);
          case 429:
            throw new RateLimitError(`Rate limit exceeded: ${errorText}`);
          default:
            throw new FanartApiError(
              `API request failed: ${errorText}`,
              response.status,
              errorText,
            );
        }
      }

      const data = await response.json();

      // Process image URLs based on preview preference
      if (options?.usePreview) {
        return this.processImageUrls(data, true) as T;
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle AbortError (timeout)
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError("Request timed out after 10 seconds");
      }

      // Re-throw our custom errors
      if (error instanceof FanartApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError(`Network error: ${error.message}`);
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new FanartApiError(`Invalid JSON response: ${error.message}`);
      }

      // Handle any other unexpected errors
      throw new FanartApiError(
        `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Processes image URLs in API response data to add preview functionality
   *
   * @param data - The API response data containing image URLs
   * @param usePreview - Whether to convert URLs to preview versions
   * @returns The processed data with modified image URLs
   */
  protected processImageUrls(data: unknown, usePreview: boolean): unknown {
    if (!usePreview || !data) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.processImageUrls(item, usePreview));
    }

    // Handle objects
    if (typeof data === "object" && data !== null) {
      const processed: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        if (key === "url" && typeof value === "string") {
          // Convert image URL to preview version
          processed[key] = this.convertToPreviewUrl(value);
        } else {
          // Recursively process nested objects/arrays
          processed[key] = this.processImageUrls(value, usePreview);
        }
      }

      return processed;
    }

    // Return primitive values unchanged
    return data;
  }

  /**
   * Converts a full-size image URL to its preview version
   *
   * @param url - The original image URL
   * @returns The preview version of the URL
   */
  private convertToPreviewUrl(url: string): string {
    // Only process fanart.tv URLs
    if (!url.includes("fanart.tv")) {
      return url;
    }

    // Avoid double-processing URLs that already have preview suffix
    if (url.includes(PREVIEW_SUFFIX)) {
      return url;
    }

    // Add preview suffix before the file extension
    const lastDotIndex = url.lastIndexOf(".");
    if (lastDotIndex === -1) {
      // No file extension, append preview suffix
      return url + PREVIEW_SUFFIX;
    }

    return url.slice(0, lastDotIndex) + PREVIEW_SUFFIX +
      url.slice(lastDotIndex);
  }
}
