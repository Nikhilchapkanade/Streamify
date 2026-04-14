import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import { KineticTheme } from '@/constants/theme';
import { router } from 'expo-router';

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlayback, toggleLike, isLiked, duration, position } = usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.9}
      onPress={() => router.push('/(tabs)')}
    >
      <View style={styles.content}>
        <Image source={{ uri: currentTrack.thumbnail }} style={styles.artwork} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
        >
          <MaterialIcons 
            name={liked ? "favorite" : "favorite-border"} 
            size={22} 
            color={liked ? KineticTheme.colors.primary : KineticTheme.colors.onSurfaceVariant} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={(e) => { e.stopPropagation(); togglePlayback(); }}
        >
          <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={28} color={KineticTheme.colors.surface} />
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: `${KineticTheme.colors.surfaceHigh}ee`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: KineticTheme.colors.glassBorder,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: KineticTheme.colors.surfaceHighest,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontFamily: KineticTheme.typography.bodyBold,
    fontSize: 14,
    color: KineticTheme.colors.onSurface,
    marginBottom: 2,
  },
  artist: {
    fontFamily: KineticTheme.typography.body,
    fontSize: 12,
    color: KineticTheme.colors.primary,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: KineticTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  progressContainer: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: KineticTheme.colors.primary,
    borderRadius: 1,
  },
});
