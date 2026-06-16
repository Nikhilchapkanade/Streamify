import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.documentDirectory}track_cache/`;

// Ensure caching directory exists
export async function ensureCacheDirExists(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    console.log('Creating cache directory...');
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

// Get local URI for a track ID
export function getLocalUri(trackId: string): string {
  // Normalize trackId to prevent file system issues
  const safeId = trackId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `${CACHE_DIR}${safeId}.mp3`;
}

// Check if a track is cached locally
export async function isTrackCached(trackId: string): Promise<boolean> {
  await ensureCacheDirExists();
  const fileUri = getLocalUri(trackId);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  return fileInfo.exists;
}

// Cache a track by downloading it
export async function cacheTrack(
  trackId: string,
  remoteUrl: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  try {
    await ensureCacheDirExists();
    const fileUri = getLocalUri(trackId);
    
    // Check if already cached
    const check = await FileSystem.getInfoAsync(fileUri);
    if (check.exists) {
      return fileUri;
    }

    console.log(`Downloading track ${trackId} to ${fileUri}...`);
    
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      fileUri,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        if (onProgress) {
          onProgress(progress);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (result && result.uri) {
      console.log(`Successfully cached track ${trackId}`);
      return result.uri;
    }
    return null;
  } catch (error) {
    console.error(`Error caching track ${trackId}:`, error);
    return null;
  }
}

// Clear all cached tracks
export async function clearCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
    await ensureCacheDirExists();
    console.log('Cache cleared successfully.');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
