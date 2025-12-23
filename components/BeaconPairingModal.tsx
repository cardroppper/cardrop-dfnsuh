
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

interface BeaconPairingModalProps {
  visible: boolean;
  beaconId: string;
  onPairWithNewCar: () => void;
  onPairWithExistingCar: () => void;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export function BeaconPairingModal({
  visible,
  beaconId,
  onPairWithNewCar,
  onPairWithExistingCar,
  onDismiss,
}: BeaconPairingModalProps) {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible, scaleAnim, pulseAnim]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const handlePairWithNewCar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleDismiss();
    setTimeout(() => onPairWithNewCar(), 300);
  };

  const handlePairWithExistingCar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleDismiss();
    setTimeout(() => onPairWithExistingCar(), 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.card}>
            {/* Beacon Icon with Pulse */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.iconBackground}>
                <IconSymbol
                  ios_icon_name="dot.radiowaves.left.and.right"
                  android_material_icon_name="bluetooth"
                  size={64}
                  color={colors.secondary}
                />
              </View>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>CarDrop Beacon Detected</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              A new CarDrop beacon is nearby and ready to pair with your vehicle.
            </Text>

            {/* Beacon ID */}
            <View style={styles.beaconIdContainer}>
              <Text style={styles.beaconIdLabel}>Beacon ID</Text>
              <Text style={styles.beaconId} numberOfLines={1}>
                {beaconId.substring(0, 8)}...
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.primaryButton]}
                onPress={handlePairWithNewCar}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={20}
                  color={colors.text}
                />
                <Text style={[buttonStyles.text, styles.buttonText]}>
                  Add New Car
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.outline, styles.outlineButton]}
                onPress={handlePairWithExistingCar}
              >
                <IconSymbol
                  ios_icon_name="car.2.fill"
                  android_material_icon_name="garage"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[buttonStyles.text, styles.buttonText, { color: colors.primary }]}>
                  Choose from Garage
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
              >
                <Text style={styles.dismissText}>Not Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.5)',
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  beaconIdContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  beaconIdLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  beaconId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
