
import React, { useState, useCallback } from 'react';
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
import { useSubscription } from '@/hooks/useSubscription';

type NotificationType = 'silent' | 'vibration' | 'sound';
type SoundType = 'none' | 'vroom' | 'default';

export default function SettingsScreen() {
  const { user, profile, logout, updateProfile } = useAuth();
  const { subscription } = useSubscription();

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
  const [alwaysSearching, setAlwaysSearching] = useState(profile?.always_searching_enabled || false);
  const [attendanceMode, setAttendanceMode] = useState<'manual' | 'automatic'>(
    (profile as any)?.attendance_mode || 'manual'
  );
  
  // Notification preferences
  const notificationPrefs = profile?.notification_preferences || {
    detection_type: 'silent',
    vibration: false,
    sound: 'none',
  };
  const [detectionType, setDetectionType] = useState<NotificationType>(
    notificationPrefs.detection_type || 'silent'
  );
  const [vibrationEnabled, setVibrationEnabled] = useState(
    notificationPrefs.vibration || false
  );
  const [soundType, setSoundType] = useState<SoundType>(
    notificationPrefs.sound || 'none'
  );

  // Identify user with Superwall when component mounts (only on native)
  const identify = useCallback(async () => {
    if (Platform.OS === 'web' || !user?.id) return;

    try {
      const SuperwallModule = await import('expo-superwall');
      const { identify: superwallIdentify } = SuperwallModule;
      
      if (superwallIdentify) {
        await superwallIdentify(user.id);
      }
    } catch (error) {
      console.warn('[Settings] Error identifying user with Superwall:', error);
    }
  }, [user?.id]);

  React.useEffect(() => {
    identify();
  }, [identify]);

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

  const handleSaveNotificationPrefs = async () => {
    try {
      const result = await updateProfile({
        notification_preferences: {
          detection_type: detectionType,
          vibration: vibrationEnabled,
          sound: soundType,
        },
      });

      if (result.success) {
        Alert.alert('Success', 'Notification preferences updated');
      } else {
        Alert.alert('Error', result.error || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('[Settings] Error saving notification prefs:', error);
      Alert.alert('Error', 'An unexpected error occurred');
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
    setAlwaysSearching(profile?.always_searching_enabled || false);
    setIsEditing(false);
  };

  const handleManageSubscription = () => {
    router.push('/subscription-management' as any);
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

        {subscription.isPremium && (
          <View style={styles.premiumBadgeHeader}>
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
              size={20}
              color="#FFD700"
            />
            <Text style={styles.premiumText}>
              {subscription.subscriptionSource === 'free_premium' 
                ? 'Premium (Free)' 
                : 'Premium Member'}
            </Text>
          </View>
        )}
      </View>

      {!subscription.isPremium && (
        <TouchableOpacity 
          style={styles.upgradeCard}
          onPress={() => router.push('/subscription-management' as any)}
        >
          <View style={styles.upgradeCardContent}>
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
              size={32}
              color="#FFD700"
            />
            <View style={styles.upgradeCardText}>
              <Text style={styles.upgradeCardTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeCardDescription}>
                Unlock all features including Always Searching, Live Meet View, and more
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>
      )}

      {subscription.isPremium && subscription.subscriptionSource === 'superwall' && (
        <TouchableOpacity 
          style={styles.manageSubscriptionCard}
          onPress={handleManageSubscription}
        >
          <View style={styles.upgradeCardContent}>
            <IconSymbol
              ios_icon_name="creditcard.fill"
              android_material_icon_name="payment"
              size={24}
              color={colors.primary}
            />
            <View style={styles.upgradeCardText}>
              <Text style={styles.manageSubscriptionTitle}>Manage Subscription</Text>
              <Text style={styles.upgradeCardDescription}>
                View billing, change plan, or cancel subscription
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      )}

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
              const result = await updateProfile({ ghost_mode: value });
              if (!result.success) {
                Alert.alert('Error', result.error || 'Failed to update Ghost Mode');
                setGhostMode(!value);
              }
            }}
            trackColor={{ false: colors.highlight, true: colors.primary }}
            thumbColor={colors.text}
          />
        </View>
      </View>

      {subscription.isPremium && (
        <View style={styles.section}>
          <View style={styles.premiumBadge}>
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
              size={20}
              color="#FFD700"
            />
            <Text style={styles.sectionTitle}>Premium Features</Text>
          </View>
          
          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <View style={styles.labelRow}>
                <IconSymbol
                  ios_icon_name="antenna.radiowaves.left.and.right"
                  android_material_icon_name="bluetooth-searching"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>Always Searching</Text>
              </View>
              <Text style={styles.switchDescription}>
                Continuously scan for nearby vehicles in the background. Your phone will automatically detect CarDrop vehicles even when the app is closed.
              </Text>
              <Text style={[styles.switchDescription, { color: colors.accent, marginTop: 4 }]}>
                Note: This feature may impact battery life.
              </Text>
            </View>
            <Switch
              value={alwaysSearching}
              onValueChange={async (value) => {
                setAlwaysSearching(value);
                const result = await updateProfile({ always_searching_enabled: value });
                if (result.success) {
                  Alert.alert(
                    value ? 'Always Searching Enabled' : 'Always Searching Disabled',
                    value 
                      ? 'Your phone will now continuously scan for nearby CarDrop vehicles in the background. You\'ll receive notifications when vehicles are detected based on your notification preferences.'
                      : 'Background scanning has been disabled. You can still manually scan for vehicles in the Nearby tab.'
                  );
                } else {
                  Alert.alert('Error', result.error || 'Failed to update Always Searching');
                  setAlwaysSearching(!value);
                }
              }}
              trackColor={{ false: colors.highlight, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <View style={styles.labelRow}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="location-on"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.label, { marginLeft: 8, marginBottom: 0 }]}>Event Attendance Mode</Text>
              </View>
              <Text style={styles.switchDescription}>
                {attendanceMode === 'automatic' 
                  ? 'Automatic: Your attendance is marked when you arrive at event locations'
                  : 'Manual: Press a button to mark your attendance at events'}
              </Text>
            </View>
            <Switch
              value={attendanceMode === 'automatic'}
              onValueChange={async (value) => {
                const newMode = value ? 'automatic' : 'manual';
                setAttendanceMode(newMode);
                const result = await updateProfile({ attendance_mode: newMode } as any);
                if (result.success) {
                  Alert.alert(
                    'Attendance Mode Updated',
                    value 
                      ? 'Your attendance will now be automatically marked when you arrive at event locations. Make sure location services are enabled.'
                      : 'You will now need to manually check in to events by pressing the check-in button.'
                  );
                } else {
                  Alert.alert('Error', result.error || 'Failed to update attendance mode');
                  setAttendanceMode(value ? 'manual' : 'automatic');
                }
              }}
              trackColor={{ false: colors.highlight, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detection Notifications {subscription.isPremium ? '(Premium)' : ''}</Text>
        <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
          Get notified when your phone detects another CarDrop vehicle nearby
        </Text>
        
        <View style={styles.notificationOption}>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              detectionType === 'silent' && styles.notificationButtonActive,
            ]}
            onPress={() => setDetectionType('silent')}
          >
            <IconSymbol
              ios_icon_name="bell.slash.fill"
              android_material_icon_name="notifications-off"
              size={24}
              color={detectionType === 'silent' ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.notificationButtonText,
              detectionType === 'silent' && styles.notificationButtonTextActive,
            ]}>
              Silent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.notificationButton,
              detectionType === 'vibration' && styles.notificationButtonActive,
            ]}
            onPress={() => setDetectionType('vibration')}
          >
            <IconSymbol
              ios_icon_name="iphone.radiowaves.left.and.right"
              android_material_icon_name="vibration"
              size={24}
              color={detectionType === 'vibration' ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.notificationButtonText,
              detectionType === 'vibration' && styles.notificationButtonTextActive,
            ]}>
              Vibration
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.notificationButton,
              detectionType === 'sound' && styles.notificationButtonActive,
            ]}
            onPress={() => setDetectionType('sound')}
          >
            <IconSymbol
              ios_icon_name="speaker.wave.2.fill"
              android_material_icon_name="volume-up"
              size={24}
              color={detectionType === 'sound' ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.notificationButtonText,
              detectionType === 'sound' && styles.notificationButtonTextActive,
            ]}>
              Sound
            </Text>
          </TouchableOpacity>
        </View>

        {detectionType === 'sound' && (
          <View style={styles.soundOptions}>
            <Text style={styles.label}>Sound Type</Text>
            <TouchableOpacity
              style={[
                styles.soundOption,
                soundType === 'vroom' && styles.soundOptionActive,
              ]}
              onPress={() => setSoundType('vroom')}
            >
              <IconSymbol
                ios_icon_name="car.fill"
                android_material_icon_name="directions-car"
                size={20}
                color={soundType === 'vroom' ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.soundOptionText,
                soundType === 'vroom' && styles.soundOptionTextActive,
              ]}>
                Car Vroom Vroom
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.soundOption,
                soundType === 'default' && styles.soundOptionActive,
              ]}
              onPress={() => setSoundType('default')}
            >
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={20}
                color={soundType === 'default' ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.soundOptionText,
                soundType === 'default' && styles.soundOptionTextActive,
              ]}>
                Default Notification
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 16 }]}
          onPress={handleSaveNotificationPrefs}
        >
          <Text style={buttonStyles.text}>Save Notification Preferences</Text>
        </TouchableOpacity>
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
                    setFreePremium(!value);
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
  premiumBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  upgradeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(255, 107, 0, 0.3)',
    elevation: 4,
  },
  upgradeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  upgradeCardText: {
    flex: 1,
  },
  upgradeCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  upgradeCardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  manageSubscriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageSubscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 0,
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
  notificationOption: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  notificationButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  notificationButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  notificationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notificationButtonTextActive: {
    color: colors.primary,
  },
  soundOptions: {
    gap: 12,
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  soundOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  soundOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  soundOptionTextActive: {
    color: colors.primary,
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
