import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KineticTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams();
  const { playlists, playSong, setQueue, removeFromPlaylist, deletePlaylist, toggleLike, isLiked } = usePlayer();
  const router = useRouter();

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color={KineticTheme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons name="error-outline" size={64} color={KineticTheme.colors.surfaceHighest} />
          <Text style={styles.emptyTitle}>Playlist not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlay = async (index: number) => {
    setQueue(playlist.tracks, index);
    await playSong(playlist.tracks[index]);
  };

  const handlePlayAll = async () => {
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks, 0);
      await playSong(playlist.tracks[0]);
    }
  };

  const handleShuffle = async () => {
    if (playlist.tracks.length > 0) {
      const idx = Math.floor(Math.random() * playlist.tracks.length);
      setQueue(playlist.tracks, idx);
      await playSong(playlist.tracks[idx]);
    }
  };

  const handleRemove = (trackId: string) => {
    Alert.alert('Remove Song', 'Remove this song from the playlist?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromPlaylist(playlist.id, trackId) },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Playlist', `Delete "${playlist.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deletePlaylist(playlist.id); router.back(); } },
    ]);
  };

  const coverImage = playlist.tracks[0]?.thumbnail;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={KineticTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
        <TouchableOpacity onPress={handleDelete}>
          <MaterialIcons name="delete-outline" size={24} color={KineticTheme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Playlist Info Card */}
      <View style={styles.infoCard}>
        <LinearGradient
          colors={[KineticTheme.colors.primary + '40', KineticTheme.colors.surface]}
          style={styles.infoGradient}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <MaterialIcons name="queue-music" size={48} color={KineticTheme.colors.primary} />
            </View>
          )}
          <View style={styles.infoText}>
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <Text style={styles.playlistMeta}>{playlist.tracks.length} songs</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      {playlist.tracks.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
            <MaterialIcons name="play-arrow" size={24} color={KineticTheme.colors.surface} />
            <Text style={styles.playAllText}>PLAY ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
            <MaterialIcons name="shuffle" size={24} color={KineticTheme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Track List */}
      {playlist.tracks.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="library-music" size={64} color={KineticTheme.colors.surfaceHighest} />
          <Text style={styles.emptyTitle}>No songs yet</Text>
          <Text style={styles.emptySubtitle}>Search for music and add it to this playlist</Text>
        </View>
      ) : (
        <FlatList
          data={playlist.tracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.trackItem} onPress={() => handlePlay(index)}>
              <Text style={styles.trackNumber}>{index + 1}</Text>
              <Image source={{ uri: item.thumbnail }} style={styles.trackImage} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item.id)} style={{ padding: 8 }}>
                <MaterialIcons name="remove-circle-outline" size={22} color={KineticTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 15, gap: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontFamily: KineticTheme.typography.headline, color: KineticTheme.colors.onSurface, fontSize: 22, flex: 1 },

  infoCard: { marginHorizontal: 24, borderRadius: 24, overflow: 'hidden', marginBottom: 24 },
  infoGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  coverImage: { width: 80, height: 80, borderRadius: 16, marginRight: 20 },
  coverPlaceholder: { backgroundColor: KineticTheme.colors.surfaceHighest, justifyContent: 'center', alignItems: 'center' },
  infoText: { flex: 1 },
  playlistName: { fontFamily: KineticTheme.typography.headline, fontSize: 24, color: KineticTheme.colors.onSurface, marginBottom: 6 },
  playlistMeta: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 14, color: KineticTheme.colors.onSurfaceVariant },

  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24, gap: 16 },
  playAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: KineticTheme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, gap: 8 },
  playAllText: { fontFamily: KineticTheme.typography.headline, fontSize: 12, color: KineticTheme.colors.surface, letterSpacing: 1 },
  shuffleButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder, justifyContent: 'center', alignItems: 'center' },

  listContainer: { paddingHorizontal: 24, paddingBottom: 120 },
  trackItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: KineticTheme.colors.glassBorder },
  trackNumber: { fontFamily: KineticTheme.typography.bodyMedium, color: KineticTheme.colors.onSurfaceVariant, fontSize: 14, width: 30, textAlign: 'center' },
  trackImage: { width: 50, height: 50, borderRadius: 10, marginRight: 14 },
  trackInfo: { flex: 1, justifyContent: 'center', paddingRight: 10 },
  trackTitle: { fontFamily: KineticTheme.typography.bodyBold, color: KineticTheme.colors.onSurface, fontSize: 15, marginBottom: 4 },
  trackArtist: { fontFamily: KineticTheme.typography.body, color: KineticTheme.colors.onSurfaceVariant, fontSize: 13 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontFamily: KineticTheme.typography.headline, color: KineticTheme.colors.onSurface, fontSize: 20, marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontFamily: KineticTheme.typography.body, color: KineticTheme.colors.onSurfaceVariant, fontSize: 14, textAlign: 'center' },
});
