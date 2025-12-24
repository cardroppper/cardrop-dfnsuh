
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import * as ImagePicker from 'expo-image-picker';

interface TimelineEntry {
  id: string;
  title: string;
  description: string | null;
  entry_date: string;
  media_type: 'image' | 'video';
  image_url: string | null;
  video_url: string | null;
  created_at: string;
}

export default function VehicleTimelineScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const router = useRouter();
  
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
    media_type: 'image' as 'image' | 'video',
    image_url: null as string | null,
    video_url: null as string | null,
  });

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicle_timeline')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error fetching timeline:', error);
        return;
      }

      setEntries(data || []);
    } catch (err) {
      console.error('Error in fetchEntries:', err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveEntry = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    // Check if user is trying to upload video without premium
    if (formData.media_type === 'video' && !subscription.isPremium) {
      Alert.alert(
        'Premium Feature',
        'Video uploads are a premium feature. Upgrade to premium to unlock video timeline entries.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('vehicle_timeline')
          .update({
            title: formData.title,
            description: formData.description || null,
            entry_date: formData.entry_date,
            media_type: formData.media_type,
            image_url: formData.image_url,
            video_url: formData.video_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vehicle_timeline')
          .insert({
            vehicle_id: vehicleId,
            title: formData.title,
            description: formData.description || null,
            entry_date: formData.entry_date,
            media_type: formData.media_type,
            image_url: formData.image_url,
            video_url: formData.video_url,
          });

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingEntry(null);
      setFormData({
        title: '',
        description: '',
        entry_date: new Date().toISOString().split('T')[0],
        media_type: 'image',
        image_url: null,
        video_url: null,
      });
      fetchEntries();
      Alert.alert('Success', editingEntry ? 'Entry updated' : 'Entry added');
    } catch (err) {
      console.error('Error saving entry:', err);
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const handleDeleteEntry = (entry: TimelineEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this timeline entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('vehicle_timeline')
                .delete()
                .eq('id', entry.id);

              if (error) throw error;
              fetchEntries();
              Alert.alert('Success', 'Entry deleted');
            } catch (err) {
              console.error('Error deleting entry:', err);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const handleEditEntry = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      description: entry.description || '',
      entry_date: entry.entry_date,
      media_type: entry.media_type,
      image_url: entry.image_url,
      video_url: entry.video_url,
    });
    setShowAddModal(true);
  };

  const pickMedia = async (type: 'image' | 'video') => {
    if (type === 'video' && !subscription.isPremium) {
      Alert.alert(
        'Premium Feature',
        'Video uploads are a premium feature. Upgrade to premium to unlock video timeline entries.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' 
        ? ImagePicker.MediaTypeOptions.Videos 
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Upload to Supabase Storage
      if (type === 'video') {
        setFormData({ ...formData, media_type: 'video', video_url: result.assets[0].uri, image_url: null });
      } else {
        setFormData({ ...formData, media_type: 'image', image_url: result.assets[0].uri, video_url: null });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Timeline</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add-circle"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={commonStyles.textSecondary}>Loading...</Text>
        ) : entries.length === 0 ? (
          <View style={commonStyles.emptyState}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={64}
              color={colors.textSecondary}
              style={{ opacity: 0.5 }}
            />
            <Text style={commonStyles.emptyStateText}>No timeline entries yet</Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
              Document your vehicle&apos;s journey with timeline entries
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {entries.map((entry, index) => (
              <View key={entry.id} style={styles.entryContainer}>
                <View style={styles.timelineLine}>
                  <View style={styles.timelineDot} />
                  {index < entries.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                
                <View style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{formatDate(entry.entry_date)}</Text>
                    <View style={styles.entryActions}>
                      <TouchableOpacity onPress={() => handleEditEntry(entry)}>
                        <IconSymbol
                          ios_icon_name="pencil"
                          android_material_icon_name="edit"
                          size={20}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteEntry(entry)}>
                        <IconSymbol
                          ios_icon_name="trash"
                          android_material_icon_name="delete"
                          size={20}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  
                  {entry.description && (
                    <Text style={styles.entryDescription}>{entry.description}</Text>
                  )}
                  
                  {entry.media_type === 'image' && entry.image_url && (
                    <Image
                      source={{ uri: entry.image_url }}
                      style={styles.entryImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  {entry.media_type === 'video' && entry.video_url && (
                    <View style={styles.videoPlaceholder}>
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play-circle"
                        size={48}
                        color={colors.primary}
                      />
                      <Text style={styles.videoPlaceholderText}>Video</Text>
                      {subscription.isPremium && (
                        <View style={styles.premiumBadge}>
                          <IconSymbol
                            ios_icon_name="crown.fill"
                            android_material_icon_name="workspace-premium"
                            size={12}
                            color="#FFD700"
                          />
                          <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingEntry(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEntry ? 'Edit Entry' : 'Add Timeline Entry'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingEntry(null);
                }}
              >
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="e.g., First Track Day"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Date</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.entry_date}
                onChangeText={(text) => setFormData({ ...formData, entry_date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[commonStyles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe what happened..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Media Type</Text>
              <View style={styles.mediaTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.mediaTypeButton,
                    formData.media_type === 'image' && styles.mediaTypeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, media_type: 'image' })}
                >
                  <IconSymbol
                    ios_icon_name="photo"
                    android_material_icon_name="image"
                    size={24}
                    color={formData.media_type === 'image' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.mediaTypeButtonText,
                    formData.media_type === 'image' && styles.mediaTypeButtonTextActive,
                  ]}>
                    Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mediaTypeButton,
                    formData.media_type === 'video' && styles.mediaTypeButtonActive,
                    !subscription.isPremium && styles.mediaTypeButtonDisabled,
                  ]}
                  onPress={() => {
                    if (subscription.isPremium) {
                      setFormData({ ...formData, media_type: 'video' });
                    } else {
                      Alert.alert(
                        'Premium Feature',
                        'Video uploads are a premium feature. Upgrade to premium to unlock video timeline entries.',
                        [{ text: 'OK' }]
                      );
                    }
                  }}
                >
                  <IconSymbol
                    ios_icon_name="video.fill"
                    android_material_icon_name="videocam"
                    size={24}
                    color={formData.media_type === 'video' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.mediaTypeButtonText,
                    formData.media_type === 'video' && styles.mediaTypeButtonTextActive,
                  ]}>
                    Video
                  </Text>
                  {!subscription.isPremium && (
                    <View style={styles.premiumLockBadge}>
                      <IconSymbol
                        ios_icon_name="lock.fill"
                        android_material_icon_name="lock"
                        size={12}
                        color={colors.warning}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>
                {formData.media_type === 'video' ? 'Video' : 'Photo'} (Optional)
              </Text>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={() => pickMedia(formData.media_type)}
              >
                {(formData.image_url || formData.video_url) ? (
                  formData.media_type === 'image' ? (
                    <Image source={{ uri: formData.image_url! }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.videoPreview}>
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play-circle"
                        size={48}
                        color={colors.primary}
                      />
                      <Text style={styles.videoPreviewText}>Video Selected</Text>
                    </View>
                  )
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <IconSymbol
                      ios_icon_name={formData.media_type === 'video' ? 'video.fill' : 'photo'}
                      android_material_icon_name={formData.media_type === 'video' ? 'videocam' : 'add-photo-alternate'}
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.imagePickerText}>
                      Tap to add {formData.media_type === 'video' ? 'video' : 'photo'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.primary, { marginTop: 24, marginBottom: 16 }]}
                onPress={handleSaveEntry}
              >
                <Text style={buttonStyles.text}>
                  {editingEntry ? 'Update Entry' : 'Add Entry'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={buttonStyles.outline}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingEntry(null);
                }}
              >
                <Text style={buttonStyles.text}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.highlight,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  timeline: {
    paddingBottom: 40,
  },
  entryContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLine: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    zIndex: 1,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.highlight,
    marginTop: 4,
  },
  entryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  entryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  entryImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.highlight,
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mediaTypeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  mediaTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  mediaTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  mediaTypeButtonDisabled: {
    opacity: 0.6,
  },
  mediaTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  mediaTypeButtonTextActive: {
    color: colors.primary,
  },
  premiumLockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.background,
    padding: 4,
    borderRadius: 8,
  },
  imagePickerButton: {
    marginBottom: 24,
  },
  imagePickerPlaceholder: {
    height: 200,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.highlight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.highlight,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
});
