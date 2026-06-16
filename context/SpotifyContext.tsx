import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// Spotify configuration
const CLIENT_ID = 'da46927cbba1476db783b9c60e0a5ea7'; // Spotify Developer Client ID (placeholder/default)
const REDIRECT_SCHEME = 'frontend'; // Custom scheme defined in app.json

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration_ms: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  imageUrl?: string;
  tracksCount: number;
}

interface SpotifyContextType {
  token: string | null;
  isAuthenticated: boolean;
  userProfile: any | null;
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  fetchPlaylistTracks: (playlistId: string) => Promise<SpotifyTrack[]>;
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Setup Auth Session
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-library-read',
      ],
      redirectUri: makeRedirectUri({
        scheme: REDIRECT_SCHEME,
        path: 'spotify-auth',
      }),
    },
    discovery
  );

  // Load saved token on startup
  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem('@spotify_token');
      if (savedToken) {
        setToken(savedToken);
      }
    };
    loadToken();
  }, []);

  // Handle Auth Response
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      const accessToken = response.authentication.accessToken;
      setToken(accessToken);
      AsyncStorage.setItem('@spotify_token', accessToken);
    }
  }, [response]);

  // Fetch Spotify user profile & playlists when token updates
  useEffect(() => {
    if (!token) {
      setUserProfile(null);
      setPlaylists([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Profile
        const profileRes = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserProfile(profile);
        } else if (profileRes.status === 401) {
          // Token expired or invalid
          logout();
          return;
        }

        // Fetch Playlists
        const playlistsRes = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (playlistsRes.ok) {
          const playlistsData = await playlistsRes.json();
          const mapped: SpotifyPlaylist[] = (playlistsData.items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            imageUrl: item.images && item.images.length > 0 ? item.images[0].url : undefined,
            tracksCount: item.tracks ? item.tracks.total : 0,
          }));
          setPlaylists(mapped);
        }
      } catch (err) {
        console.error('Error fetching Spotify data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const login = () => {
    promptAsync();
  };

  const logout = async () => {
    setToken(null);
    setUserProfile(null);
    setPlaylists([]);
    await AsyncStorage.removeItem('@spotify_token');
  };

  const fetchPlaylistTracks = async (playlistId: string): Promise<SpotifyTrack[]> => {
    if (!token) return [];
    try {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.items
          .map((item: any) => {
            const t = item.track;
            if (!t) return null;
            return {
              id: t.id,
              title: t.name,
              artist: t.artists.map((a: any) => a.name).join(', '),
              thumbnail: t.album.images && t.album.images.length > 0 ? t.album.images[0].url : '',
              duration_ms: t.duration_ms,
            };
          })
          .filter(Boolean) as SpotifyTrack[];
      }
      return [];
    } catch (err) {
      console.error(`Error fetching tracks for playlist ${playlistId}:`, err);
      return [];
    }
  };

  return (
    <SpotifyContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        userProfile,
        playlists,
        isLoading,
        login,
        logout,
        fetchPlaylistTracks,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
