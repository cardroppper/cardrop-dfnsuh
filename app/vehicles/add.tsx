
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { useRouter } from 'expo-router';
import { VehicleFormData } from '@/types/vehicle';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/IconSymbol';
import { BeaconSelector } from '@/components/BeaconSelector';
import * as Network from 'expo-network';

export default function AddVehicleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedBeaconId, setSelectedBeaconId] = useState<string | null>(null);

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
          'Please grant camera roll permissions in your device settings to add images.\n\nGo to Settings > CarDrop > Photos and enable access.',
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
      console.error('[AddVehicle] Error picking image:', error);
      
      if (error.message?.includes('permission')) {
        Alert.alert(
          'Permission Denied',
          'Camera roll access was denied. Please enable it in your device settings to add images.',
          [{ text: 'OK' }]
        );
      } else if (error.message?.includes('cancelled')) {
        // User cancelled, no need to show error
        console.log('[AddVehicle] Image picker cancelled by user');
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
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'You must be logged in to add a vehicle. Please log in and try again.',
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
      console.error('[AddVehicle] Error checking network:', error);
    }

    try {
      setIsSubmitting(true);
      console.log('[AddVehicle] Creating vehicle for user:', user.id);

      const vehicleData = {
        user_id: user.id,
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
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) {
        console.error('[AddVehicle] Error creating vehicle:', error);
        
        // Provide specific error messages based on error type
        if (error.code === 'PGRST301' || error.message?.includes('Failed to fetch')) {
          Alert.alert(
            'Connection Error',
            'Unable to connect to the server. Please check your internet connection and try again.',
            [{ text: 'OK' }]
          );
        } else if (error.code === '23505' || error.message?.includes('duplicate')) {
          Alert.alert(
            'Duplicate Vehicle',
            'A vehicle with these details already exists in your garage.',
            [{ text: 'OK' }]
          );
        } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          Alert.alert(
            'Permission Denied',
            'You do not have permission to add vehicles. Please contact support if this issue persists.',
            [{ text: 'OK' }]
          );
        } else if (error.code === '23503' || error.message?.includes('foreign key')) {
          Alert.alert(
            'Account Error',
            'There was an issue with your account. Please try logging out and back in.',
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
            'Failed to Add Vehicle',
            `Unable to add vehicle to your garage.\n\nError: ${error.message}\n\nPlease try again or contact support if the problem persists.`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      console.log('[AddVehicle] Vehicle created successfully:', data.id);

      // If a beacon was selected, assign it to the vehicle
      if (selectedBeaconId) {
        console.log('[AddVehicle] Assigning beacon to vehicle:', selectedBeaconId);
        
        try {
          // Create vehicle_beacon entry
          const { error: beaconError } = await supabase
            .from('vehicle_beacons')
            .insert({
              vehicle_id: data.id,
              beacon_uuid: selectedBeaconId,
            });

          if (beaconError) {
            console.error('[AddVehicle] Error assigning beacon:', beaconError);
            
            // Provide specific beacon error messages
            if (beaconError.code === '23505') {
              Alert.alert(
                'Beacon Already Assigned',
                'This beacon is already assigned to another vehicle. Vehicle created successfully, but beacon was not assigned.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } else {
              Alert.alert(
                'Partial Success',
                'Vehicle created successfully, but beacon assignment failed. You can assign the beacon later from the vehicle details page.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            }
            return;
          }

          // Update registered_beacon to mark as assigned
          const { data: userData } = await supabase.auth.getUser();
          const { error: updateError } = await supabase
            .from('registered_beacons')
            .update({
              is_assigned: true,
              assigned_to_user_id: userData.user?.id,
              assigned_at: new Date().toISOString(),
            })
            .eq('beacon_uuid', selectedBeaconId);

          if (updateError) {
            console.error('[AddVehicle] Error updating beacon status:', updateError);
          }
        } catch (beaconErr: any) {
          console.error('[AddVehicle] Beacon assignment error:', beaconErr);
          
          if (beaconErr.message?.includes('network') || beaconErr.message?.includes('fetch')) {
            Alert.alert(
              'Partial Success',
              'Vehicle created successfully, but beacon assignment failed due to network issues. You can assign the beacon later.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          } else {
            Alert.alert(
              'Partial Success',
              'Vehicle created successfully, but beacon assignment encountered an error. You can assign the beacon later from the vehicle details page.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
          return;
        }
      }

      Alert.alert(
        'Vehicle Added Successfully!',
        `${formData.year} ${formData.manufacturer} ${formData.model} has been added to your garage${selectedBeaconId ? ' with beacon assigned' : ''}.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[AddVehicle] Unexpected error:', error);
      
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
          `An unexpected error occurred while adding your vehicle.\n\nError: ${error.message || 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text style={styles.sectionTitle}>Beacon Assignment</Text>
          <Text style={styles.sectionDescription}>
            Assign a CarDrop beacon to enable proximity detection and automatic check-ins at events.
          </Text>
          
          <BeaconSelector
            selectedBeaconId={selectedBeaconId}
            onBeaconSelected={setSelectedBeaconId}
          />
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
                <Text style={[buttonStyles.text, { marginLeft: 8 }]}>Adding Vehicle...</Text>
              </View>
            ) : (
              <Text style={buttonStyles.text}>Add to Garage</Text>
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
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
