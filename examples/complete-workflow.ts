/**
 * Complete workflow example demonstrating the full Fanart.tv API client capabilities
 * 
 * This example shows a realistic use case where you might build a media library
 * application that fetches artwork for movies, music, and TV shows.
 * 
 * Run with: deno run --allow-env --allow-net examples/complete-workflow.ts
 */

import { Fanart } from '../src/main.ts';
import {
    AuthenticationError,
    FanartApiError,
    NotFoundError,
    RateLimitError
} from '../src/utils/errors.ts';

// Media library data structure
interface MediaItem {
  id: string;
  name: string;
  type: 'movie' | 'artist' | 'album' | 'tvshow';
  artwork?: {
    posters?: string[];
    backgrounds?: string[];
    logos?: string[];
    thumbnails?: string[];
  };
  error?: string;
}

// Sample media library
const mediaLibrary: MediaItem[] = [
  // Movies (using TMDb IDs)
  { id: '550', name: 'Fight Club', type: 'movie' },
  { id: '13', name: 'Forrest Gump', type: 'movie' },
  { id: '155', name: 'The Dark Knight', type: 'movie' },
  
  // Artists (using MusicBrainz IDs)
  { id: '5b11f4ce-a62d-471e-81fc-a69a8278c7da', name: 'Nirvana', type: 'artist' },
  { id: 'cc197bad-dc9c-440d-a5b5-d52ba2e14234', name: 'Coldplay', type: 'artist' },
  
  // Albums (using MusicBrainz IDs)
  { id: 'f5093c06-23e3-404f-afe0-f259bbc4b5b6', name: 'Nevermind', type: 'album' },
  { id: '9ba659bd-5ec7-4e3e-8edc-72d08e5e9e7e', name: 'Parachutes', type: 'album' },
  
  // TV Shows (using TVDB IDs)
  { id: '81189', name: 'Breaking Bad', type: 'tvshow' },
  { id: '73739', name: 'Lost', type: 'tvshow' },
];

class MediaLibraryManager {
  private fanart: Fanart;
  private stats = {
    processed: 0,
    successful: 0,
    errors: 0,
    rateLimited: 0
  };

  constructor(apiKey: string) {
    this.fanart = new Fanart(apiKey);
  }

  /**
   * Process a single media item and fetch its artwork
   */
  private async processMediaItem(item: MediaItem): Promise<MediaItem> {
    console.log(`📥 Processing ${item.type}: ${item.name}`);
    
    try {
      switch (item.type) {
        case 'movie':
          return await this.processMovie(item);
        case 'artist':
          return await this.processArtist(item);
        case 'album':
          return await this.processAlbum(item);
        case 'tvshow':
          return await this.processTvShow(item);
        default:
          throw new Error(`Unknown media type: ${item.type}`);
      }
    } catch (error) {
      this.stats.errors++;
      
      if (error instanceof RateLimitError) {
        this.stats.rateLimited++;
        console.log(`⏳ Rate limited for ${item.name}, will retry later`);
        return { ...item, error: 'Rate limited' };
      } else if (error instanceof NotFoundError) {
        console.log(`❌ Not found: ${item.name}`);
        return { ...item, error: 'Not found' };
      } else if (error instanceof AuthenticationError) {
        console.log(`🔐 Authentication error for ${item.name}`);
        return { ...item, error: 'Authentication failed' };
      } else {
        console.log(`💥 Error processing ${item.name}: ${error.message}`);
        return { ...item, error: error.message };
      }
    }
  }

  /**
   * Process movie artwork
   */
  private async processMovie(item: MediaItem): Promise<MediaItem> {
    const movieId = parseInt(item.id);
    
    // Get both full-size and preview artwork
    const [fullSize, preview] = await Promise.all([
      this.fanart.movie.get(movieId, { usePreview: false }),
      this.fanart.movie.get(movieId, { usePreview: true })
    ]);

    const artwork = {
      posters: fullSize.movieposter?.map(p => p.url) || [],
      backgrounds: fullSize.moviebackground?.map(b => b.url) || [],
      logos: fullSize.movielogo?.map(l => l.url) || [],
      thumbnails: preview.moviethumb?.map(t => t.url) || []
    };

    this.stats.successful++;
    console.log(`✅ ${item.name}: ${artwork.posters.length} posters, ${artwork.backgrounds.length} backgrounds`);
    
    return { ...item, artwork };
  }

