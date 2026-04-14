import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { KineticTheme } from '@/constants/theme';
import { usePlayer, Track } from '@/context/PlayerContext';
import { router } from 'expo-router';

type Props = {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
  onAddToPlaylist: () => void;
};

export function TrackOptionsModal({ visible, track, onClose, onAddToPlaylist }: Props) {
  const { addToQueue, playNext, toggleLike, isLiked, currentTrack } = usePlayer();

  if (!track) return null;

  const liked = isLiked(track.id);
  const isCurrentlyPlaying = currentTrack?.id === track.id;

  const handlePlayNext = () => {
    playNext(track);
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    onClose();
  };

  const handleToggleLike = () => {
    toggleLike(track);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Image source={{ uri: track.thumbnail }} style={styles.thumbnail} />
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Options */}
          <TouchableOpacity style={styles.optionRow} onPress={handleToggleLike}>
            <MaterialIcons name={liked ? "favorite" : "favorite-border"} size={26} color={liked ? KineticTheme.colors.primary : KineticTheme.colors.onSurface} />
            <Text style={[styles.optionText, liked && { color: KineticTheme.colors.primary }]}>
              {liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={onAddToPlaylist}>
            <MaterialIcons name="playlist-add" size={28} color={KineticTheme.colors.onSurface} />
            <Text style={styles.optionText}>Add to Playlist</Text>
          </TouchableOpacity>

          {!isCurrentlyPlaying && (
            <TouchableOpacity style={styles.optionRow} onPress={handlePlayNext}>
              <MaterialIcons name="playlist-play" size={28} color={KineticTheme.colors.onSurface} />
              <Text style={styles.optionText}>Play Next</Text>
            </TouchableOpacity>
          )}

          {!isCurrentlyPlaying && (
            <TouchableOpacity style={styles.optionRow} onPress={handleAddToQueue}>
              <MaterialIcons name="queue" size={26} color={KineticTheme.colors.onSurface} style={{ marginLeft: 2 }} />
              <Text style={styles.optionText}>Add to Queue</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.optionRow} onPress={() => { onClose(); router.push(`/artist/${encodeURIComponent(track.artist.split(',')[0].trim())}` as any); }}>
            <MaterialIcons name="person" size={26} color={KineticTheme.colors.onSurface} style={{ marginLeft: 2 }} />
            <Text style={styles.optionText}>View Artist</Text>
          </TouchableOpacity>

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
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: KineticTheme.colors.onSurfaceVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: KineticTheme.colors.surfaceHighest,
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontFamily: KineticTheme.typography.headline,
    fontSize: 18,
    color: KineticTheme.colors.onSurface,
    marginBottom: 4,
  },
  artist: {
    fontFamily: KineticTheme.typography.body,
    fontSize: 14,
    color: KineticTheme.colors.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: KineticTheme.colors.glassBorder,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionText: {
    fontFamily: KineticTheme.typography.bodyBold,
    fontSize: 16,
    color: KineticTheme.colors.onSurface,
    marginLeft: 18,
  },
});
