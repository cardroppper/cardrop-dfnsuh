
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { usePathname, router } from 'expo-router';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
}

export default function FloatingTabBar({ tabs }: FloatingTabBarProps) {
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
          >
            <IconSymbol
              ios_icon_name={tab.icon as any}
              android_material_icon_name={tab.icon as any}
              size={24}
              color={isActive(tab.route) ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.5)',
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
