# Fanart.tv API Client Examples

This directory contains comprehensive examples demonstrating how to use the
Fanart.tv API client with real API calls.

## Prerequisites

1. **Get an API Key**: Visit
   [https://fanart.tv/get-an-api-key/](https://fanart.tv/get-an-api-key/) to
   obtain your free API key
2. **Set Environment Variable**: Set your API key as an environment variable:
   ```bash
   export FANART_API_KEY="your-api-key-here"
   ```

## Examples

### 1. Basic Usage (`basic-usage.ts`)

Demonstrates all core functionality with individual examples for each API
endpoint:

- **Movie Artwork**: Get posters, backgrounds, logos, disc art, banners, and
  thumbnails
- **Music Artist Artwork**: Get artist backgrounds, thumbnails, logos, and
  banners
- **Music Album Artwork**: Get album covers and CD art
- **Music Label Artwork**: Get record label images
- **TV Show Artwork**: Get logos, backgrounds, season posters, character art,
  and more
- **Error Handling**: Proper handling of authentication, not found, and rate
  limit errors
- **Advanced Patterns**: Batch processing, conditional preview usage, and date
  filtering

**Run with:**

```bash
deno run --allow-env --allow-net examples/basic-usage.ts
```

**Sample Output:**

```
🎬 Fanart.tv API Client Examples

📽️  Movie Artwork Example
========================
Movie: Fight Club
TMDb ID: 550
IMDb ID: tt0137523
Posters: 15 images
  First image: https://assets.fanart.tv/fanart/movies/550/movieposter/fight-club-52d5e2c39af8c.jpg
  Likes: 12
Backgrounds: 8 images
  First image: https://assets.fanart.tv/fanart/movies/550/moviebackground/fight-club-52d5e2c3a1c7e.jpg
  Likes: 5
```

### 2. Complete Workflow (`complete-workflow.ts`)

Shows a realistic use case where you build a media library application that
fetches artwork for multiple items:

- **Batch Processing**: Process multiple movies, artists, albums, and TV shows
- **Error Recovery**: Handle individual failures without stopping the entire
  process
- **Rate Limiting**: Implement delays to respect API limits
- **Statistics Tracking**: Monitor success rates and error types
- **Latest Artwork**: Check for recent artwork additions
- **Advanced Analysis**: Group results by type and find items with most artwork

**Run with:**

```bash
deno run --allow-env --allow-net examples/complete-workflow.ts
```

**Sample Output:**

```
🎬🎵📺 Fanart.tv Complete Workflow Example
==========================================

📥 Processing movie: Fight Club
✅ Fight Club: 15 posters, 8 backgrounds
📥 Processing artist: Nirvana
✅ Nirvana: 12 backgrounds, 6 logos

📊 Processing Statistics:
Total processed: 9
Successful: 8
Errors: 1
Rate limited: 0
Success rate: 88.9%
```

## Key Features Demonstrated

### Type Safety

All examples show how TypeScript types ensure compile-time safety:

```typescript
const movieArt: MovieImages = await fanart.movie.get(550);
const artistArt: ArtistImages = await fanart.music.artists.get(mbid);
```

### Error Handling

Comprehensive error handling for all scenarios:

```typescript
try {
  const artwork = await fanart.movie.get(movieId);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("Movie not found");
  } else if (error instanceof AuthenticationError) {
    console.log("Invalid API key");
  } else if (error instanceof RateLimitError) {
    console.log("Rate limit exceeded");
  }
}
```

### Preview vs Full-Size Images

Toggle between preview and full-size images:

```typescript
const fullSize = await fanart.movie.get(550, { usePreview: false });
const preview = await fanart.movie.get(550, { usePreview: true });
```

### Nested Module Access

Demonstrate the nested structure for music endpoints:

```typescript
// Artist artwork
const artistArt = await fanart.music.artists.get(mbid);
const latestArtists = await fanart.music.artists.latest();

// Album artwork
const albumArt = await fanart.music.album(mbid);

// Label artwork
const labelArt = await fanart.music.label(mbid);
```

### Latest Artwork

Check for recently added artwork:

```typescript
const latestMovies = await fanart.movie.latest("2024-01-01");
const latestArtists = await fanart.music.artists.latest();
const latestShows = await fanart.tv.latest();
```

## Test Data Used

The examples use well-known items with rich artwork:

**Movies (TMDb IDs):**

- Fight Club (550)
- Forrest Gump (13)
- The Dark Knight (155)

**Artists (MusicBrainz IDs):**

- Nirvana (5b11f4ce-a62d-471e-81fc-a69a8278c7da)
- Coldplay (cc197bad-dc9c-440d-a5b5-d52ba2e14234)

**Albums (MusicBrainz IDs):**

- Nevermind (f5093c06-23e3-404f-afe0-f259bbc4b5b6)
- Parachutes (9ba659bd-5ec7-4e3e-8edc-72d08e5e9e7e)

**TV Shows (TVDB IDs):**

- Breaking Bad (81189)
- Lost (73739)

**Labels (MusicBrainz IDs):**

- Sub Pop Records (50c384a2-0b44-401b-b893-8181173339c7)

## Running the Examples

1. **Set your API key:**
   ```bash
   export FANART_API_KEY="your-api-key-here"
   ```

2. **Run basic examples:**
   ```bash
   deno run --allow-env --allow-net examples/basic-usage.ts
   ```

3. **Run complete workflow:**
   ```bash
   deno run --allow-env --allow-net examples/complete-workflow.ts
   ```

## Integration with Tests

These examples complement the integration tests in
`tests/integration/api.test.ts`. While the tests verify functionality
programmatically, these examples show practical usage patterns you can adapt for
your own applications.

## Rate Limiting

The examples include proper rate limiting considerations:

- Delays between requests in batch processing
- Graceful handling of rate limit errors
- Retry logic for rate-limited requests

## Error Scenarios

The examples demonstrate handling of common error scenarios:

- Invalid API keys
- Non-existent movie/artist/show IDs
- Network connectivity issues
- Rate limit exceeded
- Malformed parameters

This makes them excellent references for building robust applications with the
Fanart.tv API client.
