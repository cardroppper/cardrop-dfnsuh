
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function VehicleCardSkeleton() {
  return (
    <View style={styles.vehicleCard}>
      <SkeletonLoader height={220} borderRadius={0} />
      <View style={styles.vehicleInfo}>
        <SkeletonLoader width="70%" height={24} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="50%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function ClubCardSkeleton() {
  return (
    <View style={styles.clubCard}>
      <SkeletonLoader width="100%" height={120} borderRadius={0} />
      <View style={styles.clubInfo}>
        <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="80%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={14} />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <SkeletonLoader width={50} height={50} borderRadius={25} />
      <View style={styles.listItemContent}>
        <SkeletonLoader width="60%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.highlight,
  },
  vehicleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  vehicleInfo: {
    padding: 16,
  },
  clubCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  clubInfo: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 16,
  },
});
