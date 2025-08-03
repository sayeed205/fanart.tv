/**
 * Basic usage examples for the Fanart.tv API client
 * 
 * This file demonstrates how to use all major functionality of the Fanart.tv API client
 * with real API calls. Make sure to set your FANART_API_KEY environment variable.
 * 
 * Run with: deno run --allow-env --allow-net examples/basic-usage.ts
 */

import { Fanart } from '../src/main.ts';
import type { AlbumImages, ArtistImages, MovieImages, ShowImages } from '../src/types/index.ts';
import { AuthenticationError, NotFoundError } from '../src/utils/errors.ts';

// Get API key from environment
const apiKey = Deno.env.get('FANART_API_KEY');
if (!apiKey) {
  console.error('❌ FANART_API_KEY environment variable is required');
  console.error('Get your API key from: https://fanart.tv/get-an-api-key/');
  Deno.exit(1);
}

// Initialize the Fanart client
const fanart = new Fanart(apiKey);

console.log('🎬 Fanart.tv API Client Examples\n');

/**
 * Example 1: Movie Artwork
 */
async function movieExample() {
  console.log('📽️  Movie Artwork Example');
  console.log('========================');
  
  try {
    // Get artwork for Fight Club (TMDb ID: 550)
    const movieArt: MovieImages = await fanart.movie.get(550);
    
    console.log(`Movie: ${movieArt.name}`);
    console.log(`TMDb ID: ${movieArt.tmdb_id}`);
    console.log(`IMDb ID: ${movieArt.imdb_id || 'N/A'}`);
    
    // Display available artwork types
    const artworkTypes = [
      { key: 'movieposter', name: 'Posters' },
      { key: 'moviebackground', name: 'Backgrounds' },
      { key: 'movielogo', name: 'Logos' },
      { key: 'moviedisc', name: 'Disc Art' },
      { key: 'moviebanner', name: 'Banners' },
      { key: 'moviethumb', name: 'Thumbnails' }
    ];
    
    for (const { key, name } of artworkTypes) {
      const artwork = movieArt[key as keyof MovieImages] as Array<{ url: string; likes: string }> | undefined;
      if (artwork?.length) {
        console.log(`${name}: ${artwork.length} images`);
        console.log(`  First image: ${artwork[0].url}`);
        console.log(`  Likes: ${artwork[0].likes}`);
      }
    }
    
    // Example with preview images
    console.log('\n🖼️  Preview Images:');
    const previewArt = await fanart.movie.get(550, { usePreview: true });
    if (previewArt.movieposter?.length) {
      console.log(`Preview poster: ${previewArt.movieposter[0].url}`);
    }
    
    // Get latest movie artwork
    console.log('\n🆕 Latest Movie Artwork:');
    const latestMovies = await fanart.movie.latest();
    const movieIds = Object.keys(latestMovies);
    console.log(`Found ${movieIds.length} movies with recent artwork updates`);
    
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error('❌ Movie not found');
    } else if (error instanceof AuthenticationError) {
      console.error('❌ Invalid API key');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
  
  console.log('\n');
}

/**
 * Example 2: Music Artwork (Artists)
 */
async function musicArtistExample() {
  console.log('🎵 Music Artist Artwork Example');
  console.log('===============================');
  
  try {
    // Get artwork for Nirvana (MusicBrainz ID)
    const artistId = '5b11f4ce-a62d-471e-81fc-a69a8278c7da';
    const artistArt: ArtistImages = await fanart.music.artists.get(artistId);
    
    console.log(`Artist: ${artistArt.name}`);
    console.log(`MusicBrainz ID: ${artistArt.mbid_id}`);
    
    // Display available artwork types
    const artworkTypes = [
      { key: 'artistbackground', name: 'Backgrounds' },
      { key: 'artistthumb', name: 'Thumbnails' },
      { key: 'musiclogo', name: 'Music Logos' },
      { key: 'hdmusiclogo', name: 'HD Music Logos' },
      { key: 'musicbanner', name: 'Music Banners' }
    ];
    
    for (const { key, name } of artworkTypes) {
      const artwork = artistArt[key as keyof ArtistImages] as Array<{ url: string; likes: string }> | undefined;
      if (artwork?.length) {
        console.log(`${name}: ${artwork.length} images`);
        console.log(`  First image: ${artwork[0].url}`);
        console.log(`  Likes: ${artwork[0].likes}`);
      }
    }
    
    // Get latest artist artwork
    console.log('\n🆕 Latest Artist Artwork:');
    const latestArtists = await fanart.music.artists.latest();
    const artistIds = Object.keys(latestArtists);
    console.log(`Found ${artistIds.length} artists with recent artwork updates`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
}

/**
 * Example 3: Music Artwork (Albums)
 */
async function musicAlbumExample() {
  console.log('💿 Music Album Artwork Example');
  console.log('==============================');
  
  try {
    // Get artwork for Nirvana's "Nevermind" album
    const albumId = 'f5093c06-23e3-404f-afe0-f259bbc4b5b6';
    const albumArt: AlbumImages = await fanart.music.album(albumId);
    
    console.log(`Album: ${albumArt.name}`);
    console.log(`MusicBrainz ID: ${albumArt.mbid_id}`);
    
    // Display available artwork types
    if (albumArt.albumcover?.length) {
      console.log(`Album Covers: ${albumArt.albumcover.length} images`);
      console.log(`  First cover: ${albumArt.albumcover[0].url}`);
      console.log(`  Likes: ${albumArt.albumcover[0].likes}`);
    }
    
    if (albumArt.cdart?.length) {
      console.log(`CD Art: ${albumArt.cdart.length} images`);
      console.log(`  First CD art: ${albumArt.cdart[0].url}`);
      console.log(`  Likes: ${albumArt.cdart[0].likes}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
}

/**
 * Example 4: Music Artwork (Labels)
 */
async function musicLabelExample() {
  console.log('🏷️  Music Label Artwork Example');
  console.log('===============================');
  
  try {
    // Get artwork for Sub Pop Records
    const labelId = '50c384a2-0b44-401b-b893-8181173339c7';
    const labelArt = await fanart.music.label(labelId);
    
    console.log(`Label: ${labelArt.name}`);
    console.log(`MusicBrainz ID: ${labelArt.mbid_id}`);
    
    if (labelArt.musiclabel?.length) {
      console.log(`Label Images: ${labelArt.musiclabel.length} images`);
      console.log(`  First image: ${labelArt.musiclabel[0].url}`);
      console.log(`  Likes: ${labelArt.musiclabel[0].likes}`);
    } else {
      console.log('No label artwork available');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
}

/**
 * Example 5: TV Show Artwork
 */
async function tvShowExample() {
  console.log('📺 TV Show Artwork Example');
  console.log('==========================');
  
  try {
    // Get artwork for Breaking Bad (TVDB ID: 81189)
    const showArt: ShowImages = await fanart.tv.get(81189);
    
    console.log(`TV Show: ${showArt.name}`);
    console.log(`TVDB ID: ${showArt.thetvdb_id}`);
    
    // Display available artwork types
    const artworkTypes = [
      { key: 'clearlogo', name: 'Clear Logos' },
      { key: 'hdtvlogo', name: 'HD TV Logos' },
      { key: 'clearart', name: 'Clear Art' },
      { key: 'hdclearart', name: 'HD Clear Art' },
      { key: 'showbackground', name: 'Show Backgrounds' },
      { key: 'tvthumb', name: 'TV Thumbnails' },
      { key: 'seasonposter', name: 'Season Posters' },
      { key: 'seasonthumb', name: 'Season Thumbnails' },
      { key: 'tvbanner', name: 'TV Banners' },
      { key: 'characterart', name: 'Character Art' },
      { key: 'tvposter', name: 'TV Posters' }
    ];
    
    for (const { key, name } of artworkTypes) {
      const artwork = showArt[key as keyof ShowImages] as Array<{ url: string; likes: string }> | undefined;
      if (artwork?.length) {
        console.log(`${name}: ${artwork.length} images`);
        console.log(`  First image: ${artwork[0].url}`);
        console.log(`  Likes: ${artwork[0].likes}`);
      }
    }
    
    // Get latest TV show artwork
    console.log('\n🆕 Latest TV Show Artwork:');
    const latestShows = await fanart.tv.latest();
    const showIds = Object.keys(latestShows);
    console.log(`Found ${showIds.length} TV shows with recent artwork updates`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
}

/**
 * Example 6: Error Handling
 */
async function errorHandlingExample() {
  console.log('⚠️  Error Handling Examples');
  console.log('===========================');
  
  // Example 1: Invalid movie ID
  try {
    await fanart.movie.get(99999999);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log('✅ Caught NotFoundError for invalid movie ID');
    }
  }
  
  // Example 2: Invalid MusicBrainz ID
  try {
    await fanart.music.artists.get('invalid-mbid');
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log('✅ Caught NotFoundError for invalid artist MBID');
    }
  }
  
  // Example 3: Invalid API key
  try {
    const invalidClient = new Fanart('invalid-api-key');
    await invalidClient.movie.get(550);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log('✅ Caught AuthenticationError for invalid API key');
    }
  }
  
  // Example 4: Parameter validation
  try {
    await fanart.movie.get(-1);
  } catch (error) {
    console.log('✅ Caught parameter validation error:', error.message);
  }
  
  console.log('\n');
}

/**
 * Example 7: Advanced Usage Patterns
 */
async function advancedUsageExample() {
  console.log('🚀 Advanced Usage Examples');
  console.log('==========================');
  
  // Example 1: Batch processing with error handling
  console.log('📦 Batch Processing:');
  const movieIds = [550, 13, 155]; // Fight Club, Forrest Gump, The Dark Knight
  
  for (const movieId of movieIds) {
    try {
      const movieArt = await fanart.movie.get(movieId);
      console.log(`✅ ${movieArt.name}: ${movieArt.movieposter?.length || 0} posters`);
    } catch (error) {
      console.log(`❌ Movie ${movieId}: ${error.message}`);
    }
  }
  
  // Example 2: Conditional preview usage
  console.log('\n🖼️  Conditional Preview Usage:');
  const usePreview = true; // Could be based on user preference or bandwidth
  const movieArt = await fanart.movie.get(550, { usePreview });
  console.log(`Using ${usePreview ? 'preview' : 'full-size'} images`);
  
  // Example 3: Date-filtered latest artwork
  console.log('\n📅 Date-filtered Latest Artwork:');
  const since = '2024-01-01';
  try {
    const recentMovies = await fanart.movie.latest(since);
    console.log(`Movies with artwork since ${since}: ${Object.keys(recentMovies).length}`);
  } catch (error) {
    console.log(`Error getting recent movies: ${error.message}`);
  }
  
  console.log('\n');
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('Starting Fanart.tv API client examples...\n');
  
  await movieExample();
  await musicArtistExample();
  await musicAlbumExample();
  await musicLabelExample();
  await tvShowExample();
  await errorHandlingExample();
  await advancedUsageExample();
  
  console.log('✅ All examples completed!');
}

// Run examples if this file is executed directly
if (import.meta.main) {
  try {
    await runAllExamples();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    Deno.exit(1);
  }
}