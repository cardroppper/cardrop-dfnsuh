
import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface IconSymbolProps {
  ios_icon_name: string;
  android_material_icon_name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconSymbol({
  ios_icon_name,
  android_material_icon_name,
  size = 24,
  color = '#FFFFFF',
  style,
}: IconSymbolProps) {
  // On all platforms, use Material Icons for consistency
  // This ensures icons work correctly on Android and web
  const iconName = android_material_icon_name as keyof typeof MaterialIcons.glyphMap;
  
  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={color}
      style={style}
    />
  );
}
