
import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

export default function SettingsScreen() {
  const { user, profile, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [instagramHandle, setInstagramHandle] = useState(profile?.instagram_handle || '');
  const [xHandle, setXHandle] = useState(profile?.x_handle || '');
  const [tiktokHandle, setTiktokHandle] = useState(profile?.tiktok_handle || '');
  const [youtubeHandle, setYoutubeHandle] = useState(profile?.youtube_handle || '');
  const [isPrivate, setIsPrivate] = useState(profile?.is_private || false);
  const [ghostMode, setGhostMode] = useState(profile?.ghost_mode || false);
  const [freePremium, setFreePremium] = useState(profile?.free_premium || false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        instagram_handle: instagramHandle.trim() || null,
        x_handle: xHandle.trim() || null,
        tiktok_handle: tiktokHandle.trim() || null,
        youtube_handle: youtubeHandle.trim() || null,
        is_private: isPrivate,
        ghost_mode: ghostMode,
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('[Settings] Error saving profile:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(profile?.display_name || '');
    setBio(profile?.bio || '');
    setInstagramHandle(profile?.instagram_handle || '');
    setXHandle(profile?.x_handle || '');
    setTiktokHandle(profile?.tiktok_handle || '');
    setYoutubeHandle(profile?.youtube_handle || '');
    setIsPrivate(profile?.is_private || false);
    setGhostMode(profile?.ghost_mode || false);
    setFreePremium(profile?.free_premium || false);
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={60}
              color={colors.textSecondary}
            />
          </View>
        </View>
        
        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.joinDate}>
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <IconSymbol
                ios_icon_name="pencil"
                android_material_icon_name="edit"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={[commonStyles.input, !isEditing && styles.inputDisabled]}
            value={displayName}
            onChangeText={setDisplayName}
            editable={isEditing}
            placeholder="Your display name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[commonStyles.input, styles.bioInput, !isEditing && styles.inputDisabled]}
            value={bio}
            onChangeText={setBio}
            editable={isEditing}
            placeholder="Tell us about yourself and your rides"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Instagram Handle</Text>
          <TextInput
            style={[commonStyles.input, !isEditing && styles.inputDisabled]}
            value={instagramHandle}
            onChangeText={setInstagramHandle}
            editable={isEditing}
            placeholder="@username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>X Handle</Text>
          <TextInput
            style={[commonStyles.input, !isEditing && styles.inputDisabled]}
            value={xHandle}
            onChangeText={setXHandle}
            editable={isEditing}
            placeholder="@username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>TikTok Handle</Text>
          <TextInput
            style={[commonStyles.input, !isEditing && styles.inputDisabled]}
            value={tiktokHandle}
            onChangeText={setTiktokHandle}
            editable={isEditing}
            placeholder="@username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>YouTube Channel</Text>
          <TextInput
            style={[commonStyles.input, !isEditing && styles.inputDisabled]}
            value={youtubeHandle}
            onChangeText={setYoutubeHandle}
            editable={isEditing}
            placeholder="@channelname"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.switchField}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.label}>Private Profile</Text>
            <Text style={styles.switchDescription}>
              Only you can see your profile and vehicles
            </Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            disabled={!isEditing}
            trackColor={{ false: colors.highlight, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[buttonStyles.outline, styles.cancelButton]}
              onPress={handleCancelEdit}
              disabled={isSaving}
            >
              <Text style={[buttonStyles.text, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[buttonStyles.primary, styles.saveButton]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={buttonStyles.text}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.switchField}>
          <View style={styles.switchLabelContainer}>
            <View style={styles.labelRow}>
              <IconSymbol
                ios_icon_name="eye.slash.fill"
                android_material_icon_name="visibility-off"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>Ghost Mode</Text>
            </View>
            <Text style={styles.switchDescription}>
              Hide all your vehicles from other users&apos; detection feeds. You can still scan and detect others.
            </Text>
          </View>
          <Switch
            value={ghostMode}
            onValueChange={async (value) => {
              setGhostMode(value);
              // Auto-save ghost mode changes
              const result = await updateProfile({ ghost_mode: value });
              if (!result.success) {
                Alert.alert('Error', result.error || 'Failed to update Ghost Mode');
                setGhostMode(!value); // Revert on error
              }
            }}
            trackColor={{ false: colors.highlight, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      {profile.username === 'cardrop' && (
        <React.Fragment>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer Tools</Text>
            
            <TouchableOpacity 
              style={styles.devButton} 
              onPress={() => router.push('/dev/beacon-registration')}
            >
              <IconSymbol
                ios_icon_name="antenna.radiowaves.left.and.right"
                android_material_icon_name="bluetooth-searching"
                size={24}
                color={colors.secondary}
              />
              <View style={styles.devButtonContent}>
                <Text style={styles.devButtonText}>Beacon Registration</Text>
                <Text style={styles.devButtonDescription}>
                  Register and configure FSC-BP108B beacons
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium Access</Text>
            
            <View style={styles.switchField}>
              <View style={styles.switchLabelContainer}>
                <View style={styles.labelRow}>
                  <IconSymbol
                    ios_icon_name="crown.fill"
                    android_material_icon_name="workspace-premium"
                    size={20}
                    color="#FFD700"
                  />
                  <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>Free Premium</Text>
                </View>
                <Text style={styles.switchDescription}>
                  Grant yourself free premium access without requiring a subscription
                </Text>
              </View>
              <Switch
                value={freePremium}
                onValueChange={async (value) => {
                  setFreePremium(value);
                  // Auto-save free premium changes
                  const result = await updateProfile({ free_premium: value });
                  if (result.success) {
                    Alert.alert(
                      'Success', 
                      value 
                        ? 'Free premium access enabled! You now have access to all premium features.' 
                        : 'Free premium access disabled.'
                    );
                  } else {
                    Alert.alert('Error', result.error || 'Failed to update Free Premium');
                    setFreePremium(!value); // Revert on error
                  }
                }}
                trackColor={{ false: colors.highlight, true: '#FFD700' }}
                thumbColor={colors.text}
              />
            </View>
          </View>
        </React.Fragment>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
          <IconSymbol
            ios_icon_name="rectangle.portrait.and.arrow.right"
            android_material_icon_name="logout"
            size={24}
            color={colors.accent}
          />
          <Text style={styles.dangerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  devButtonContent: {
    flex: 1,
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  devButtonDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
});
