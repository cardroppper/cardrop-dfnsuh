
import React from 'react';
import { Image, useColorScheme, StyleSheet, ImageStyle } from 'react-native';

interface LogoProps {
  size?: number;
  style?: ImageStyle;
}

export function Logo({ size = 120, style }: LogoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Image
      source={isDark 
        ? require('@/assets/images/d8bffe89-911e-4284-81e6-c7ce7f30e2f1.png')
        : require('@/assets/images/b16424a9-d158-4fc0-981f-96aa7d69f136.png')
      }
      style={[styles.logo, { width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
