import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

// --- Types ---
export type Track = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  stream_url: string;
  duration?: number;
};

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
};

type RepeatMode = 'off' | 'all' | 'one';

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;

  // Queue
  queue: Track[];
  currentIndex: number;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  // Controls
  playSong: (item: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;

  // Modes
  shuffleMode: boolean;
  toggleShuffle: () => void;
  repeatMode: RepeatMode;
  toggleRepeat: () => void;

  // Library
  likedSongs: Track[];
  recentlyPlayed: Track[];
  toggleLike: (track: Track) => Promise<void>;
  isLiked: (trackId: string) => boolean;

  // Playlists
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  isInPlaylist: (playlistId: string, trackId: string) => boolean;
};

const PlayerContext = createContext<PlayerContextType | null>(null);
const MAX_RECENT = 30;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const [queue, setQueueState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // --- Load persisted data + restore session ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedLiked, storedRecent, storedPlaylists, storedSession] = await Promise.all([
          AsyncStorage.getItem('@liked_songs'),
          AsyncStorage.getItem('@recently_played'),
          AsyncStorage.getItem('@playlists'),
          AsyncStorage.getItem('@last_session'),
        ]);
        if (storedLiked) setLikedSongs(JSON.parse(storedLiked));
        if (storedRecent) setRecentlyPlayed(JSON.parse(storedRecent));
        if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));

        // Restore last session (track + position + queue)
        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session.track) {
            setCurrentTrack(session.track);
            setPosition(session.position || 0);
            setDuration(session.duration || 0);
          }
          if (session.queue) {
            setQueueState(session.queue);
            setCurrentIndex(session.currentIndex || 0);
          }
        }
      } catch (e) {
        console.error('Failed to load persisted data', e);
      }
    };
    loadData();
  }, []);

  // --- Save session on app background/close ---
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        saveSession();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [currentTrack, position, duration, queue, currentIndex]);

  const saveSession = async () => {
    try {
      const session = {
        track: currentTrack,
        position,
        duration,
        queue,
        currentIndex,
      };
      await AsyncStorage.setItem('@last_session', JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  };

  const persistPlaylists = async (updated: Playlist[]) => {
    setPlaylists(updated);
    await AsyncStorage.setItem('@playlists', JSON.stringify(updated));
  };

  // --- Playback status callback ---
  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish && !status.isLooping) {
        handleTrackFinished();
      }
    }
  }, []);

  const handleTrackFinished = useCallback(async () => {
    if (repeatMode === 'one') {
      if (soundRef.current) await soundRef.current.replayAsync();
      return;
    }
    if (currentIndex < queue.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      await loadAndPlay(queue[next]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      setCurrentIndex(0);
      await loadAndPlay(queue[0]);
    } else {
      setIsPlaying(false);
      saveSession();
    }
  }, [repeatMode, currentIndex, queue]);

  // --- Core audio loader ---
  const loadAndPlay = async (track: Track) => {
    setIsLoading(true);
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (!track.stream_url) throw new Error('No stream URL');

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.stream_url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
      addToRecentlyPlayed(track);
    } catch (error) {
      console.error('Error playing song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecentlyPlayed = async (track: Track) => {
    try {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(t => t.id !== track.id);
        const updated = [track, ...filtered].slice(0, MAX_RECENT);
        AsyncStorage.setItem('@recently_played', JSON.stringify(updated));
        return updated;
      });
    } catch (e) { console.error(e); }
  };

  // --- Queue Management ---
  const setQueue = useCallback((tracks: Track[], startIndex: number = 0) => {
    setQueueState(tracks);
    setCurrentIndex(startIndex);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueueState(prev => [...prev, track]);
  }, []);

  const playNext = useCallback((track: Track) => {
    setQueueState(prev => {
      const newQueue = [...prev];
      newQueue.splice(currentIndex + 1, 0, track);
      return newQueue;
    });
  }, [currentIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueueState(prev => {
      const newQueue = [...prev];
      newQueue.splice(index, 1);
      return newQueue;
    });
    // Adjust currentIndex if needed
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueueState([]);
    setCurrentIndex(-1);
  }, []);

  // --- Playback Controls ---
  const playSong = useCallback(async (item: Track) => {
    const existingIndex = queue.findIndex(t => t.id === item.id);
    if (existingIndex >= 0) {
      setCurrentIndex(existingIndex);
    } else {
      setQueueState(prev => {
        const newQueue = [...prev, item];
        setCurrentIndex(newQueue.length - 1);
        return newQueue;
      });
    }
    await loadAndPlay(item);
  }, [queue, onPlaybackStatusUpdate]);

  const togglePlayback = useCallback(async () => {
    if (!soundRef.current) {
      // If we have a restored track but no sound loaded, load it
      if (currentTrack) {
        await loadAndPlay(currentTrack);
        if (position > 0 && soundRef.current) {
          await (soundRef.current as Audio.Sound).setPositionAsync(position * 1000);
        }
      }
      return;
    }
    if (isPlaying) {
      await soundRef.current.pauseAsync();
      saveSession();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying, currentTrack, position]);

  const seekTo = useCallback(async (seconds: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(seconds * 1000);
  }, []);

  const skipToNext = useCallback(async () => {
    if (queue.length === 0) return;
    let nextIndex: number;
    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (currentIndex < queue.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (repeatMode === 'all') {
      nextIndex = 0;
    } else { return; }
    setCurrentIndex(nextIndex);
    await loadAndPlay(queue[nextIndex]);
  }, [queue, currentIndex, shuffleMode, repeatMode, onPlaybackStatusUpdate]);

  const skipToPrevious = useCallback(async () => {
    if (queue.length === 0) return;
    if (position > 3) { await seekTo(0); return; }
    let prevIndex: number;
    if (currentIndex > 0) { prevIndex = currentIndex - 1; }
    else if (repeatMode === 'all') { prevIndex = queue.length - 1; }
    else { await seekTo(0); return; }
    setCurrentIndex(prevIndex);
    await loadAndPlay(queue[prevIndex]);
  }, [queue, currentIndex, position, repeatMode, onPlaybackStatusUpdate]);

  const toggleShuffle = useCallback(() => setShuffleMode(prev => !prev), []);
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  }, []);

  // --- Library ---
  const toggleLike = useCallback(async (track: Track) => {
    try {
      let updated: Track[];
      if (likedSongs.some(t => t.id === track.id)) {
        updated = likedSongs.filter(t => t.id !== track.id);
      } else {
        updated = [track, ...likedSongs];
      }
      setLikedSongs(updated);
      await AsyncStorage.setItem('@liked_songs', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  }, [likedSongs]);

  const isLiked = useCallback((trackId: string) => likedSongs.some(t => t.id === trackId), [likedSongs]);

  // --- Playlists ---
  const createPlaylist = useCallback(async (name: string): Promise<Playlist> => {
    const p: Playlist = { id: `pl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, tracks: [], createdAt: Date.now() };
    await persistPlaylists([p, ...playlists]);
    return p;
  }, [playlists]);

  const deletePlaylist = useCallback(async (id: string) => {
    await persistPlaylists(playlists.filter(p => p.id !== id));
  }, [playlists]);

  const addToPlaylist = useCallback(async (playlistId: string, track: Track) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId && !p.tracks.some(t => t.id === track.id)) {
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    });
    await persistPlaylists(updated);
  }, [playlists]);

  const removeFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      return p;
    });
    await persistPlaylists(updated);
  }, [playlists]);

  const isInPlaylist = useCallback((playlistId: string, trackId: string) => {
    return playlists.find(p => p.id === playlistId)?.tracks.some(t => t.id === trackId) || false;
  }, [playlists]);

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, isLoading, position, duration,
      queue, currentIndex, setQueue, addToQueue, playNext, removeFromQueue, clearQueue,
      playSong, togglePlayback, seekTo, skipToNext, skipToPrevious,
      shuffleMode, toggleShuffle, repeatMode, toggleRepeat,
      likedSongs, recentlyPlayed, toggleLike, isLiked,
      playlists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, isInPlaylist,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
