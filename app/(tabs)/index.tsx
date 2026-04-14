import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '@/context/PlayerContext';
import { KineticTheme } from '@/constants/theme';
import { TrackOptionsModal } from '@/components/TrackOptionsModal';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';

const { width, height } = Dimensions.get('window');

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const { currentTrack, isPlaying, isLoading, position, duration, togglePlayback, seekTo, toggleLike, isLiked, skipToNext, skipToPrevious, shuffleMode, toggleShuffle, repeatMode, toggleRepeat, queue, currentIndex } = usePlayer();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const [showOptions, setShowOptions] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleValueChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSlidingComplete = async (value: number) => {
    await seekTo(value);
    setIsSeeking(false);
  };

  const displayPosition = isSeeking ? seekValue : position;
  const progressPercent = duration > 0 ? (displayPosition / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Background Decorators */}
      <View style={[styles.bgBlob, { top: '-10%', right: '-10%', backgroundColor: KineticTheme.colors.secondary }]} />
      <View style={[styles.bgBlob, { bottom: '-10%', left: '-10%', backgroundColor: KineticTheme.colors.primary }]} />
      <LinearGradient colors={['rgba(14,14,14,0.7)', KineticTheme.colors.surface]} style={styles.bgGradient} />

      {/* Header */}
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.headerIconBtn}>
            <MaterialIcons name="keyboard-arrow-down" size={32} color={KineticTheme.colors.primary} />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>NOW PLAYING</Text>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => setShowOptions(true)}>
          <MaterialIcons name="more-vert" size={28} color={KineticTheme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Album Art with Glowing Drop Shadow Container */}
        <View style={styles.artworkWrapper}>
          <View style={styles.artworkGlow} />
          <View style={styles.artworkContainer}>
            {isLoading && !currentTrack ? (
               <View style={[styles.artwork, { backgroundColor: KineticTheme.colors.surfaceHigh, justifyContent: 'center', alignItems: 'center' }]}>
                 <ActivityIndicator color={KineticTheme.colors.primary} size="large" />
               </View>
            ) : (
              <>
                <Image
                  source={{ uri: currentTrack?.thumbnail || 'https://placehold.co/400x400/222/8eff71?text=STREAMIFY' }}
                  style={styles.artwork}
                />
                <View style={styles.artworkBorder} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.artworkGradientOverlay} />
              </>
            )}
          </View>
        </View>

        {/* Typography Cluster */}
        <View style={styles.typographyBox}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, paddingRight: 20 }}>
              <Text style={styles.mainTitle} numberOfLines={2}>
                {currentTrack?.title ? currentTrack.title.toUpperCase() : 'CYBERPULSE'}
              </Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {currentTrack?.artist ? currentTrack.artist.toUpperCase() : 'NEON VOYAGER'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => currentTrack && toggleLike(currentTrack)} disabled={!currentTrack}>
              <MaterialIcons 
                name={currentTrack && isLiked(currentTrack.id) ? "favorite" : "favorite-border"} 
                size={36} 
                color={currentTrack && isLiked(currentTrack.id) ? KineticTheme.colors.primary : KineticTheme.colors.onSurfaceVariant} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Playback Progress */}
        <View style={styles.progressSection}>
          <View style={styles.customProgressContainer}>
             <View style={styles.progressTrack} />
             <LinearGradient 
               colors={[KineticTheme.colors.primary, KineticTheme.colors.primaryContainer]} 
               style={[styles.progressFill, { width: `${progressPercent}%` }]} 
               start={{x: 0, y: 0}} end={{x: 1, y: 0}}
             />
             {/* Invisible slider placed over the custom track for interactions */}
             <Slider
                style={styles.realSlider}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 1}
                value={displayPosition}
                onSlidingStart={handleSlidingStart}
                onValueChange={handleValueChange}
                onSlidingComplete={handleSlidingComplete}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor={KineticTheme.colors.onSurface}
                disabled={!currentTrack}
              />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
            <Text style={[styles.timeText, { color: KineticTheme.colors.primary }]}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.sideControl} onPress={toggleShuffle}>
             <MaterialIcons name="shuffle" size={28} color={shuffleMode ? KineticTheme.colors.primary : KineticTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.centerControls}>
            <TouchableOpacity onPress={skipToPrevious} disabled={isLoading || !currentTrack}>
              <MaterialIcons name="skip-previous" size={48} color={KineticTheme.colors.onSurface} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButtonGlow} 
              onPress={togglePlayback} 
              disabled={isLoading || !currentTrack}
              activeOpacity={0.8}
            >
              <LinearGradient 
                 colors={[KineticTheme.colors.primary, KineticTheme.colors.primaryContainer]}
                 style={styles.playButtonInner}
              >
                {isLoading && currentTrack ? (
                  <ActivityIndicator color={KineticTheme.colors.surface} size="large" />
                ) : (
                  <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={48} color={KineticTheme.colors.surface} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={skipToNext} disabled={isLoading || !currentTrack}>
              <MaterialIcons name="skip-next" size={48} color={KineticTheme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.sideControl} onPress={toggleRepeat}>
             <MaterialIcons name={repeatMode === 'one' ? "repeat-one" : "repeat"} size={28} color={repeatMode !== 'off' ? KineticTheme.colors.primary : KineticTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Accessory Glass Panel */}
        <View style={styles.accessoryPanel}>
           <TouchableOpacity style={styles.accessoryItem}>
              <MaterialIcons name="monitor" size={24} color={KineticTheme.colors.onSurfaceVariant} />
              <Text style={styles.accessoryText}>OUTPUT</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.accessoryItem}>
              <MaterialIcons name="share" size={24} color={KineticTheme.colors.onSurfaceVariant} />
              <Text style={styles.accessoryText}>SHARE</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.accessoryItem} onPress={() => router.push('/queue' as any)}>
              <MaterialIcons name="queue-music" size={24} color={KineticTheme.colors.onSurfaceVariant} />
              <Text style={styles.accessoryText}>QUEUE</Text>
           </TouchableOpacity>
        </View>
      </View>

      <TrackOptionsModal
        visible={showOptions}
        track={currentTrack}
        onClose={() => setShowOptions(false)}
        onAddToPlaylist={() => {
          setShowOptions(false);
          setShowAddToPlaylist(true);
        }}
      />

      <AddToPlaylistModal
        visible={showAddToPlaylist}
        track={currentTrack}
        onClose={() => setShowAddToPlaylist(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },
  bgBlob: { position: 'absolute', width: width * 1.2, height: width * 1.2, borderRadius: width, opacity: 0.15, filter: 'blur(100px)' as any },
  bgGradient: { position: 'absolute', inset: 0, zIndex: 0 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, zIndex: 10 },
  headerIconBtn: { padding: 4 },
  headerTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 14, color: KineticTheme.colors.onSurface, letterSpacing: 2, textAlign: 'center' },

  mainContent: { flex: 1, paddingHorizontal: 32, paddingBottom: 40, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

  artworkWrapper: { width: '100%', maxWidth: 400, aspectRatio: 1, marginBottom: 40, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  artworkGlow: { position: 'absolute', width: '80%', height: '80%', backgroundColor: KineticTheme.colors.primary, opacity: 0.3, borderRadius: 200, filter: 'blur(60px)' as any },
  artworkContainer: { width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 20}, shadowOpacity: 0.6, shadowRadius: 30 },
  artwork: { width: '100%', height: '100%' },
  artworkBorder: { position: 'absolute', inset: 0, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder, borderRadius: 32, pointerEvents: 'none' },
  artworkGradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '33%' },

  typographyBox: { width: '100%', maxWidth: 400, marginBottom: 35 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  mainTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 36, color: KineticTheme.colors.onSurface, lineHeight: 42, letterSpacing: -1 },
  subTitle: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 18, color: KineticTheme.colors.secondary, letterSpacing: 2, marginTop: 4 },

  progressSection: { width: '100%', maxWidth: 400, marginBottom: 35 },
  customProgressContainer: { height: 20, justifyContent: 'center', position: 'relative' },
  progressTrack: { position: 'absolute', left: 0, right: 0, height: 6, backgroundColor: KineticTheme.colors.surfaceHighest, borderRadius: 3 },
  progressFill: { position: 'absolute', left: 0, height: 6, borderRadius: 3 },
  realSlider: { width: '100%', height: 40, position: 'absolute', left: 0, right: 0 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeText: { fontFamily: KineticTheme.typography.headline, fontSize: 10, color: KineticTheme.colors.onSurfaceVariant, letterSpacing: 1.5 },

  controlsRow: { width: '100%', maxWidth: 400, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  centerControls: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  sideControl: { padding: 10 },
  playButtonGlow: { shadowColor: KineticTheme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15 },
  playButtonInner: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },

  accessoryPanel: { width: '100%', maxWidth: 400, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 'auto', backgroundColor: KineticTheme.colors.glassBase, paddingVertical: 16, borderRadius: 24, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  accessoryItem: { alignItems: 'center', gap: 6 },
  accessoryText: { fontFamily: KineticTheme.typography.headline, fontSize: 9, color: KineticTheme.colors.onSurfaceVariant, letterSpacing: 1 },
});
