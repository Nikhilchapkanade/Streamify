import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { KineticTheme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniPlayer } from '@/components/MiniPlayer';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: KineticTheme.colors.primary,
          tabBarInactiveTintColor: KineticTheme.colors.onSurfaceVariant,
          tabBarLabelStyle: {
            fontFamily: KineticTheme.typography.headline,
            fontSize: 9,
            letterSpacing: 1,
            textTransform: 'uppercase',
          },
          tabBarStyle: {
            backgroundColor: 'rgba(14, 14, 14, 0.97)',
            borderTopColor: KineticTheme.colors.glassBorder,
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 8,
            position: 'absolute',
            elevation: 0,
          },
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconBg : undefined}>
                <MaterialIcons name="home-filled" size={26} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconBg : undefined}>
                <MaterialIcons name="search" size={26} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? styles.activeIconBg : undefined}>
                <MaterialIcons name="library-music" size={26} color={color} />
              </View>
            ),
          }}
        />
        {/* Player screen hidden from tab bar, accessed via MiniPlayer */}
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Floating MiniPlayer above tab bar */}
      <View style={[styles.miniPlayerWrapper, { bottom: tabBarHeight + 4 }]} pointerEvents="box-none">
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeIconBg: {
    backgroundColor: `${KineticTheme.colors.primary}33`,
    padding: 6,
    borderRadius: 14,
  },
  miniPlayerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 999,
  },
});
