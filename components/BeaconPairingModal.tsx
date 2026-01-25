
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';

interface BeaconPairingModalProps {
  visible: boolean;
  beaconId: string;
  onPairWithNewCar: () => void;
  onPairWithExistingCar: () => void;
  onDismiss: () => void;
}

export function BeaconPairingModal({
  visible,
  beaconId,
  onPairWithNewCar,
  onPairWithExistingCar,
  onDismiss,
}: BeaconPairingModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidOverlay]} />
        )}
        
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="antenna.radiowaves.left.and.right"
                android_material_icon_name="bluetooth"
                size={48}
                color={colors.primary}
              />
            </View>

            <Text style={styles.title}>New Beacon Detected</Text>
            <Text style={styles.message}>
              We detected a CarDrop beacon nearby. Would you like to pair it with a vehicle?
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.button]}
                onPress={onPairWithNewCar}
              >
                <Text style={buttonStyles.text}>Pair with New Car</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.outline, styles.button]}
                onPress={onPairWithExistingCar}
              >
                <Text style={buttonStyles.outlineText}>Pair with Existing Car</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dismissButton}
                onPress={onDismiss}
              >
                <Text style={styles.dismissText}>Not Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    width: '85%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
