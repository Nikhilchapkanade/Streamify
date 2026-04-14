import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { KineticTheme } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { likedSongs, playlists, recentlyPlayed } = usePlayer();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={28} color={KineticTheme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <MaterialIcons name="settings" size={24} color={KineticTheme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Nikhil' }} 
              style={styles.avatar} 
            />
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Sign in to sync data'}</Text>
          
          <TouchableOpacity style={styles.editBtn}>
             <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{playlists.length}</Text>
            <Text style={styles.statLabel}>Playlists</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{likedSongs.length}</Text>
            <Text style={styles.statLabel}>Liked Songs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{recentlyPlayed.length}</Text>
            <Text style={styles.statLabel}>History</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <MaterialIcons name="person-outline" size={24} color={KineticTheme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Personal Information</Text>
            <MaterialIcons name="chevron-right" size={24} color={KineticTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <MaterialIcons name="security" size={24} color={KineticTheme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Password & Security</Text>
            <MaterialIcons name="chevron-right" size={24} color={KineticTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <MaterialIcons name="equalizer" size={24} color={KineticTheme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Audio Quality</Text>
            <Text style={styles.menuSubtext}>High</Text>
            <MaterialIcons name="chevron-right" size={24} color={KineticTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <MaterialIcons name="offline-bolt" size={24} color={KineticTheme.colors.primary} />
            </View>
            <Text style={styles.menuText}>Offline Mode</Text>
            <MaterialIcons name="chevron-right" size={24} color={KineticTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { marginBottom: 60 }]}>
           <TouchableOpacity 
             style={[styles.menuItem, { borderBottomWidth: 0 }]}
             onPress={async () => {
               await logout();
               router.replace('/(auth)/login' as any);
             }}
           >
             <MaterialIcons name="logout" size={24} color="#FF6B6B" style={{ marginRight: 16 }} />
             <Text style={[styles.menuText, { color: '#FF6B6B' }]}>Log Out</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: KineticTheme.colors.surface },
  scrollContent: { paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerTitle: { fontFamily: KineticTheme.typography.headline, fontSize: 20, color: KineticTheme.colors.onSurface },
  settingsBtn: { padding: 8 },

  profileCard: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: KineticTheme.colors.primary, overflow: 'hidden', marginBottom: 16 },
  avatar: { width: '100%', height: '100%' },
  userName: { fontFamily: KineticTheme.typography.headline, fontSize: 28, color: KineticTheme.colors.onSurface, marginBottom: 4 },
  userEmail: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 14, color: KineticTheme.colors.onSurfaceVariant, marginBottom: 20 },
  editBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: KineticTheme.colors.primary },
  editBtnText: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 14, color: KineticTheme.colors.primary },

  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: KineticTheme.colors.surfaceHighest, marginHorizontal: 24, paddingVertical: 20, borderRadius: 24, marginBottom: 40 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontFamily: KineticTheme.typography.headline, fontSize: 24, color: KineticTheme.colors.onSurface, marginBottom: 4 },
  statLabel: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 13, color: KineticTheme.colors.onSurfaceVariant },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },

  section: { paddingHorizontal: 24, marginBottom: 30 },
  sectionTitle: { fontFamily: KineticTheme.typography.bodyBold, fontSize: 16, color: KineticTheme.colors.onSurface, marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: KineticTheme.colors.glassBorder },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(142, 255, 113, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontFamily: KineticTheme.typography.bodyBold, fontSize: 16, color: KineticTheme.colors.onSurface },
  menuSubtext: { fontFamily: KineticTheme.typography.bodyMedium, fontSize: 14, color: KineticTheme.colors.onSurfaceVariant, marginRight: 10 },
});
