import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { KineticTheme } from '@/constants/theme';
import { usePlayer, Track } from '@/context/PlayerContext';

type Props = {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
};

export function AddToPlaylistModal({ visible, track, onClose }: Props) {
  const { playlists, createPlaylist, addToPlaylist, isInPlaylist } = usePlayer();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const playlist = await createPlaylist(newName.trim());
    if (track) {
      await addToPlaylist(playlist.id, track);
    }
    setNewName('');
    setShowCreate(false);
    onClose();
  };

  const handleAdd = async (playlistId: string) => {
    if (!track) return;
    if (isInPlaylist(playlistId, track.id)) {
      Alert.alert('Already Added', 'This song is already in this playlist.');
      return;
    }
    await addToPlaylist(playlistId, track);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Add to Playlist</Text>

          {track && (
            <Text style={styles.trackInfo} numberOfLines={1}>
              {track.title} — {track.artist}
            </Text>
          )}

          {/* Create New */}
          {showCreate ? (
            <View style={styles.createRow}>
              <TextInput
                style={styles.createInput}
                placeholder="Playlist name..."
                placeholderTextColor={KineticTheme.colors.onSurfaceVariant}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                onSubmitEditing={handleCreate}
              />
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <MaterialIcons name="check" size={24} color={KineticTheme.colors.surface} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowCreate(false); setNewName(''); }}>
                <MaterialIcons name="close" size={24} color={KineticTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.newPlaylistRow} onPress={() => setShowCreate(true)}>
              <View style={styles.newPlaylistIcon}>
                <MaterialIcons name="add" size={28} color={KineticTheme.colors.surface} />
              </View>
              <Text style={styles.newPlaylistText}>Create New Playlist</Text>
            </TouchableOpacity>
          )}

          {/* Existing Playlists */}
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => {
              const alreadyIn = track ? isInPlaylist(item.id, track.id) : false;
              return (
                <TouchableOpacity
                  style={[styles.playlistRow, alreadyIn && styles.playlistRowDisabled]}
                  onPress={() => handleAdd(item.id)}
                  disabled={alreadyIn}
                >
                  <View style={styles.playlistIconContainer}>
                    <MaterialIcons name="queue-music" size={24} color={KineticTheme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playlistName}>{item.name}</Text>
                    <Text style={styles.playlistCount}>{item.tracks.length} songs</Text>
                  </View>
                  {alreadyIn && (
                    <MaterialIcons name="check-circle" size={22} color={KineticTheme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No playlists yet. Create one above!</Text>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: KineticTheme.colors.surfaceHigh,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: KineticTheme.colors.glassBorder,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: KineticTheme.colors.onSurfaceVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: KineticTheme.typography.headline,
    fontSize: 24,
    color: KineticTheme.colors.onSurface,
    marginBottom: 8,
  },
  trackInfo: {
    fontFamily: KineticTheme.typography.body,
    fontSize: 13,
    color: KineticTheme.colors.onSurfaceVariant,
    marginBottom: 24,
  },

  newPlaylistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: KineticTheme.colors.glassBorder,
  },
  newPlaylistIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: KineticTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  newPlaylistText: {
    fontFamily: KineticTheme.typography.bodyBold,
    fontSize: 16,
    color: KineticTheme.colors.primary,
  },

  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  createInput: {
    flex: 1,
    height: 48,
    backgroundColor: KineticTheme.colors.surfaceHighest,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: KineticTheme.typography.bodyMedium,
    fontSize: 15,
    color: KineticTheme.colors.onSurface,
    borderWidth: 1,
    borderColor: KineticTheme.colors.glassBorder,
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: KineticTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: KineticTheme.colors.surfaceHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: KineticTheme.colors.glassBorder,
  },
  playlistRowDisabled: { opacity: 0.5 },
  playlistIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: KineticTheme.colors.surfaceHighest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistName: {
    fontFamily: KineticTheme.typography.bodyBold,
    fontSize: 16,
    color: KineticTheme.colors.onSurface,
    marginBottom: 2,
  },
  playlistCount: {
    fontFamily: KineticTheme.typography.body,
    fontSize: 12,
    color: KineticTheme.colors.onSurfaceVariant,
  },
  emptyText: {
    fontFamily: KineticTheme.typography.body,
    fontSize: 14,
    color: KineticTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 30,
  },
});
