import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePlayer, Track } from '@/context/PlayerContext';
import { KineticTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';

const { width } = Dimensions.get('window');
const BACKEND = 'https://jiosaavn-api-privatecvc2.vercel.app';

type SectionData = {
  title: string;
  query: string[];
  color: string;
  tracks: Track[];
  loaded: boolean;
};

const FEED_SECTIONS: SectionData[] = [
  { title: 'Trending Now', query: ['trending hits 2024', 'viral songs'], color: KineticTheme.colors.primary, tracks: [], loaded: false },
  { title: 'Daily Mix', query: ['the weeknd', 'dua lipa'], color: KineticTheme.colors.primary, tracks: [], loaded: false },
  { title: 'Chill Vibes', query: ['lofi chill', 'relaxing music'], color: KineticTheme.colors.secondary, tracks: [], loaded: false },
  { title: 'Bollywood Hits', query: ['arijit singh', 'shreya ghoshal'], color: KineticTheme.colors.primary, tracks: [], loaded: false },
  { title: 'Punjabi Fire', query: ['ap dhillon', 'diljit dosanjh'], color: KineticTheme.colors.secondary, tracks: [], loaded: false },
];

export default function HomeScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<SectionData[]>(FEED_SECTIONS);
  const { playSong, isLoading: playerLoading, setQueue, recentlyPlayed, likedSongs } = usePlayer();

  // Recommendations based on liked songs
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [recsLoaded, setRecsLoaded] = useState(false);

  // Add to Playlist modal
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadSection(0);
  }, []);

  // Load recommendations based on liked songs artists
  useEffect(() => {
    if (likedSongs.length > 0 && !recsLoaded) {
      loadRecommendations();
    }
  }, [likedSongs]);

  const loadSection = async (index: number) => {
    if (index >= FEED_SECTIONS.length) return;

    const section = FEED_SECTIONS[index];
    const tracks: Track[] = [];

    for (const q of section.query) {
      try {
        const res = await fetch(`${BACKEND}/search/songs?query=${encodeURIComponent(q)}&limit=4`);
        const data = await res.json();
        if (data.data?.results) {
          data.data.results.forEach((entry: any) => {
            tracks.push({
              id: entry.id,
              title: entry.name,
              artist: entry.primaryArtists,
              thumbnail: entry.image?.length ? entry.image[entry.image.length - 1].link : '',
              stream_url: entry.downloadUrl?.length ? entry.downloadUrl[entry.downloadUrl.length - 1].link : '',
              duration: entry.duration
            });
          });
        }
      } catch (e) {
        console.error('Fetch error:', e);
      }
    }

    setSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], tracks, loaded: true };
      return updated;
    });

    loadSection(index + 1);
  };

  const loadRecommendations = async () => {
    try {
      // Get unique artists from liked songs and search for similar
      const artists = [...new Set(likedSongs.slice(0, 3).map(s => s.artist.split(',')[0].trim()))];
      const tracks: Track[] = [];
      
      for (const artist of artists.slice(0, 2)) {
        const res = await fetch(`${BACKEND}/search/songs?query=${encodeURIComponent(artist + ' best')}&limit=4`);
        const data = await res.json();
        if (data.data?.results) {
          data.data.results.forEach((entry: any) => {
            // Don't recommend already liked songs
            if (!likedSongs.some(l => l.id === entry.id)) {
              tracks.push({
                id: entry.id,
                title: entry.name,
                artist: entry.primaryArtists,
                thumbnail: entry.image?.length ? entry.image[entry.image.length - 1].link : '',
                stream_url: entry.downloadUrl?.length ? entry.downloadUrl[entry.downloadUrl.length - 1].link : '',
                duration: entry.duration
              });
            }
          });
        }
      }
      setRecommendations(tracks.slice(0, 8));
      setRecsLoaded(true);
    } catch (e) {
      console.error('Recs fetch error:', e);
    }
  };

  const handlePlay = (track: Track, trackList: Track[], index: number) => {
    setQueue(trackList, index);
    playSong(track);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <MaterialIcons name="menu" size={28} color={KineticTheme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.logoText}>STREAMIFY</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <MaterialIcons name="notifications-none" size={24} color={KineticTheme.colors.onSurface} style={{ marginRight: 15 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profilePicContainer} onPress={() => router.push('/profile')}>
              <Image source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Nikhil' }} style={styles.profilePic} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Real Recently Played (from actual listening history) */}
        {recentlyPlayed.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.coloredBar} />
              <Text style={styles.sectionTitle}>Recently Played</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
              {recentlyPlayed.slice(0, 8).map((track, idx) => (
                <TouchableOpacity key={`rp-${track.id}-${idx}`} style={styles.recentItem} onPress={() => handlePlay(track, recentlyPlayed, idx)} disabled={playerLoading}>
                  <View style={styles.recentImageContainer}>
                    <Image source={{ uri: track.thumbnail }} style={styles.recentImage} />
                  </View>
                  <Text style={styles.recentText} numberOfLines={1}>{track.artist?.split(',')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Trending Now / Made for You */}
        <View style={styles.madeForYouHeader}>
          <Text style={styles.madeForYouTitle}>Made for You</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          {/* Trending Card */}
          <TouchableOpacity
            style={styles.largeCard}
            activeOpacity={0.8}
            onPress={() => { if (sections[0]?.tracks[0]) handlePlay(sections[0].tracks[0], sections[0].tracks, 0) }}
          >
            <ImageBackground
              source={{ uri: sections[0]?.tracks[0]?.thumbnail || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800' }}
              style={styles.cardBg}
              imageStyle={{ opacity: 0.8 }}
            >
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', '#000000']} style={styles.cardGradient}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>🔥 TRENDING</Text>
                </View>
                <Text style={styles.cardMainTitle}>Trending Now</Text>
                <Text style={styles.cardSubTitle}>The hottest tracks everyone is listening to right now.</Text>
                <View style={styles.playButtonLarge}>
                  <MaterialIcons name="play-arrow" size={24} color={KineticTheme.colors.surface} />
                  <Text style={styles.playButtonText}>PLAY NOW</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          {/* Daily Mix Card */}
          <TouchableOpacity
            style={styles.largeCard}
            activeOpacity={0.8}
            onPress={() => { if (sections[1]?.tracks[0]) handlePlay(sections[1].tracks[0], sections[1].tracks, 0) }}
          >
            <ImageBackground
              source={{ uri: sections[1]?.tracks[1]?.thumbnail || 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=800' }}
              style={styles.cardBg}
              imageStyle={{ opacity: 0.6 }}
            >
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)', '#000000']} style={styles.cardGradient}>
                <Text style={[styles.cardMainTitle, { color: KineticTheme.colors.secondary }]}>Daily Mix</Text>
                <Text style={styles.cardSubTitle}>Your daily blend of fresh discoveries.</Text>
                <View style={styles.overlapAvatars}>
                  {sections[1]?.tracks.slice(0, 3).map((t, idx) => (
                    <Image key={`av-${t.id}`} source={{ uri: t.thumbnail }} style={[styles.overlapAvatar, { left: idx * 25 }]} />
                  ))}
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* You Might Like (Recommendations) */}
        {recommendations.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 40 }]}>
              <View style={[styles.coloredBar, { backgroundColor: KineticTheme.colors.secondary }]} />
              <Text style={styles.sectionTitle}>You Might Like</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recsScroll}>
              {recommendations.map((track, idx) => (
                <TouchableOpacity key={`rec-${track.id}`} style={styles.recCard} onPress={() => handlePlay(track, recommendations, idx)}>
                  <Image source={{ uri: track.thumbnail }} style={styles.recImage} />
                  <Text style={styles.recTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.recArtist} numberOfLines={1}>{track.artist?.split(',')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Chill Vibes / Jump Back In Grid */}
        <View style={[styles.sectionHeader, { marginTop: 40 }]}>
          <View style={styles.coloredBar} />
          <Text style={styles.sectionTitle}>Chill Vibes</Text>
        </View>
        <View style={styles.jumpGrid}>
          {sections[2]?.tracks.slice(0, 6).map((track, idx) => (
            <TouchableOpacity key={`cv-${track.id}`} style={styles.jumpCard} onPress={() => handlePlay(track, sections[2].tracks, idx)} disabled={playerLoading}>
              <Image source={{ uri: track.thumbnail }} style={styles.jumpImage} />
              <View style={styles.jumpTextContainer}>
                <Text style={styles.jumpTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.jumpArtist} numberOfLines={1}>{track.artist?.split(',')[0]}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {(!sections[2] || !sections[2].loaded) && <ActivityIndicator color={KineticTheme.colors.primary} style={{ margin: 20, alignSelf: 'center', width: '100%' }} />}
        </View>

        {/* Bollywood & Punjabi Sections */}
        {sections.slice(3).map((section, sIdx) => (
          section.loaded && section.tracks.length > 0 ? (
            <View key={`section-${sIdx}`}>
              <View style={[styles.sectionHeader, { marginTop: 40 }]}>
                <View style={[styles.coloredBar, { backgroundColor: section.color }]} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recsScroll}>
                {section.tracks.map((track, idx) => (
                  <TouchableOpacity key={`s${sIdx}-${track.id}`} style={styles.recCard} onPress={() => handlePlay(track, section.tracks, idx)}>
                    <Image source={{ uri: track.thumbnail }} style={styles.recImage} />
                    <Text style={styles.recTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.recArtist} numberOfLines={1}>{track.artist?.split(',')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null
        ))}

      </ScrollView>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        visible={showAddModal}
        track={addToPlaylistTrack}
        onClose={() => { setShowAddModal(false); setAddToPlaylistTrack(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },
  scrollContent: { paddingBottom: 150 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, zIndex: 30 },
  logoText: { fontFamily: KineticTheme.typography.headlineItalic, fontSize: 24, color: KineticTheme.colors.primary, letterSpacing: -1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  profilePicContainer: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: KineticTheme.colors.primary, overflow: 'hidden' },
  profilePic: { width: '100%', height: '100%' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  coloredBar: { width: 6, height: 24, backgroundColor: KineticTheme.colors.primary, borderRadius: 3, marginRight: 10 },
  sectionTitle: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 20, color: KineticTheme.colors.onSurface },

  recentScroll: { paddingHorizontal: 24, paddingBottom: 20, gap: 24 },
  recentItem: { alignItems: 'center', width: 80, marginRight: 24 },
  recentImageContainer: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  recentImage: { width: '100%', height: '100%' },
  recentText: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 12, color: KineticTheme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' },

  madeForYouHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 30, marginBottom: 24 },
  madeForYouTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 28, color: KineticTheme.colors.onSurface },
  viewAllText: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 10, color: KineticTheme.colors.primary, letterSpacing: 1, marginBottom: 6 },

  cardsContainer: { paddingHorizontal: 24, gap: 24 },
  largeCard: { width: '100%', aspectRatio: 0.8, borderRadius: 24, overflow: 'hidden', backgroundColor: KineticTheme.colors.surfaceHighest, marginBottom: 24 },
  cardBg: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  cardGradient: { padding: 24, paddingTop: 60, height: '100%', justifyContent: 'flex-end' },
  badgeContainer: { backgroundColor: KineticTheme.colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  badgeText: { fontFamily: KineticTheme.typography.headline, fontSize: 10, color: KineticTheme.colors.surface, letterSpacing: 1 },
  cardMainTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 36, color: KineticTheme.colors.onSurface, marginBottom: 8 },
  cardSubTitle: { fontFamily: KineticTheme.typography.body, fontSize: 14, color: KineticTheme.colors.onSurfaceVariant, lineHeight: 22, marginBottom: 24 },
  playButtonLarge: { flexDirection: 'row', backgroundColor: KineticTheme.colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, alignItems: 'center', alignSelf: 'flex-start', gap: 10, shadowColor: KineticTheme.colors.primary, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  playButtonText: { fontFamily: KineticTheme.typography.headline, fontSize: 12, color: KineticTheme.colors.surface, letterSpacing: 1 },

  overlapAvatars: { flexDirection: 'row', height: 40, position: 'relative' },
  overlapAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: KineticTheme.colors.surface, position: 'absolute' },

  // Recommendations horizontal scroll
  recsScroll: { paddingHorizontal: 24, gap: 16 },
  recCard: { width: 150, marginRight: 16 },
  recImage: { width: 150, height: 150, borderRadius: 16, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder, marginBottom: 8 },
  recTitle: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 13, color: KineticTheme.colors.onSurface },
  recArtist: { fontFamily: KineticTheme.typography.body, fontSize: 11, color: KineticTheme.colors.onSurfaceVariant, marginTop: 2 },

  jumpGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between' },
  jumpCard: { width: '48%', marginBottom: 20, paddingHorizontal: 4 },
  jumpImage: { width: '100%', aspectRatio: 1, borderRadius: 16, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  jumpTextContainer: { marginTop: 8 },
  jumpTitle: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 14, color: KineticTheme.colors.onSurface },
  jumpArtist: { fontFamily: KineticTheme.typography.body, fontSize: 12, color: KineticTheme.colors.onSurfaceVariant, marginTop: 2 },
});
