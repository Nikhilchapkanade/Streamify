import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'expo-router';
import { KineticTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function LibraryScreen() {
  const { likedSongs, recentlyPlayed, playlists, playSong, toggleLike, setQueue, createPlaylist, deletePlaylist } = usePlayer();
  const router = useRouter();
  const [showLikedList, setShowLikedList] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handlePlay = async (track: any, trackList?: any[], index?: number) => {
    if (trackList && index !== undefined) {
      setQueue(trackList, index);
    }
    await playSong(track);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateDialog(false);
  };

  const handleDeletePlaylist = (playlistId: string, name: string) => {
    Alert.alert('Delete Playlist', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(playlistId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <MaterialIcons name="menu" size={28} color={KineticTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.logoText}>STREAMIFY</Text>
        <TouchableOpacity style={styles.profilePicContainer} onPress={() => router.push('/profile' as any)}>
          <Image source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Nikhil' }} style={styles.profilePic} />
        </TouchableOpacity>
      </View>

      {showLikedList ? (
        /* --- LIKED SONGS FULL LIST VIEW --- */
        <>
          <View style={styles.likedListHeader}>
            <TouchableOpacity onPress={() => setShowLikedList(false)} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={28} color={KineticTheme.colors.onSurface} />
            </TouchableOpacity>
            <Text style={styles.likedListTitle}>Liked Songs</Text>
            <Text style={styles.likedListCount}>{likedSongs.length} tracks</Text>
          </View>

          {likedSongs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="favorite-border" size={64} color={KineticTheme.colors.surfaceHighest} />
              <Text style={styles.emptyTitle}>No liked songs yet</Text>
              <Text style={styles.emptySubtitle}>Tap the ❤️ on any song to save it here</Text>
            </View>
          ) : (
            <FlatList
              data={likedSongs}
              keyExtractor={(item) => `liked-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.trackItem} onPress={() => handlePlay(item, likedSongs, index)}>
                  <Image source={{ uri: item.thumbnail }} style={styles.trackImage} />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleLike(item)} style={styles.removeBtn}>
                    <MaterialIcons name="favorite" size={24} color={KineticTheme.colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      ) : (
        /* --- MAIN LIBRARY VIEW --- */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
          {/* Liked Songs Card */}
          <View style={styles.likedSection}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowLikedList(true)}>
              <LinearGradient
                colors={[KineticTheme.colors.secondary, '#4a156e']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.likedCard}
              >
                <View style={styles.likedContent}>
                  <Text style={styles.likedTitle}>Liked Songs</Text>
                  <Text style={styles.likedSubtitle}>{likedSongs.length} TRACKS</Text>
                </View>
                <TouchableOpacity
                  style={styles.likedPlayButton}
                  onPress={() => {
                    if (likedSongs.length > 0) {
                      setQueue(likedSongs, 0);
                      playSong(likedSongs[0]);
                    }
                  }}
                >
                  <MaterialIcons name="play-arrow" size={32} color={KineticTheme.colors.surface} />
                </TouchableOpacity>
                <View style={styles.likedDecoCircle} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Your Playlists Section */}
          <View style={styles.playlistsSection}>
            <View style={styles.playlistsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.coloredBar} />
                <Text style={styles.sectionTitle}>Your Playlists</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateDialog(true)}>
                <MaterialIcons name="add-circle" size={32} color={KineticTheme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Create Playlist Dialog */}
            {showCreateDialog && (
              <View style={styles.createDialogRow}>
                <TextInput
                  style={styles.createInput}
                  placeholder="Playlist name..."
                  placeholderTextColor={KineticTheme.colors.onSurfaceVariant}
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  autoFocus
                  onSubmitEditing={handleCreatePlaylist}
                />
                <TouchableOpacity style={styles.createBtn} onPress={handleCreatePlaylist}>
                  <MaterialIcons name="check" size={22} color={KineticTheme.colors.surface} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowCreateDialog(false); setNewPlaylistName(''); }}>
                  <MaterialIcons name="close" size={22} color={KineticTheme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>
            )}

            {/* Playlists Grid */}
            <View style={styles.playlistGrid}>
              {playlists.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.playlistCard}
                  onPress={() => router.push(`/playlist/${p.id}` as any)}
                  onLongPress={() => handleDeletePlaylist(p.id, p.name)}
                >
                  {p.tracks[0]?.thumbnail ? (
                    <Image source={{ uri: p.tracks[0].thumbnail }} style={styles.playlistCover} />
                  ) : (
                    <View style={[styles.playlistCover, styles.playlistCoverPlaceholder]}>
                      <MaterialIcons name="queue-music" size={36} color={KineticTheme.colors.primary} />
                    </View>
                  )}
                  <Text style={styles.playlistCardTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.playlistCardCount}>{p.tracks.length} songs</Text>
                </TouchableOpacity>
              ))}
            </View>

            {playlists.length === 0 && !showCreateDialog && (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Text style={styles.emptySubtitle}>Tap + to create your first playlist</Text>
              </View>
            )}
          </View>

          {/* Recently Played */}
          {recentlyPlayed.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.coloredBar, { backgroundColor: KineticTheme.colors.secondary }]} />
                <Text style={styles.sectionTitle}>Recently Played</Text>
              </View>
              {recentlyPlayed.slice(0, 10).map((track, idx) => (
                <TouchableOpacity
                  key={`recent-${track.id}-${idx}`}
                  style={styles.trackItem}
                  onPress={() => handlePlay(track, recentlyPlayed, idx)}
                >
                  <Image source={{ uri: track.thumbnail }} style={styles.trackImage} />
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                  </View>
                  <MaterialIcons name="play-arrow" size={24} color={KineticTheme.colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty state */}
          {likedSongs.length === 0 && recentlyPlayed.length === 0 && playlists.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="library-music" size={64} color={KineticTheme.colors.surfaceHighest} />
              <Text style={styles.emptyTitle}>Your library is empty</Text>
              <Text style={styles.emptySubtitle}>Search for music and start vibing!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  logoText: { fontFamily: KineticTheme.typography.headlineItalic, fontSize: 24, color: KineticTheme.colors.primary, letterSpacing: -1 },
  profilePicContainer: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: KineticTheme.colors.primary, overflow: 'hidden' },
  profilePic: { width: '100%', height: '100%' },

  // Liked Songs Card
  likedSection: { paddingHorizontal: 24, marginTop: 10, marginBottom: 30 },
  likedCard: { width: '100%', borderRadius: 32, padding: 32, position: 'relative', overflow: 'hidden', minHeight: 160 },
  likedContent: { position: 'relative', zIndex: 10 },
  likedTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 36, color: KineticTheme.colors.onSurface, marginBottom: 8 },
  likedSubtitle: { fontFamily: KineticTheme.typography.headline, fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  likedPlayButton: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: KineticTheme.colors.primary, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 10 },
  likedDecoCircle: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Playlists
  playlistsSection: { paddingHorizontal: 24, marginBottom: 30 },
  playlistsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  coloredBar: { width: 6, height: 24, backgroundColor: KineticTheme.colors.primary, borderRadius: 3, marginRight: 10 },
  sectionTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 20, color: KineticTheme.colors.onSurface },

  createDialogRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  createInput: { flex: 1, height: 48, backgroundColor: KineticTheme.colors.surfaceHighest, borderRadius: 12, paddingHorizontal: 16, fontFamily: KineticTheme.typography.bodyMedium, fontSize: 15, color: KineticTheme.colors.onSurface, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  createBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: KineticTheme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: KineticTheme.colors.surfaceHighest, justifyContent: 'center', alignItems: 'center' },

  playlistGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  playlistCard: { width: '47%', marginBottom: 8 },
  playlistCover: { width: '100%', aspectRatio: 1, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  playlistCoverPlaceholder: { backgroundColor: KineticTheme.colors.surfaceHighest, justifyContent: 'center', alignItems: 'center' },
  playlistCardTitle: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 15, color: KineticTheme.colors.onSurface },
  playlistCardCount: { fontFamily: KineticTheme.typography.body, fontSize: 12, color: KineticTheme.colors.onSurfaceVariant, marginTop: 2 },

  // Section headers
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 10 },

  // Recent section
  recentSection: { paddingHorizontal: 0, marginBottom: 20 },

  // Track list items
  listContainer: { paddingHorizontal: 24, paddingBottom: 150 },
  trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: KineticTheme.colors.glassBorder },
  trackImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: KineticTheme.colors.surfaceHighest },
  trackInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  trackTitle: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 16, color: KineticTheme.colors.onSurface, marginBottom: 4 },
  trackArtist: { fontFamily: KineticTheme.typography.body, fontSize: 13, color: KineticTheme.colors.onSurfaceVariant },
  removeBtn: { padding: 10 },

  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 60 },
  emptyTitle: { fontFamily: KineticTheme.typography.headline, color: KineticTheme.colors.onSurface, fontSize: 20, marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontFamily: KineticTheme.typography.body, color: KineticTheme.colors.onSurfaceVariant, fontSize: 14, textAlign: 'center' },

  // Liked list view
  likedListHeader: { paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backButton: { padding: 4 },
  likedListTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 24, color: KineticTheme.colors.onSurface, flex: 1 },
  likedListCount: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 13, color: KineticTheme.colors.onSurfaceVariant },
});
