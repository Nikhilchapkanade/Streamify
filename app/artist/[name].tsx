import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KineticTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { TrackOptionsModal } from '@/components/TrackOptionsModal';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';

const BACKEND = 'https://jiosaavn-api-privatecvc2.vercel.app';

export default function ArtistScreen() {
  const { name } = useLocalSearchParams();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong, setQueue, toggleLike, isLiked } = usePlayer();
  const router = useRouter();

  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchArtistSongs = async () => {
      try {
        const response = await fetch(`${BACKEND}/search/songs?query=${encodeURIComponent(name as string)}&limit=15`);
        const data = await response.json();
        
        if (data.data?.results) {
          setSongs(data.data.results.map((entry: any) => ({
            id: entry.id,
            title: entry.name,
            artist: entry.primaryArtists,
            thumbnail: entry.image?.length ? entry.image[entry.image.length - 1].link : '',
            stream_url: entry.downloadUrl?.length ? entry.downloadUrl[entry.downloadUrl.length - 1].link : '',
            duration: entry.duration
          })));
        }
      } catch (error) {
        console.error('Failed to fetch artist songs', error);
      } finally {
        setLoading(false);
      }
    };
    if (name) fetchArtistSongs();
  }, [name]);

  const handlePlay = async (track: any, index: number) => {
    setQueue(songs, index);
    await playSong(track);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={KineticTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={KineticTheme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <MaterialIcons name="verified" size={20} color={KineticTheme.colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.bannerSubtitle}>Verified Artist</Text>
      </View>

      {/* Play All Button */}
      {songs.length > 0 && (
        <View style={styles.playAllRow}>
          <TouchableOpacity
            style={styles.playAllButton}
            onPress={() => handlePlay(songs[0], 0)}
          >
            <MaterialIcons name="play-arrow" size={24} color={KineticTheme.colors.surface} />
            <Text style={styles.playAllText}>PLAY ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shuffleButton} onPress={() => {
            const randomIdx = Math.floor(Math.random() * songs.length);
            handlePlay(songs[randomIdx], randomIdx);
          }}>
            <MaterialIcons name="shuffle" size={24} color={KineticTheme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={styles.coloredBar} />
        <Text style={styles.sectionTitle}>Popular Songs</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={KineticTheme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.trackItem} onPress={() => handlePlay(item, index)}>
              <Text style={styles.trackNumber}>{index + 1}</Text>
              <Image source={{ uri: item.thumbnail }} style={styles.trackImage} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleLike(item)} style={{ padding: 8 }}>
                <MaterialIcons 
                  name={isLiked(item.id) ? "favorite" : "favorite-border"} 
                  size={22} 
                  color={isLiked(item.id) ? KineticTheme.colors.primary : KineticTheme.colors.onSurfaceVariant} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSelectedTrack(item); setShowOptionsModal(true); }} style={{ padding: 8 }}>
                <MaterialIcons name="more-vert" size={24} color={KineticTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modals */}
      <TrackOptionsModal
        visible={showOptionsModal}
        track={selectedTrack}
        onClose={() => { setShowOptionsModal(false); setSelectedTrack(null); }}
        onAddToPlaylist={() => { 
          setShowOptionsModal(false); 
          setShowAddModal(true); 
        }}
      />

      <AddToPlaylistModal
        visible={showAddModal}
        track={selectedTrack}
        onClose={() => { setShowAddModal(false); setSelectedTrack(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 15, gap: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: KineticTheme.typography.headline, color: KineticTheme.colors.onSurface, fontSize: 24, flex: 1 },

  banner: { paddingHorizontal: 24, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  bannerSubtitle: { fontFamily: KineticTheme.typography.bodyBold, color: KineticTheme.colors.primary, fontSize: 14, letterSpacing: 1 },

  playAllRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24, gap: 16 },
  playAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: KineticTheme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, gap: 8 },
  playAllText: { fontFamily: KineticTheme.typography.headline, fontSize: 12, color: KineticTheme.colors.surface, letterSpacing: 1 },
  shuffleButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder, justifyContent: 'center', alignItems: 'center' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  coloredBar: { width: 6, height: 24, backgroundColor: KineticTheme.colors.secondary, borderRadius: 3, marginRight: 10 },
  sectionTitle: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 18, color: KineticTheme.colors.onSurface },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  listContainer: { paddingHorizontal: 24, paddingBottom: 120 },
  trackItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: KineticTheme.colors.glassBorder },
  trackNumber: { fontFamily: KineticTheme.typography.bodyMedium, color: KineticTheme.colors.onSurfaceVariant, fontSize: 14, width: 30, textAlign: 'center' },
  trackImage: { width: 50, height: 50, borderRadius: 10, marginRight: 14 },
  trackInfo: { flex: 1, justifyContent: 'center', paddingRight: 10 },
  trackTitle: { fontFamily: KineticTheme.typography.bodyBold, color: KineticTheme.colors.onSurface, fontSize: 15, marginBottom: 4 },
  trackArtist: { fontFamily: KineticTheme.typography.body, color: KineticTheme.colors.onSurfaceVariant, fontSize: 13 },
});
