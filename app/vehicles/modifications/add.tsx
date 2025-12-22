
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ModificationFormData, MODIFICATION_CATEGORIES, ModificationCategory } from '@/types/vehicle';

export default function AddModificationScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ModificationFormData>({
    category: 'Engine',
    brand_name: '',
    part_name: '',
    description: '',
  });

  const updateField = (field: keyof ModificationFormData, value: string | ModificationCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !vehicleId) {
      Alert.alert('Error', 'Invalid request');
      return;
    }

    if (!formData.brand_name.trim() && !formData.part_name.trim()) {
      Alert.alert('Missing Information', 'Please provide at least a brand name or part name');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('[AddModification] Creating modification for vehicle:', vehicleId);

      const modData = {
        vehicle_id: vehicleId,
        category: formData.category,
        brand_name: formData.brand_name.trim() || null,
        part_name: formData.part_name.trim() || null,
        description: formData.description.trim() || null,
      };

      const { error } = await supabase
        .from('vehicle_modifications')
        .insert(modData);

      if (error) {
        console.error('[AddModification] Error creating modification:', error);
        throw error;
      }

      console.log('[AddModification] Modification created successfully');
      Alert.alert('Success', 'Modification added!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[AddModification] Error:', error);
      Alert.alert('Error', 'Failed to add modification. Please try again.');
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
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {MODIFICATION_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive,
                ]}
                onPress={() => updateField('category', category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.category === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Brand Name</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.brand_name}
            onChangeText={(text) => updateField('brand_name', text)}
            placeholder="e.g., Garrett, KW, Brembo"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Part Name</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.part_name}
            onChangeText={(text) => updateField('part_name', text)}
            placeholder="e.g., GTX3076R Turbo, V3 Coilovers"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[commonStyles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Additional details about this modification..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
              <Text style={buttonStyles.text}>Add Modification</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.card,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
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
});
