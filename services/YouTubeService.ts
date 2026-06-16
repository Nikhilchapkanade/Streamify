const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.yt',
  'https://pipedapi.col1a.me',
  'https://pipedapi.synapse.moe',
];

export interface YouTubeSearchResult {
  title: string;
  artist: string;
  videoId: string;
  thumbnail: string;
  duration: number; // seconds
}

// Helper to make a request trying multiple Piped instances
async function fetchFromPiped(path: string): Promise<any> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const url = `${instance}${path}`;
      console.log(`[YouTube] Fetching from Piped: ${url}`);
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn(`[YouTube] Instance failed: ${instance}`, err);
    }
  }
  throw new Error('All Piped instances failed');
}

/**
 * Search YouTube Music for a song
 * @param query Search string (e.g. "Song Name Artist Name")
 */
export async function searchYouTubeMusic(query: string): Promise<YouTubeSearchResult | null> {
  try {
    const data = await fetchFromPiped(`/search?q=${encodeURIComponent(query)}&filter=music_songs`);
    if (data && data.items && data.items.length > 0) {
      // Find the first item that is a stream type
      const streamItem = data.items.find((item: any) => item.type === 'stream');
      if (streamItem) {
        // Extract video ID from "/watch?v=videoId"
        const videoId = streamItem.url.split('v=')[1]?.split('&')[0] || '';
        return {
          title: streamItem.title,
          artist: streamItem.uploaderName,
          videoId,
          thumbnail: streamItem.thumbnail || '',
          duration: streamItem.duration || 0,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[YouTube] Search error:', error);
    return null;
  }
}

/**
 * Resolve direct audio streaming URL from YouTube video ID
 * @param videoId YouTube Video ID
 */
export async function resolveAudioStream(videoId: string): Promise<string | null> {
  try {
    const data = await fetchFromPiped(`/streams/${videoId}`);
    if (data && data.audioStreams && data.audioStreams.length > 0) {
      // Find the highest bitrate audio stream, preferring format M4A/AAC for wider support in expo-av
      const m4aStreams = data.audioStreams.filter((stream: any) =>
        stream.mimeType?.includes('audio/mp4') || stream.format === 'M4A'
      );
      
      const targetStreams = m4aStreams.length > 0 ? m4aStreams : data.audioStreams;
      
      // Sort descending by bitrate to get best quality
      const sorted = targetStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
      const streamUrl = sorted[0]?.url;
      
      if (streamUrl) {
        console.log(`[YouTube] Resolved audio stream: ${streamUrl}`);
        return streamUrl;
      }
    }
    return null;
  } catch (error) {
    console.error(`[YouTube] Error resolving stream for ${videoId}:`, error);
    return null;
  }
}
