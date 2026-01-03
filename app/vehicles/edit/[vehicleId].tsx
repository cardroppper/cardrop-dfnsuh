
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VehicleFormData } from '@/types/vehicle';
import { useVehicleDetails } from '@/hooks/useVehicles';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import * as Network from 'expo-network';

export default function EditVehicleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { vehicle, isLoading: isLoadingVehicle, error: vehicleError } = useVehicleDetails(vehicleId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [formData, setFormData] = useState<VehicleFormData>({
    manufacturer: '',
    model: '',
    year: '',
    body_style: '',
    fuel_type: '',
    drivetrain: '',
    engine_configuration: '',
    induction_type: '',
    transmission_type: '',
    power_output: '',
    torque_output: '',
    is_public: true,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        manufacturer: vehicle.manufacturer,
        model: vehicle.model,
        year: vehicle.year.toString(),
        body_style: vehicle.body_style || '',
        fuel_type: vehicle.fuel_type || '',
        drivetrain: vehicle.drivetrain || '',
        engine_configuration: vehicle.engine_configuration || '',
        induction_type: vehicle.induction_type || '',
        transmission_type: vehicle.transmission_type || '',
        power_output: vehicle.power_output || '',
        torque_output: vehicle.torque_output || '',
        is_public: vehicle.is_public,
      });
      setImageUri(vehicle.primary_image_url);
    }
  }, [vehicle]);

  const updateField = (field: keyof VehicleFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      setIsPickingImage(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions in your device settings to change images.\n\nGo to Settings > CarDrop > Photos and enable access.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('[EditVehicle] Error picking image:', error);
      
      if (error.message?.includes('permission')) {
        Alert.alert(
          'Permission Denied',
          'Camera roll access was denied. Please enable it in your device settings to change images.',
          [{ text: 'OK' }]
        );
      } else if (error.message?.includes('cancelled')) {
        // User cancelled, no need to show error
        console.log('[EditVehicle] Image picker cancelled by user');
      } else {
        Alert.alert(
          'Image Selection Failed',
          'Unable to select image. Please try again or choose a different image.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!user || !vehicleId) {
      Alert.alert(
        'Invalid Request',
        'Unable to update vehicle. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!formData.manufacturer.trim() || !formData.model.trim() || !formData.year.trim()) {
      Alert.alert(
        'Missing Required Information',
        'Please fill in all required fields:\n\n• Manufacturer\n• Model\n• Year',
        [{ text: 'OK' }]
      );
      return;
    }

    const yearNum = parseInt(formData.year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      Alert.alert(
        'Invalid Year',
        'Please enter a valid year between 1900 and 2100.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check network connectivity
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.\n\nMake sure you are connected to WiFi or have cellular data enabled.',
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error) {
      console.error('[EditVehicle] Error checking network:', error);
    }

    try {
      setIsSubmitting(true);
      console.log('[EditVehicle] Updating vehicle:', vehicleId);

      const vehicleData = {
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        year: yearNum,
        body_style: formData.body_style.trim() || null,
        fuel_type: formData.fuel_type.trim() || null,
        drivetrain: formData.drivetrain.trim() || null,
        engine_configuration: formData.engine_configuration.trim() || null,
        induction_type: formData.induction_type.trim() || null,
        transmission_type: formData.transmission_type.trim() || null,
        power_output: formData.power_output.trim() || null,
        torque_output: formData.torque_output.trim() || null,
        primary_image_url: imageUri,
        is_public: formData.is_public,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', vehicleId);

      if (error) {
        console.error('[EditVehicle] Error updating vehicle:', error);
        
        // Provide specific error messages based on error type
        if (error.code === 'PGRST301' || error.message?.includes('Failed to fetch')) {
          Alert.alert(
            'Connection Error',
            'Unable to connect to the server. Please check your internet connection and try again.',
            [{ text: 'OK' }]
          );
        } else if (error.code === 'PGRST116') {
          Alert.alert(
            'Vehicle Not Found',
            'This vehicle no longer exists or you do not have access to it. It may have been deleted.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          Alert.alert(
            'Permission Denied',
            'You do not have permission to edit this vehicle. Only the vehicle owner can make changes.',
            [{ text: 'OK' }]
          );
        } else if (error.code === '23505' || error.message?.includes('duplicate')) {
          Alert.alert(
            'Duplicate Vehicle',
            'A vehicle with these details already exists in your garage.',
            [{ text: 'OK' }]
          );
        } else if (error.message?.includes('timeout')) {
          Alert.alert(
            'Request Timeout',
            'The request took too long. Please check your connection and try again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Failed to Update Vehicle',
            `Unable to save changes to your vehicle.\n\nError: ${error.message}\n\nPlease try again or contact support if the problem persists.`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      console.log('[EditVehicle] Vehicle updated successfully');
      Alert.alert(
        'Changes Saved!',
        `${formData.year} ${formData.manufacturer} ${formData.model} has been updated successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[EditVehicle] Unexpected error:', error);
      
      // Check for network errors
      if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection and try again.\n\nMake sure you have a stable internet connection.',
          [{ text: 'OK' }]
        );
      } else if (error.message?.includes('timeout')) {
        Alert.alert(
          'Request Timeout',
          'The request took too long to complete. Please try again with a better internet connection.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Unexpected Error',
          `An unexpected error occurred while updating your vehicle.\n\nError: ${error.message || 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVehicle) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicle details...</Text>
      </View>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle"
          android_material_icon_name="error"
          size={48}
          color={colors.accent}
        />
        <Text style={styles.errorText}>
          {vehicleError ? 'Failed to load vehicle' : 'Vehicle not found'}
        </Text>
        <Text style={styles.errorSubtext}>
          {vehicleError 
            ? 'Unable to load vehicle details. Please check your connection and try again.' 
            : 'This vehicle may have been deleted or you do not have access to it.'}
        </Text>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 16 }]}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.text}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if user owns this vehicle
  if (vehicle.user_id !== user?.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <IconSymbol
          ios_icon_name="lock.fill"
          android_material_icon_name="lock"
          size={48}
          color={colors.accent}
        />
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubtext}>
          You do not have permission to edit this vehicle. Only the owner can make changes.
        </Text>
        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 16 }]}
          onPress={() => router.back()}
        >
          <Text style={buttonStyles.text}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Identity</Text>
          
          <Text style={styles.label}>Manufacturer *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.manufacturer}
            onChangeText={(text) => updateField('manufacturer', text)}
            placeholder="e.g., Toyota, BMW, Ford"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.model}
            onChangeText={(text) => updateField('model', text)}
            placeholder="e.g., Supra, M3, Mustang"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Year *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.year}
            onChangeText={(text) => updateField('year', text)}
            placeholder="e.g., 2023"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Body Style</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.body_style}
            onChangeText={(text) => updateField('body_style', text)}
            placeholder="e.g., Coupe, Sedan, SUV"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Fuel Type</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.fuel_type}
            onChangeText={(text) => updateField('fuel_type', text)}
            placeholder="e.g., Petrol, Diesel, Electric"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Drivetrain</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.drivetrain}
            onChangeText={(text) => updateField('drivetrain', text)}
            placeholder="e.g., RWD, AWD, FWD"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mechanical Specifications</Text>

          <Text style={styles.label}>Engine Configuration</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.engine_configuration}
            onChangeText={(text) => updateField('engine_configuration', text)}
            placeholder="e.g., 3.0L Inline-6, 5.0L V8"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Induction Type</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.induction_type}
            onChangeText={(text) => updateField('induction_type', text)}
            placeholder="e.g., Twin-Turbo, Supercharged, NA"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Transmission</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.transmission_type}
            onChangeText={(text) => updateField('transmission_type', text)}
            placeholder="e.g., 6-Speed Manual, 8-Speed Auto"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Power Output</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.power_output}
            onChangeText={(text) => updateField('power_output', text)}
            placeholder="e.g., 382 hp @ 5800 rpm"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Torque Output</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.torque_output}
            onChangeText={(text) => updateField('torque_output', text)}
            placeholder="e.g., 368 lb-ft @ 1800 rpm"
            placeholderTextColor={colors.textSecondary}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          
          <TouchableOpacity 
            style={[styles.imagePickerButton, (isSubmitting || isPickingImage) && styles.buttonDisabled]} 
            onPress={pickImage}
            disabled={isSubmitting || isPickingImage}
          >
            {isPickingImage ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="photo.fill"
                  android_material_icon_name="photo"
                  size={24}
                  color={(isSubmitting || isPickingImage) ? colors.textSecondary : colors.primary}
                />
                <Text style={[
                  styles.imagePickerText,
                  (isSubmitting || isPickingImage) && { color: colors.textSecondary }
                ]}>
                  {imageUri ? 'Change Primary Image' : 'Add Primary Image'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {imageUri && (
            <Text style={styles.imageSelectedText}>✓ Image selected</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>Public Vehicle</Text>
              <Text style={styles.switchDescription}>
                {formData.is_public 
                  ? 'Visible in Discover, Nearby, Clubs, and Events'
                  : 'Hidden from all public feeds'}
              </Text>
            </View>
            <Switch
              value={formData.is_public}
              onValueChange={(value) => updateField('is_public', value)}
              trackColor={{ false: colors.highlight, true: colors.primary }}
              thumbColor={colors.text}
              disabled={isSubmitting}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[buttonStyles.primary, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.text} />
                <Text style={[buttonStyles.text, { marginLeft: 8 }]}>Saving Changes...</Text>
              </View>
            ) : (
              <Text style={buttonStyles.text}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={[buttonStyles.text, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  imageSelectedText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
