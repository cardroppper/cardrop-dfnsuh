
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

export default function EditVehicleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { vehicle, isLoading: isLoadingVehicle } = useVehicleDetails(vehicleId);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to add images.');
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
  };

  const handleSubmit = async () => {
    if (!user || !vehicleId) {
      Alert.alert('Error', 'Invalid request');
      return;
    }

    if (!formData.manufacturer.trim() || !formData.model.trim() || !formData.year.trim()) {
      Alert.alert('Missing Information', 'Please fill in manufacturer, model, and year');
      return;
    }

    const yearNum = parseInt(formData.year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      Alert.alert('Invalid Year', 'Please enter a valid year between 1900 and 2100');
      return;
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
        throw error;
      }

      console.log('[EditVehicle] Vehicle updated successfully');
      Alert.alert('Success', 'Vehicle updated!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[EditVehicle] Error:', error);
      Alert.alert('Error', 'Failed to update vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVehicle) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Vehicle not found</Text>
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
          />

          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.model}
            onChangeText={(text) => updateField('model', text)}
            placeholder="e.g., Supra, M3, Mustang"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Year *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.year}
            onChangeText={(text) => updateField('year', text)}
            placeholder="e.g., 2023"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Body Style</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.body_style}
            onChangeText={(text) => updateField('body_style', text)}
            placeholder="e.g., Coupe, Sedan, SUV"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Fuel Type</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.fuel_type}
            onChangeText={(text) => updateField('fuel_type', text)}
            placeholder="e.g., Petrol, Diesel, Electric"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Drivetrain</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.drivetrain}
            onChangeText={(text) => updateField('drivetrain', text)}
            placeholder="e.g., RWD, AWD, FWD"
            placeholderTextColor={colors.textSecondary}
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
          />

          <Text style={styles.label}>Induction Type</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.induction_type}
            onChangeText={(text) => updateField('induction_type', text)}
            placeholder="e.g., Twin-Turbo, Supercharged, NA"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Transmission</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.transmission_type}
            onChangeText={(text) => updateField('transmission_type', text)}
            placeholder="e.g., 6-Speed Manual, 8-Speed Auto"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Power Output</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.power_output}
            onChangeText={(text) => updateField('power_output', text)}
            placeholder="e.g., 382 hp @ 5800 rpm"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Torque Output</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.torque_output}
            onChangeText={(text) => updateField('torque_output', text)}
            placeholder="e.g., 368 lb-ft @ 1800 rpm"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <IconSymbol
              ios_icon_name="photo.fill"
              android_material_icon_name="photo"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.imagePickerText}>
              {imageUri ? 'Change Primary Image' : 'Add Primary Image'}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <Text style={styles.imageSelectedText}>Image selected</Text>
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
              <ActivityIndicator color={colors.text} />
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
    fontSize: 16,
    color: colors.accent,
    textAlign: 'center',
  },
});