  /**
   * Process artist artwork
   */
  private async processArtist(item: MediaItem): Promise<MediaItem> {
    const artistArt = await this.fanart.music.artists.get(item.id);

    const artwork = {
      backgrounds: artistArt.artistbackground?.map(b => b.url) || [],
      logos: [
        ...(artistArt.musiclogo?.map(l => l.url) || []),
        ...(artistArt.hdmusiclogo?.map(l => l.url) || [])
      ],
      thumbnails: artistArt.artistthumb?.map(t => t.url) || [],
      posters: artistArt.musicbanner?.map(b => b.url) || []
    };

    this.stats.successful++;
    console.log(`✅ ${item.name}: ${artwork.backgrounds.length} backgrounds, ${artwork.logos.length} logos`);
    
    return { ...item, artwork };
  }

  /**
   * Process album artwork
   */
  private async processAlbum(item: MediaItem): Promise<MediaItem> {
    const albumArt = await this.fanart.music.album(item.id);

    const artwork = {
      posters: albumArt.albumcover?.map(c => c.url) || [],
      backgrounds: albumArt.cdart?.map(c => c.url) || [],
      logos: [],
      thumbnails: []
    };

    this.stats.successful++;
    console.log(`✅ ${item.name}: ${artwork.posters.length} covers, ${artwork.backgrounds.length} CD art`);
    
    return { ...item, artwork };
  }

  /**
   * Process TV show artwork
   */
  private async processTvShow(item: MediaItem): Promise<MediaItem> {
    const showId = parseInt(item.id);
    const showArt = await this.fanart.tv.get(showId);

    const artwork = {
      posters: [
        ...(showArt.tvposter?.map(p => p.url) || []),
        ...(showArt.seasonposter?.map(p => p.url) || [])
      ],
      backgrounds: showArt.showbackground?.map(b => b.url) || [],
      logos: [
        ...(showArt.clearlogo?.map(l => l.url) || []),
        ...(showArt.hdtvlogo?.map(l => l.url) || [])
      ],
      thumbnails: [
        ...(showArt.tvthumb?.map(t => t.url) || []),
        ...(showArt.seasonthumb?.map(t => t.url) || [])
      ]
    };

    this.stats.successful++;
    console.log(`✅ ${item.name}: ${artwork.posters.length} posters, ${artwork.logos.length} logos`);
    
    return { ...item, artwork };
  }

