/**
 * Custom error classes for Fanart.tv API client
 */

/**
 * Base error class for all Fanart.tv API related errors
 */
export class FanartApiError extends Error {
  public readonly name = 'FanartApiError';
  
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: any
  ) {
    super(message);
    
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
  public readonly name = 'AuthenticationError';
  
  constructor(message: string = 'Invalid or missing API key') {
    super(message, 401);
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends FanartApiError {
  public readonly name = 'RateLimitError';
  
  constructor(message: string = 'Rate limit exceeded. Please try again later.') {
    super(message, 429);
  }
}

/**
 * Error thrown when requested resource is not found
 */
export class NotFoundError extends FanartApiError {
  public readonly name = 'NotFoundError';
  
  constructor(message: string = 'Requested resource not found') {
    super(message, 404);
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends FanartApiError {
  public readonly name = 'TimeoutError';
  
  constructor(message: string = 'Request timed out') {
    super(message, 408);
  }
}

/**
 * Error thrown for network-related issues
 */
export class NetworkError extends FanartApiError {
  public readonly name = 'NetworkError';
  
  constructor(message: string = 'Network error occurred') {
    super(message);
  }
}