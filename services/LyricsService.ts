export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsData {
  plainLyrics?: string;
  syncedLyrics?: string;
}

const LRCLIB_API = 'https://lrclib.net/api';

/**
 * Fetch lyrics from LRCLIB. Checks both the exact metadata endpoint and falls back to a search query.
 */
export async function fetchLyrics(
  title: string,
  artist: string,
  durationSeconds?: number
): Promise<LyricsData | null> {
  try {
    // Clean track title (remove feat, prod, remastered, etc. to improve match rate)
    const cleanTitle = title.replace(/\(feat\..*?\)/gi, '').replace(/\[.*?\]/g, '').trim();
    const cleanArtist = artist.split(',')[0].trim();

    let url = `${LRCLIB_API}/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
    if (durationSeconds) {
      url += `&duration=${Math.round(durationSeconds)}`;
    }

    console.log(`[Lyrics] Fetching from LRCLIB: ${url}`);
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return {
        plainLyrics: data.plainLyrics || undefined,
        syncedLyrics: data.syncedLyrics || undefined,
      };
    }

    // Fallback: Search API
    const searchQuery = `${cleanArtist} ${cleanTitle}`;
    console.log(`[Lyrics] Exact match failed. Searching: ${searchQuery}`);
    const searchRes = await fetch(`${LRCLIB_API}/search?q=${encodeURIComponent(searchQuery)}`);
    if (searchRes.ok) {
      const results = await searchRes.json();
      if (results && results.length > 0) {
        // Take the first result
        const data = results[0];
        return {
          plainLyrics: data.plainLyrics || undefined,
          syncedLyrics: data.syncedLyrics || undefined,
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('[Lyrics] Error fetching lyrics:', error);
    return null;
  }
}

/**
 * Parse standard LRC format string into a list of timestamped lines.
 */
export function parseSyncedLyrics(lrcString: string): LyricLine[] {
  if (!lrcString) return [];

  const lines = lrcString.split('\n');
  const parsedLines: LyricLine[] = [];
  
  // LRC format regex: [mm:ss.xx] or [mm:ss:xx] or [mm:ss]
  const timeRegex = /\[(\d+):(\d+)(?:\.(\d+))?\]/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      
      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = trimmed.replace(timeRegex, '').trim();
      
      // Filter out metadata tags like [offset:0] or [ar:Artist]
      if (text || line.includes(']')) {
        parsedLines.push({
          time: timeInSeconds,
          text: text
        });
      }
    }
  }

  // Sort by timestamp just in case
  return parsedLines.sort((a, b) => a.time - b.time);
}
