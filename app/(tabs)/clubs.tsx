
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useClubs } from '@/hooks/useClubs';
import { useClubEvents } from '@/hooks/useClubEvents';
import { useClubPricing } from '@/hooks/useClubPricing';
import { ClubCalendar } from '@/components/ClubCalendar';

export default function ClubsScreen() {
  const router = useRouter();
  const { clubs, myClubs, loading, error, createClub, joinClub, leaveClub, refetch } = useClubs();
  const { events, loading: eventsLoading } = useClubEvents();
  const { calculatePricing } = useClubPricing();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    is_public: true,
    allow_member_invites: true,
    require_approval: false,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('[Clubs] Error refreshing:', error);
      Alert.alert('Error', 'Failed to refresh clubs. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateClub = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Club name is required');
      return;
    }

    if (formData.name.length < 3) {
      Alert.alert('Error', 'Club name must be at least 3 characters');
      return;
    }

    if (isCreating) return; // Prevent double-tap

    setIsCreating(true);
    try {
      console.log('[Clubs] Creating club:', formData.name);
      await createClub(formData);
      
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        location: '',
        is_public: true,
        allow_member_invites: true,
        require_approval: false,
      });
      
      Alert.alert('Success', 'Club created successfully!');
      console.log('[Clubs] Club created successfully');
    } catch (err: any) {
      console.error('[Clubs] Error creating club:', err);
      
      let errorMessage = 'Failed to create club. Please try again.';
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    if (isJoining) return; // Prevent double-tap
    
    setIsJoining(clubId);
    try {
      console.log('[Clubs] Joining club:', clubId);
      await joinClub(clubId);
      Alert.alert('Success', 'You have joined the club!');
      console.log('[Clubs] Successfully joined club');
    } catch (err: any) {
      console.error('[Clubs] Error joining club:', err);
      
      let errorMessage = 'Failed to join club. Please try again.';
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsJoining(null);
    }
  };

  const handleLeaveClub = async (clubId: string, clubName: string) => {
    Alert.alert(
      'Leave Club',
      `Are you sure you want to leave ${clubName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            if (isLeaving) return; // Prevent double-tap
            
            setIsLeaving(clubId);
            try {
              console.log('[Clubs] Leaving club:', clubId);
              await leaveClub(clubId);
              Alert.alert('Success', 'You have left the club');
              console.log('[Clubs] Successfully left club');
            } catch (err: any) {
              console.error('[Clubs] Error leaving club:', err);
              
              let errorMessage = 'Failed to leave club. Please try again.';
              if (err.message?.includes('network') || err.message?.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
              } else if (err.message) {
                errorMessage = err.message;
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setIsLeaving(null);
            }
          },
        },
      ]
    );
  };

  const renderClubCard = (club: any, index: number) => {
    const isMember = club.is_member;
    const isOwner = club.user_role === 'owner';
    const isAdmin = club.user_role === 'admin';
    const memberCount = club.member_count || 0;
    const pricing = calculatePricing(memberCount);
    const isJoiningThis = isJoining === club.id;
    const isLeavingThis = isLeaving === club.id;

    return (
      <View key={index} style={styles.clubCard}>
        <View style={styles.clubHeader}>
          <View style={styles.clubTitleRow}>
            <Text style={styles.clubName} numberOfLines={1}>
              {club.name}
            </Text>
            {!club.is_public && (
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={16}
                color={colors.textSecondary}
              />
            )}
          </View>
          {(isOwner || isAdmin) && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{club.user_role}</Text>
            </View>
          )}
        </View>

        {club.description && (
          <Text style={styles.clubDescription} numberOfLines={2}>
            {club.description}
          </Text>
        )}

        <View style={styles.clubMeta}>
          {club.location && (
            <View style={styles.metaItem}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {club.location}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="person.3.fill"
              android_material_icon_name="groups"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.metaText}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
          
          {memberCount > 15 && (
            <View style={styles.pricingBadge}>
              <IconSymbol
                ios_icon_name="dollarsign.circle.fill"
                android_material_icon_name="payments"
                size={14}
                color={colors.warning}
              />
              <Text style={styles.pricingText}>
                ${pricing.monthlyPrice.toFixed(2)}/mo
              </Text>
            </View>
          )}
        </View>

        <View style={styles.clubActions}>
          {isMember ? (
            <React.Fragment>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.actionButton]}
                onPress={() => {
                  console.log('[Clubs] Navigate to club details:', club.id);
                  router.push(`/clubs/${club.id}`);
                }}
              >
                <Text style={buttonStyles.text}>View Club</Text>
              </TouchableOpacity>
              {!isOwner && (
                <TouchableOpacity
                  style={[buttonStyles.outline, styles.actionButton, isLeavingThis && styles.buttonDisabled]}
                  onPress={() => handleLeaveClub(club.id, club.name)}
                  disabled={isLeavingThis}
                >
                  {isLeavingThis ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Text style={[buttonStyles.text, { color: colors.error }]}>Leave</Text>
                  )}
                </TouchableOpacity>
              )}
            </React.Fragment>
          ) : (
            <TouchableOpacity
              style={[buttonStyles.primary, styles.actionButton, isJoiningThis && styles.buttonDisabled]}
              onPress={() => handleJoinClub(club.id)}
              disabled={isJoiningThis}
            >
              {isJoiningThis ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Text style={buttonStyles.text}>Join Club</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'android' && styles.androidPadding,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Clubs</Text>
          <Text style={styles.subtitle}>Join the community</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={24}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.createButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add-circle"
              size={24}
              color={colors.text}
            />
            <Text style={[buttonStyles.text, styles.createButtonText]}>Create Club</Text>
          </TouchableOpacity>
        </View>

        {myClubs.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={24}
                color={colors.secondary}
              />
              <Text style={styles.calendarButtonText}>
                {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
              </Text>
              <IconSymbol
                ios_icon_name={showCalendar ? 'chevron.up' : 'chevron.down'}
                android_material_icon_name={showCalendar ? 'expand-less' : 'expand-more'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                <ClubCalendar events={events} />
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.sectionTitle}>My Clubs</Text>
          </View>
          {loading && myClubs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={commonStyles.textSecondary}>Loading clubs...</Text>
            </View>
          ) : myClubs.length === 0 ? (
            <View style={commonStyles.emptyState}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="groups"
                size={64}
                color={colors.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={commonStyles.emptyStateText}>You haven&apos;t joined any clubs yet</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
                Discover clubs below or create your own
              </Text>
            </View>
          ) : (
            <View style={styles.clubsList}>
              {myClubs.map((club, index) => renderClubCard(club, index))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="explore"
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.sectionTitle}>Discover Clubs</Text>
          </View>
          {loading && clubs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={commonStyles.textSecondary}>Loading clubs...</Text>
            </View>
          ) : clubs.filter(c => !c.is_member).length === 0 ? (
            <View style={commonStyles.emptyState}>
              <IconSymbol
                ios_icon_name="magnifyingglass"
                android_material_icon_name="search"
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={commonStyles.emptyStateText}>No clubs available yet</Text>
            </View>
          ) : (
            <View style={styles.clubsList}>
              {clubs.filter(c => !c.is_member).map((club, index) => renderClubCard(club, index))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.pricingInfo}>
            <Text style={styles.pricingInfoTitle}>Club Pricing</Text>
            <Text style={styles.pricingInfoText}>
              - Free for clubs with 15 or fewer members
            </Text>
            <Text style={styles.pricingInfoText}>
              - Up to 50 members: $15/month
            </Text>
            <Text style={styles.pricingInfoText}>
              - Up to 100 members: $25/month
            </Text>
            <Text style={styles.pricingInfoText}>
              - Up to 200 members: $40/month
            </Text>
            <Text style={styles.pricingInfoText}>
              - Up to 500 members: $75/month
            </Text>
            <Text style={styles.pricingInfoText}>
              - Above 500 members: $0.15 per member/month
            </Text>
            <Text style={[styles.pricingInfoText, { marginTop: 8, fontStyle: 'italic' }]}>
              Club owners/admins are responsible for payment
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isCreating && setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Club</Text>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
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
              <Text style={styles.label}>Club Name *</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter club name"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
                editable={!isCreating}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[commonStyles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe your club"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                editable={!isCreating}
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="City, State"
                placeholderTextColor={colors.textSecondary}
                editable={!isCreating}
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Public Club</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    formData.is_public && styles.switchActive,
                  ]}
                  onPress={() => !isCreating && setFormData({ ...formData, is_public: !formData.is_public })}
                  disabled={isCreating}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      formData.is_public && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
                {formData.is_public
                  ? 'Anyone can discover and join this club'
                  : 'Only invited members can join this club'}
              </Text>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Allow Member Invites</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    formData.allow_member_invites && styles.switchActive,
                  ]}
                  onPress={() => !isCreating && setFormData({ ...formData, allow_member_invites: !formData.allow_member_invites })}
                  disabled={isCreating}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      formData.allow_member_invites && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[commonStyles.textSecondary, { marginBottom: 24 }]}>
                {formData.allow_member_invites
                  ? 'Members can invite others to join'
                  : 'Only admins can invite new members'}
              </Text>

              <TouchableOpacity
                style={[buttonStyles.primary, { marginBottom: 16 }, isCreating && styles.buttonDisabled]}
                onPress={handleCreateClub}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={buttonStyles.text}>Create Club</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={buttonStyles.outline}
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  androidPadding: {
    paddingTop: 48,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    marginLeft: 0,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  calendarButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  calendarContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  clubsList: {
    gap: 16,
  },
  clubCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clubTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clubName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  clubDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  clubMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  pricingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pricingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  clubActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pricingInfo: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  pricingInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  pricingInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.highlight,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.text,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
});
