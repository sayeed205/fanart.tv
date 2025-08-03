/**
 * Custom error classes for Fanart.tv API client
 */

/**
 * Base error class for all Fanart.tv API related errors
 */
export class FanartApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = "FanartApiError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FanartApiError);
    }
  }
}

/**
 * Error thrown when API key is invalid or missing
 */
export class AuthenticationError extends FanartApiError {
  constructor(message: string = "Invalid or missing API key") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends FanartApiError {
  constructor(
    message: string = "Rate limit exceeded. Please try again later.",
  ) {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

/**
 * Error thrown when requested resource is not found
 */
export class NotFoundError extends FanartApiError {
  constructor(message: string = "Requested resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends FanartApiError {
  constructor(message: string = "Request timed out") {
    super(message, 408);
    this.name = "TimeoutError";
  }
}

/**
 * Error thrown for network-related issues
 */
export class NetworkError extends FanartApiError {
  constructor(message: string = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
  }
}