  /**
   * Process the entire media library with rate limiting and error handling
   */
  async processLibrary(items: MediaItem[]): Promise<MediaItem[]> {
    console.log(`🚀 Starting to process ${items.length} media items...\n`);
    
    const results: MediaItem[] = [];
    
    for (const item of items) {
      this.stats.processed++;
      
      const result = await this.processMediaItem(item);
      results.push(result);
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Demonstrate latest artwork functionality
   */
  async demonstrateLatestArtwork() {
    console.log('\n🆕 Checking for latest artwork updates...');
    
    try {
      const [latestMovies, latestArtists, latestShows] = await Promise.all([
        this.fanart.movie.latest(),
        this.fanart.music.artists.latest(),
        this.fanart.tv.latest()
      ]);
      
      console.log(`📽️  Latest movies: ${Object.keys(latestMovies).length} updates`);
      console.log(`🎵 Latest artists: ${Object.keys(latestArtists).length} updates`);
      console.log(`📺 Latest TV shows: ${Object.keys(latestShows).length} updates`);
      
      // Show some examples if available
      const movieIds = Object.keys(latestMovies).slice(0, 3);
      if (movieIds.length > 0) {
        console.log('\nRecent movie updates:');
        for (const movieId of movieIds) {
          const movieData = latestMovies[movieId];
          // Handle different possible structures for latest data
          if (typeof movieData === 'object' && movieData !== null) {
            console.log(`  - Movie ID ${movieId}: Recent artwork added`);
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Error checking latest artwork: ${error.message}`);
    }
  }

  /**
   * Demonstrate advanced filtering and processing
   */
  async demonstrateAdvancedFeatures(results: MediaItem[]) {
    console.log('\n🔍 Advanced Analysis:');
    
    // Group by type
    const byType = results.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, MediaItem[]>);
    
    for (const [type, items] of Object.entries(byType)) {
      const successful = items.filter(item => item.artwork && !item.error);
      const totalArtwork = successful.reduce((sum, item) => {
        if (!item.artwork) return sum;
        return sum + 
          (item.artwork.posters?.length || 0) +
          (item.artwork.backgrounds?.length || 0) +
          (item.artwork.logos?.length || 0) +
          (item.artwork.thumbnails?.length || 0);
      }, 0);
      
      console.log(`${type}: ${successful.length}/${items.length} successful, ${totalArtwork} total images`);
    }
    
    // Find items with most artwork
    const richestItem = results
      .filter(item => item.artwork && !item.error)
      .sort((a, b) => {
        const aCount = a.artwork ? 
          (a.artwork.posters?.length || 0) + 
          (a.artwork.backgrounds?.length || 0) + 
          (a.artwork.logos?.length || 0) + 
          (a.artwork.thumbnails?.length || 0) : 0;
        const bCount = b.artwork ? 
          (b.artwork.posters?.length || 0) + 
          (b.artwork.backgrounds?.length || 0) + 
          (b.artwork.logos?.length || 0) + 
          (b.artwork.thumbnails?.length || 0) : 0;
        return bCount - aCount;
      })[0];
    
    if (richestItem?.artwork) {
      const totalImages = 
        (richestItem.artwork.posters?.length || 0) +
        (richestItem.artwork.backgrounds?.length || 0) +
        (richestItem.artwork.logos?.length || 0) +
        (richestItem.artwork.thumbnails?.length || 0);
      console.log(`🏆 Most artwork: ${richestItem.name} (${totalImages} images)`);
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const apiKey = Deno.env.get('FANART_API_KEY');
  if (!apiKey) {
    console.error('❌ FANART_API_KEY environment variable is required');
    console.error('Get your API key from: https://fanart.tv/get-an-api-key/');
    Deno.exit(1);
  }

  console.log('🎬🎵📺 Fanart.tv Complete Workflow Example');
  console.log('==========================================\n');

  const manager = new MediaLibraryManager(apiKey);
  
  try {
    // Process the entire media library
    const results = await manager.processLibrary(mediaLibrary);
    
    // Show statistics
    const stats = manager.getStats();
    console.log('\n📊 Processing Statistics:');
    console.log(`Total processed: ${stats.processed}`);
    console.log(`Successful: ${stats.successful}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Rate limited: ${stats.rateLimited}`);
    console.log(`Success rate: ${((stats.successful / stats.processed) * 100).toFixed(1)}%`);
    
    // Demonstrate latest artwork functionality
    await manager.demonstrateLatestArtwork();
    
    // Advanced analysis
    await manager.demonstrateAdvancedFeatures(results);
    
    // Show sample results
    console.log('\n🖼️  Sample Results:');
    const successfulResults = results.filter(item => item.artwork && !item.error);
    for (const item of successfulResults.slice(0, 3)) {
      if (item.artwork) {
        console.log(`\n${item.name} (${item.type}):`);
        if (item.artwork.posters?.length) {
          console.log(`  📄 First poster: ${item.artwork.posters[0]}`);
        }
        if (item.artwork.backgrounds?.length) {
          console.log(`  🖼️  First background: ${item.artwork.backgrounds[0]}`);
        }
        if (item.artwork.logos?.length) {
          console.log(`  🏷️  First logo: ${item.artwork.logos[0]}`);
        }
      }
    }
    
    console.log('\n✅ Complete workflow demonstration finished!');
    console.log('\nThis example showed:');
    console.log('• Batch processing of mixed media types');
    console.log('• Comprehensive error handling');
    console.log('• Rate limiting considerations');
    console.log('• Preview vs full-size image handling');
    console.log('• Latest artwork checking');
    console.log('• Advanced data analysis');
    console.log('• Real-world usage patterns');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (error instanceof FanartApiError) {
      console.error('Status code:', error.statusCode);
    }
    Deno.exit(1);
  }
}

// Run the complete workflow if this file is executed directly
if (import.meta.main) {
  await main();
}