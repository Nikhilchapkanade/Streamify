import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import { KineticTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function QueueScreen() {
  const { queue, currentIndex, currentTrack, removeFromQueue, playSong, setQueue, clearQueue, skipToNext } = usePlayer();
  const router = useRouter();

  const handlePlayFromQueue = async (index: number) => {
    // Just jump to that index in the existing queue
    setQueue(queue, index);
    await playSong(queue[index]);
    router.back();
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isPlaying = index === currentIndex;
    const isPast = index < currentIndex;

    return (
      <TouchableOpacity 
        style={[styles.trackItem, isPlaying && styles.playingItem, isPast && styles.pastItem]} 
        onPress={() => handlePlayFromQueue(index)}
      >
        <Image source={{ uri: item.thumbnail }} style={[styles.thumbnail, isPast && styles.pastThumbnail]} />
        <View style={styles.trackInfo}>
          <Text style={[styles.title, isPlaying && { color: KineticTheme.colors.primary }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
        </View>
        
        {isPlaying ? (
          <View style={styles.playingIndicator}>
             <MaterialIcons name="volume-up" size={24} color={KineticTheme.colors.primary} />
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => removeFromQueue(index)}
          >
            <MaterialIcons name="close" size={24} color={KineticTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="keyboard-arrow-down" size={32} color={KineticTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Playing Next</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={clearQueue}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Now Playing Section */}
      {currentTrack && (
        <View style={styles.nowPlayingSection}>
          <Text style={styles.sectionLabel}>Now Playing</Text>
          <TouchableOpacity style={styles.nowPlayingCard} onPress={() => router.back()}>
             <Image source={{ uri: currentTrack.thumbnail }} style={styles.npThumbnail} />
             <View style={styles.npInfo}>
               <Text style={styles.npTitle} numberOfLines={1}>{currentTrack.title}</Text>
               <Text style={styles.npArtist} numberOfLines={1}>{currentTrack.artist}</Text>
             </View>
             <TouchableOpacity style={styles.skipBtn} onPress={skipToNext}>
                <MaterialIcons name="skip-next" size={28} color={KineticTheme.colors.onSurface} />
             </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

      {/* Up Next List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionLabel}>Up Next</Text>
        <FlatList
          data={queue}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="queue-music" size={64} color={KineticTheme.colors.surfaceHighest} />
              <Text style={styles.emptyText}>Queue is empty.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 18, color: KineticTheme.colors.onSurface },
  clearBtn: { padding: 8 },
  clearBtnText: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 14, color: KineticTheme.colors.primary },

  sectionLabel: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 16, color: KineticTheme.colors.onSurface, paddingHorizontal: 24, marginBottom: 12, marginTop: 10 },
  
  nowPlayingSection: { marginBottom: 10 },
  nowPlayingCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, padding: 12, backgroundColor: KineticTheme.colors.surfaceHighest, borderRadius: 16, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  npThumbnail: { width: 56, height: 56, borderRadius: 10 },
  npInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  npTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 16, color: KineticTheme.colors.primary, marginBottom: 4 },
  npArtist: { fontFamily: KineticTheme.typography.body, fontSize: 14, color: KineticTheme.colors.onSurfaceVariant },
  skipBtn: { padding: 10 },

  listContainer: { flex: 1 },
  trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  playingItem: { backgroundColor: 'rgba(142, 255, 113, 0.05)' },
  pastItem: { opacity: 0.5 },
  thumbnail: { width: 48, height: 48, borderRadius: 8, backgroundColor: KineticTheme.colors.surfaceHighest },
  pastThumbnail: { opacity: 0.7 },
  trackInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  title: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 15, color: KineticTheme.colors.onSurface, marginBottom: 4 },
  artist: { fontFamily: KineticTheme.typography.body, fontSize: 13, color: KineticTheme.colors.onSurfaceVariant },
  iconBtn: { padding: 8 },
  playingIndicator: { padding: 8 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontFamily: KineticTheme.typography.bodyMedium, color: KineticTheme.colors.onSurfaceVariant, fontSize: 16, marginTop: 16 },
});
