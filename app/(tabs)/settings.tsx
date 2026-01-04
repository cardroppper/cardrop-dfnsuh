
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useCallback } from 'react';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';

type NotificationType = 'all' | 'mentions' | 'none';
type SoundType = 'default' | 'silent';

export default function SettingsScreen() {
  const { isPremium, isLoading: subscriptionLoading } = useStripeSubscription();
  const { user, profile, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile fields
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  
  // Notification preferences
  const [notificationType, setNotificationType] = useState<NotificationType>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  }, [logout]);

  const handleSaveProfile = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl || null,
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [displayName, bio, location, avatarUrl, updateProfile]);

  const handleSaveNotificationPrefs = useCallback(async () => {
    // TODO: Backend Integration - Save notification preferences to backend
    console.log('Saving notification preferences:', {
      notificationType,
      soundEnabled,
      vibrationEnabled,
    });
    Alert.alert('Success', 'Notification preferences saved');
  }, [notificationType, soundEnabled, vibrationEnabled]);

  const handleCancelEdit = useCallback(() => {
    setDisplayName(profile?.display_name || '');
    setBio(profile?.bio || '');
    setLocation(profile?.location || '');
    setAvatarUrl(profile?.avatar_url || '');
    setIsEditing(false);
  }, [profile]);

  const handleManageSubscription = useCallback(() => {
    router.push('/subscription/premium');
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Backend Integration - Upload image to storage and get URL
      console.log('Image selected:', result.assets[0].uri);
      setAvatarUrl(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      {/* Premium Status Card */}
      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <IconSymbol
            ios_icon_name={isPremium ? 'star.fill' : 'star'}
            android_material_icon_name={isPremium ? 'star' : 'star-border'}
            size={24}
            color={isPremium ? colors.primary : colors.text}
          />
          <Text style={styles.premiumTitle}>
            {isPremium ? 'Premium Member' : 'Free Account'}
          </Text>
        </View>
        {isPremium ? (
          <Text style={[commonStyles.text, styles.premiumDescription]}>
            You have access to all premium features
          </Text>
        ) : (
          <Text style={[commonStyles.text, styles.premiumDescription]}>
            Upgrade to unlock unlimited vehicles, photos, and more
          </Text>
        )}
        <TouchableOpacity
          style={[buttonStyles.primary, styles.premiumButton]}
          onPress={handleManageSubscription}
          disabled={subscriptionLoading}
        >
          {subscriptionLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={buttonStyles.primaryText}>
              {isPremium ? 'Manage Subscription' : 'Go Premium'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <IconSymbol ios_icon_name="pencil" android_material_icon_name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <>
            <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
              {avatarUrl ? (
                <View style={styles.avatarPreview}>
                  <Text style={commonStyles.text}>Avatar Selected</Text>
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <IconSymbol ios_icon_name="camera" android_material_icon_name="camera" size={32} color={colors.text} />
                  <Text style={[commonStyles.text, styles.avatarText]}>Change Avatar</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name *</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter display name"
                placeholderTextColor={colors.text + '60'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[commonStyles.input, styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.text + '60'}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={[commonStyles.input, styles.input]}
                value={location}
                onChangeText={setLocation}
                placeholder="City, State"
                placeholderTextColor={colors.text + '60'}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[buttonStyles.secondary, styles.halfButton]}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text style={buttonStyles.secondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.halfButton]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={buttonStyles.primaryText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Display Name</Text>
            <Text style={[commonStyles.text, styles.profileValue]}>{profile?.display_name || 'Not set'}</Text>
            
            <Text style={styles.profileLabel}>Username</Text>
            <Text style={[commonStyles.text, styles.profileValue]}>@{profile?.username || 'Not set'}</Text>
            
            <Text style={styles.profileLabel}>Bio</Text>
            <Text style={[commonStyles.text, styles.profileValue]}>{profile?.bio || 'No bio yet'}</Text>
            
            <Text style={styles.profileLabel}>Location</Text>
            <Text style={[commonStyles.text, styles.profileValue]}>{profile?.location || 'Not set'}</Text>
          </View>
        )}
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Text style={[commonStyles.text, styles.settingDescription]}>Play sound for notifications</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: colors.text + '30', true: colors.primary + '60' }}
            thumbColor={soundEnabled ? colors.primary : colors.text}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Text style={[commonStyles.text, styles.settingDescription]}>Vibrate for notifications</Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            trackColor={{ false: colors.text + '30', true: colors.primary + '60' }}
            thumbColor={vibrationEnabled ? colors.primary : colors.text}
          />
        </View>

        <TouchableOpacity
          style={[buttonStyles.primary, styles.saveButton]}
          onPress={handleSaveNotificationPrefs}
        >
          <Text style={buttonStyles.primaryText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/legal/privacy')}>
          <IconSymbol ios_icon_name="lock.shield" android_material_icon_name="privacy-tip" size={20} color={colors.text} />
          <Text style={[commonStyles.text, styles.menuText]}>Privacy Policy</Text>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/legal/terms')}>
          <IconSymbol ios_icon_name="doc.text" android_material_icon_name="description" size={20} color={colors.text} />
          <Text style={[commonStyles.text, styles.menuText]}>Terms of Service</Text>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <IconSymbol ios_icon_name="arrow.right.square" android_material_icon_name="logout" size={20} color={colors.error} />
          <Text style={[commonStyles.text, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  premiumCard: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  premiumDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  premiumButton: {
    marginTop: 8,
  },
  section: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  avatarButton: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    height: 120,
    backgroundColor: colors.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  avatarPreview: {
    height: 120,
    backgroundColor: colors.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    marginTop: 8,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  profileInfo: {
    gap: 12,
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    opacity: 0.6,
    marginTop: 8,
  },
  profileValue: {
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  saveButton: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: colors.error,
  },
});
