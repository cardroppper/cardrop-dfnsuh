
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useEventGallery } from '@/hooks/useEventGallery';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

interface EventGalleryProps {
  eventId: string;
  eventName: string;
}

export function EventGallery({ eventId, eventName }: EventGalleryProps) {
  const { galleryItems, loading, uploadToGallery, deleteGalleryItem } = useEventGallery(eventId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [caption, setCaption] = useState('');

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setShowUploadModal(true);
        setUploading(true);
        // TODO: Backend Integration - Upload media to storage and get URL
        const mediaUrl = result.assets[0].uri;
        const mediaType = result.assets[0].type === 'video' ? 'video' : 'image';
        await uploadToGallery(mediaUrl, mediaType, caption);
        setCaption('');
        setShowUploadModal(false);
        Alert.alert('Success', 'Photo uploaded to gallery');
      }
    } catch (error) {
      console.error('Error uploading to gallery:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo from the gallery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGalleryItem(itemId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const renderGalleryItem = ({ item }: { item: typeof galleryItems[0] }) => (
    <TouchableOpacity
      style={styles.galleryItem}
      onPress={() => setSelectedImage(item.media_url)}
      onLongPress={() => handleDeleteItem(item.id)}
    >
      <Image source={{ uri: item.media_url }} style={styles.galleryImage} />
      {item.caption && (
        <View style={styles.captionOverlay}>
          <Text style={styles.captionText} numberOfLines={2}>
            {item.caption}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{eventName} Gallery</Text>
        <TouchableOpacity style={buttonStyles.primary} onPress={handlePickImage} disabled={uploading}>
          <IconSymbol
            ios_icon_name="camera.fill"
            android_material_icon_name="add-a-photo"
            size={20}
            color="#FFFFFF"
          />
          <Text style={buttonStyles.primaryText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {galleryItems.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol
            ios_icon_name="photo"
            android_material_icon_name="photo-library"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyStateText}>No photos yet</Text>
          <Text style={styles.emptyStateSubtext}>Be the first to upload a photo from this meet!</Text>
        </View>
      ) : (
        <FlatList
          data={galleryItems}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.galleryList}
        />
      )}

      {/* Full Screen Image Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <IconSymbol
              ios_icon_name="xmark"
              android_material_icon_name="close"
              size={30}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Upload Modal */}
      <Modal visible={showUploadModal} transparent animationType="slide">
        <View style={styles.uploadModalContainer}>
          <View style={styles.uploadModalContent}>
            <Text style={styles.uploadModalTitle}>Add Caption (Optional)</Text>
            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor={colors.textSecondary}
              maxLength={500}
              multiline
            />
            {uploading && <ActivityIndicator size="large" color={colors.primary} />}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  galleryList: {
    padding: 4,
  },
  galleryItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  uploadModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  uploadModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  uploadModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  captionInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
