import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import { KineticTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchLyrics, parseSyncedLyrics, LyricLine } from '@/services/LyricsService';

export default function LyricsScreen() {
  const router = useRouter();
  const { currentTrack, position, duration, isPlaying, togglePlayback } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [syncedLyrics, setSyncedLyrics] = useState<LyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef<number>(-1);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack) return;

    const loadLyrics = async () => {
      setLoading(true);
      setSyncedLyrics([]);
      setPlainLyrics(null);
      setActiveLineIndex(-1);
      activeIndexRef.current = -1;

      const lyricsData = await fetchLyrics(
        currentTrack.title,
        currentTrack.artist,
        currentTrack.duration || duration
      );

      if (lyricsData) {
        if (lyricsData.syncedLyrics) {
          const parsed = parseSyncedLyrics(lyricsData.syncedLyrics);
          setSyncedLyrics(parsed);
        } else if (lyricsData.plainLyrics) {
          setPlainLyrics(lyricsData.plainLyrics);
        }
      }
      setLoading(false);
    };

    loadLyrics();
  }, [currentTrack]);

  // Synchronize active line with playback position
  useEffect(() => {
    if (syncedLyrics.length === 0) return;

    // Find the current active line
    let activeIndex = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (position >= syncedLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }

    if (activeIndex !== activeLineIndex && activeIndex !== -1) {
      setActiveLineIndex(activeIndex);
      activeIndexRef.current = activeIndex;
      
      // Auto scroll to active lyric line
      flatListRef.current?.scrollToIndex({
        index: activeIndex,
        viewOffset: 200, // Keep active lyric centered
        animated: true,
      });
    }
  }, [position, syncedLyrics, activeLineIndex]);

  const handleClose = () => {
    router.back();
  };

  const renderLyricItem = ({ item, index }: { item: LyricLine; index: number }) => {
    const isActive = index === activeLineIndex;
    return (
      <View style={styles.lyricLineContainer}>
        <Text
          style={[
            styles.lyricText,
            isActive && styles.activeLyricText,
            index < activeLineIndex && styles.pastLyricText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No track playing</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={[KineticTheme.colors.background || '#090A0F', '#1E1035', '#090A0F']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <MaterialIcons name="keyboard-arrow-down" size={32} color={KineticTheme.colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.trackInfo}>
            <Text style={styles.titleText} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artistText} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <View style={{ width: 32 }} /> {/* Balancer */}
        </View>

        {/* Lyrics Area */}
        <View style={styles.lyricsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={KineticTheme.colors.primary} />
          ) : syncedLyrics.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={syncedLyrics}
              keyExtractor={(item, index) => `${index}-${item.time}`}
              renderItem={renderLyricItem}
              contentContainerStyle={styles.lyricsListContent}
              showsVerticalScrollIndicator={false}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    viewOffset: 200,
                    animated: false,
                  });
                }, 100);
              }}
            />
          ) : plainLyrics ? (
            <FlatList
              data={plainLyrics.split('\n')}
              keyExtractor={(item, index) => `${index}`}
              renderItem={({ item }) => (
                <View style={styles.lyricLineContainer}>
                  <Text style={styles.plainLyricText}>{item}</Text>
                </View>
              )}
              contentContainerStyle={styles.lyricsListContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noLyricsContainer}>
              <MaterialIcons name="music-off" size={48} color={KineticTheme.colors.onSurface} style={{ opacity: 0.5 }} />
              <Text style={styles.noLyricsText}>No lyrics available for this song</Text>
            </View>
          )}
        </View>

        {/* Quick controls bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
            <MaterialIcons
              name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
              size={64}
              color={KineticTheme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  trackInfo: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 15,
  },
  titleText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
  },
  artistText: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  lyricsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  lyricsListContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 200,
  },
  lyricLineContainer: {
    marginVertical: 12,
  },
  lyricText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    lineHeight: 30,
  },
  activeLyricText: {
    color: '#FFF',
    fontSize: 26,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pastLyricText: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  plainLyricText: {
    color: '#DDD',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'Inter_500Medium',
  },
  noLyricsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noLyricsText: {
    color: '#888',
    fontSize: 16,
    marginTop: 15,
    fontFamily: 'Inter_500Medium',
  },
  controlsBar: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  playButton: {
    padding: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090A0F',
  },
  errorText: {
    color: '#888',
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Inter_500Medium',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: KineticTheme.colors.primary,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
