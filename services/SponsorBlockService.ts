export interface SponsorBlockSegment {
  category: string;
  segment: [number, number]; // [startTimeSeconds, endTimeSeconds]
  UUID: string;
}

const SPONSORBLOCK_API = 'https://sponsor.ajay.app';

// Categories relevant to music streaming
// music_offtopic: non-music segments in music videos (e.g. speaking parts, skits)
// intro: video intro
// outro: video outro / end screen cards
// sponsor: sponsored messages
const CATEGORIES = ['music_offtopic', 'intro', 'outro', 'sponsor'];

/**
 * Fetch skip segments for a specific YouTube video ID from SponsorBlock API
 * @param videoId YouTube Video ID
 * @returns List of segments to skip, or empty array if none found
 */
export async function fetchSkipSegments(videoId: string): Promise<SponsorBlockSegment[]> {
  if (!videoId) return [];
  
  try {
    const url = `${SPONSORBLOCK_API}/api/skipSegments?videoID=${videoId}&categories=${JSON.stringify(CATEGORIES)}`;
    console.log(`[SponsorBlock] Fetching segments for video: ${videoId}`);
    const response = await fetch(url);
    
    if (response.status === 404) {
      console.log(`[SponsorBlock] No skip segments found for video: ${videoId}`);
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      category: item.category,
      segment: item.segment,
      UUID: item.UUID
    }));
  } catch (error) {
    console.warn(`[SponsorBlock] Error fetching segments for ${videoId}:`, error);
    return [];
  }
}

/**
 * Check if the current playback time falls inside any skip segments.
 * If yes, returns the timestamp (seconds) to skip to. Otherwise, returns -1.
 * @param currentTime Current playback time in seconds
 * @param segments List of skip segments
 * @returns Timestamp to seek to, or -1
 */
export function getSkipTimestamp(currentTime: number, segments: SponsorBlockSegment[]): number {
  if (!segments || segments.length === 0) return -1;
  
  for (const item of segments) {
    const [start, end] = item.segment;
    // If current playback head is within the start and end boundary (with 0.5s buffer)
    if (currentTime >= start && currentTime < end - 0.2) {
      console.log(`[SponsorBlock] Skipping segment (${item.category}): ${start}s - ${end}s`);
      return end;
    }
  }
  
  return -1;
}
