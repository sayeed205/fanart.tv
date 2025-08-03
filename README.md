# @hitarashi/fanart

A comprehensive, type-safe Fanart.tv API client for Deno that provides access to movie, music, and TV show artwork with full TypeScript support.

## Features

- 🎯 **Fully Typed** - Complete TypeScript definitions for all API responses
- 🎬 **Complete Coverage** - Support for all Fanart.tv endpoints (movies, music, TV shows)
- 🖼️ **Preview Support** - Optional preview-sized images for faster loading
- 🛡️ **Error Handling** - Comprehensive error types with meaningful messages
- 📦 **Modular Design** - Import only what you need
- 🚀 **Deno Native** - Built specifically for Deno with modern standards
- 📚 **Well Documented** - Extensive JSDoc documentation

## Installation

For installation check out jsr.io [@hitarashi/farnart](https://jsr.io/@hitarashi/fanart)

## Quick Start

```typescript
import { Fanart } from '@hitarashi/fanart';
import type { MovieImages, ArtistImages } from '@hitarashi/fanart/types';

// Initialize with your API key
const fanart = new Fanart('your-api-key-here');

// Get movie artwork
const movieArt = await fanart.movie.get(550); // Fight Club
console.log(movieArt.movieposter?.[0]?.url);

// Get artist artwork
const artistArt = await fanart.music.artists.get('artist-mbid');
console.log(artistArt.artistbackground?.[0]?.url);

// Get TV show artwork
const showArt = await fanart.tv.get(12345);
console.log(showArt.clearlogo?.[0]?.url);
```

## API Reference

### Movies

```typescript
// Get movie artwork by TMDb ID
const movieArt = await fanart.movie.get(550);

// Get latest movie artwork
const latest = await fanart.movie.latest('2024-01-01');

// Use preview images for faster loading
const previewArt = await fanart.movie.get(550, { usePreview: true });
```

### Music

```typescript
// Artist artwork
const artistArt = await fanart.music.artists.get('mbid');
const latestArtists = await fanart.music.artists.latest();

// Album artwork
const albumArt = await fanart.music.album('album-mbid');

// Label artwork
const labelArt = await fanart.music.label('label-mbid');
```

### TV Shows

```typescript
// Get TV show artwork by TVDB ID
const showArt = await fanart.tv.get(12345);

// Get latest TV show artwork
const latestShows = await fanart.tv.latest('2024-01-01');
```

## Preview Images

All methods support an optional `usePreview` parameter to get smaller, faster-loading images:

```typescript
const options = { usePreview: true };

const movieArt = await fanart.movie.get(550, options);
const artistArt = await fanart.music.artists.get('mbid', options);
const showArt = await fanart.tv.get(12345, options);
```

## Error Handling

The client provides specific error types for different scenarios:

```typescript
import { 
  FanartApiError, 
  AuthenticationError, 
  RateLimitError, 
  NotFoundError 
} from '@hitarashi/fanart';

try {
  const artwork = await fanart.movie.get(550);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof NotFoundError) {
    console.error('Movie not found');
  } else if (error instanceof FanartApiError) {
    console.error('API error:', error.message);
  }
}
```

## Types

Import types for better TypeScript support:

```typescript
import type {
  // Movie types
  MovieImages,
  MoviePoster,
  MovieBackground,
  
  // Music types
  ArtistImages,
  AlbumImages,
  LabelImages,
  
  // TV types
  ShowImages,
  
  // Common types
  RequestOptions,
  ImageBase
} from '@hitarashi/fanart/types';
```

## API Key

You need a Fanart.tv API key to use this client. Get one from:
- [Fanart.tv](https://fanart.tv/get-an-api-key)

The client accepts either a personal API key or a project API key.

## Rate Limiting

Fanart.tv has rate limits on their API. The client will throw a `RateLimitError` when limits are exceeded. Consider implementing retry logic with exponential backoff for production applications.

## Examples

Check out the [examples](./examples/) directory for more detailed usage examples:

- [Basic Usage](./examples/basic-usage.ts) - Simple API calls
- [Complete Workflow](./examples/complete-workflow.ts) - Advanced usage with error handling

## Development

```bash
# Run tests
deno test --allow-env --env-file --allow-net --env-file=.env

# Run with watch mode
deno task dev

# Format code
deno fmt

# Lint code
deno lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Changelog

### 0.0.0
- Initial release
- Support for all Fanart.tv API endpoints
- Full TypeScript support
- Preview image functionality
- Comprehensive error handling