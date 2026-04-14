import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePlayer, Track } from '@/context/PlayerContext';
import { KineticTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';
import { TrackOptionsModal } from '@/components/TrackOptionsModal';

const BACKEND = 'https://jiosaavn-api-privatecvc2.vercel.app';

type SearchResult = Track;

// Genre chips for browse view
const GENRES = [
  { name: 'Bollywood', query: 'bollywood hits 2024', color: '#FF6B6B' },
  { name: 'Pop', query: 'pop hits 2024', color: '#4ECDC4' },
  { name: 'Hip-Hop', query: 'hip hop trending', color: '#FFE66D' },
  { name: 'Romantic', query: 'romantic songs hindi', color: '#FF85A2' },
  { name: 'Punjabi', query: 'punjabi hits latest', color: '#A855F7' },
  { name: 'Lofi', query: 'lofi chill beats', color: '#38BDF8' },
  { name: 'EDM', query: 'edm electronic dance', color: '#8eff71' },
  { name: 'Classical', query: 'indian classical music', color: '#F59E0B' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { playSong, isLoading, setQueue, toggleLike, isLiked } = usePlayer();

  // Add to Playlist modal
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const searchMusic = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND}/search/songs?query=${encodeURIComponent(q)}&limit=20`);
      const data = await response.json();
      
      if (data.data?.results) {
        const mapped = data.data.results.map((entry: any) => ({
          id: entry.id,
          title: entry.name,
          artist: entry.primaryArtists,
          thumbnail: entry.image?.length ? entry.image[entry.image.length - 1].link : '',
          stream_url: entry.downloadUrl?.length ? entry.downloadUrl[entry.downloadUrl.length - 1].link : '',
          duration: entry.duration
        }));
        setResults(mapped);
        if (searchQuery) setQuery(searchQuery);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (item: SearchResult) => {
    const idx = results.findIndex(r => r.id === item.id);
    setQueue(results, idx >= 0 ? idx : 0);
    await playSong(item);
  };

  const renderSearchItem = ({ item }: { item: SearchResult }) => {
    const liked = isLiked(item.id);
    return (
      <TouchableOpacity style={styles.resultItem} onPress={() => handlePlay(item)} disabled={isLoading}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.resultArtist} numberOfLines={1}>{item.artist}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => toggleLike(item)}>
          <MaterialIcons name={liked ? "favorite" : "favorite-border"} size={20} color={liked ? KineticTheme.colors.primary : KineticTheme.colors.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => { setSelectedTrack(item); setShowOptionsModal(true); }}>
          <MaterialIcons name="more-vert" size={24} color={KineticTheme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
           <MaterialIcons name="menu" size={28} color={KineticTheme.colors.primary} />
           <Text style={styles.logoText}>STREAMIFY</Text>
           <TouchableOpacity style={styles.profilePicContainer} onPress={() => router.push('/profile' as any)}>
             <Image source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Nikhil' }} style={styles.profilePic} />
           </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={24} color={KineticTheme.colors.onSurfaceVariant} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search artists, songs..."
            placeholderTextColor={KineticTheme.colors.onSurfaceVariant}
            value={query}
            onChangeText={(text) => {
               setQuery(text);
               if (text.length === 0) setResults([]);
            }}
            onSubmitEditing={() => searchMusic()}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <MaterialIcons name="close" size={24} color={KineticTheme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {results.length > 0 || loading ? (
        // --- SEARCH RESULTS ---
        loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={KineticTheme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No results found.</Text>
              </View>
            }
          />
        )
      ) : (
        // --- BROWSE GENRES VIEW ---
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.browseSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.coloredBar} />
              <Text style={styles.sectionTitle}>Browse by Genre</Text>
            </View>
            <View style={styles.genreGrid}>
              {GENRES.map((genre) => (
                <TouchableOpacity 
                  key={genre.name} 
                  style={styles.genreCard}
                  onPress={() => searchMusic(genre.query)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[genre.color + 'CC', genre.color + '33']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                    style={styles.genreGradient}
                  >
                    <Text style={styles.genreName}>{genre.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Search Suggestions */}
          <View style={styles.browseSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.coloredBar, { backgroundColor: KineticTheme.colors.secondary }]} />
              <Text style={styles.sectionTitle}>Trending Searches</Text>
            </View>
            {['Arijit Singh', 'AP Dhillon', 'Dua Lipa', 'The Weeknd', 'Diljit Dosanjh'].map((artist) => (
              <TouchableOpacity
                key={artist}
                style={styles.trendingRow}
                onPress={() => searchMusic(artist)}
              >
                <MaterialIcons name="trending-up" size={20} color={KineticTheme.colors.primary} />
                <Text style={styles.trendingText}>{artist}</Text>
                <MaterialIcons name="arrow-forward-ios" size={14} color={KineticTheme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoText: { fontFamily: KineticTheme.typography.headlineItalic, fontSize: 24, color: KineticTheme.colors.primary, letterSpacing: -1 },
  profilePicContainer: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: KineticTheme.colors.primary, overflow: 'hidden' },
  profilePic: { width: '100%', height: '100%' },

  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: KineticTheme.colors.surfaceHighest, borderRadius: 16, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: KineticTheme.colors.onSurface, fontFamily: KineticTheme.typography.bodyMedium, fontSize: 16 },

  // Search Results
  listContainer: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 10 },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  thumbnail: { width: 56, height: 56, borderRadius: 12, borderWidth: 1, borderColor: KineticTheme.colors.glassBorder },
  resultInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  resultTitle: { fontFamily: KineticTheme.typography.bodyBold, color: KineticTheme.colors.onSurface, fontSize: 15, marginBottom: 4 },
  resultArtist: { fontFamily: KineticTheme.typography.body, color: KineticTheme.colors.onSurfaceVariant, fontSize: 13 },
  iconBtn: { padding: 8 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { fontFamily: KineticTheme.typography.bodyMedium, color: KineticTheme.colors.onSurfaceVariant, fontSize: 16 },

  // Browse View
  browseSection: { paddingHorizontal: 24, marginTop: 20 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  coloredBar: { width: 6, height: 24, backgroundColor: KineticTheme.colors.primary, borderRadius: 3, marginRight: 10 },
  sectionTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 20, color: KineticTheme.colors.onSurface },

  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  genreCard: { width: '47%', height: 80, borderRadius: 16, overflow: 'hidden' },
  genreGradient: { width: '100%', height: '100%', justifyContent: 'flex-end', padding: 14 },
  genreName: { fontFamily: KineticTheme.typography.headline, fontSize: 16, color: '#fff' },

  trendingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: KineticTheme.colors.glassBorder, gap: 14 },
  trendingText: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 16, color: KineticTheme.colors.onSurface, flex: 1 },
});
