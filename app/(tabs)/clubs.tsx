
import React, { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useClubs } from '@/hooks/useClubs';
import { useClubEvents } from '@/hooks/useClubEvents';
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
import { useClubPricing } from '@/hooks/useClubPricing';
import { useStripeClubPayment } from '@/hooks/useStripeClubPayment';
import { ClubCalendar } from '@/components/ClubCalendar';
import { useRouter } from 'expo-router';

export default function ClubsScreen() {
  const [activeTab, setActiveTab] = useState<'my-clubs' | 'discover'>('my-clubs');
  const { myClubs, availableClubs, isLoading, refreshClubs, createClub, joinClub, leaveClub } = useClubs();
  const { calculatePricing } = useClubPricing();
  const { payForClub, isLoading: paymentLoading } = useStripeClubPayment();
  const router = useRouter();
  const { upcomingEvents } = useClubEvents();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleRefresh = async () => {
    await refreshClubs();
  };

  const handleCreateClub = async () => {
    if (!newClubName.trim()) {
      Alert.alert('Error', 'Please enter a club name');
      return;
    }

    try {
      setIsCreating(true);
      const success = await createClub(newClubName.trim(), newClubDescription.trim());
      
      if (success) {
        Alert.alert('Success', 'Club created successfully!');
        setShowCreateModal(false);
        setNewClubName('');
        setNewClubDescription('');
      } else {
        Alert.alert('Error', 'Failed to create club. Please try again.');
      }
    } catch (error) {
      console.error('Error creating club:', error);
      Alert.alert('Error', 'Failed to create club. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      const success = await joinClub(clubId);
      if (success) {
        Alert.alert('Success', 'You have joined the club!');
      } else {
        Alert.alert('Error', 'Failed to join club. Please try again.');
      }
    } catch (error) {
      console.error('Error joining club:', error);
      Alert.alert('Error', 'Failed to join club. Please try again.');
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
            try {
              const success = await leaveClub(clubId);
              if (success) {
                Alert.alert('Success', 'You have left the club');
              } else {
                Alert.alert('Error', 'Failed to leave club. Please try again.');
              }
            } catch (error) {
              console.error('Error leaving club:', error);
              Alert.alert('Error', 'Failed to leave club. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleManageClubPayment = async (clubId: string, memberCount: number) => {
    const pricing = calculatePricing(memberCount);
    
    if (pricing.monthlyPrice === 0) {
      Alert.alert('Free Tier', 'Your club is currently on the free tier (up to 15 members).');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Stripe payments are not available on web. Please use the mobile app.');
      return;
    }

    Alert.alert(
      'Club Subscription',
      `Your club has ${memberCount} members.\n\nMonthly cost: $${pricing.monthlyPrice.toFixed(2)}\n\nWould you like to set up payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Up Payment',
          onPress: async () => {
            const success = await payForClub(clubId, memberCount);
            if (success) {
              await refreshClubs();
            }
          },
        },
      ]
    );
  };

  const renderClubCard = (club: any, index: number) => {
    const pricing = calculatePricing(club.member_count || 0);
    const needsPayment = pricing.monthlyPrice > 0 && !club.has_active_subscription;
    const isOwner = club.is_owner;

    return (
      <TouchableOpacity
        key={club.id}
        style={[styles.clubCard, needsPayment && isOwner && styles.clubCardWarning]}
        onPress={() => router.push(`/clubs/${club.id}`)}
      >
        <View style={styles.clubHeader}>
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={[commonStyles.text, styles.clubMeta]}>
              {club.member_count || 0} members
            </Text>
          </View>
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          )}
        </View>

        {club.description && (
          <Text style={[commonStyles.text, styles.clubDescription]} numberOfLines={2}>
            {club.description}
          </Text>
        )}

        {/* Pricing Info */}
        <View style={styles.pricingInfo}>
          <IconSymbol
            ios_icon_name="dollarsign.circle"
            android_material_icon_name="payments"
            size={16}
            color={needsPayment ? colors.warning : colors.success}
          />
          <Text style={[commonStyles.text, styles.pricingText]}>
            {pricing.monthlyPrice === 0
              ? 'Free tier'
              : `$${pricing.monthlyPrice.toFixed(2)}/month`}
          </Text>
        </View>

        {needsPayment && isOwner && (
          <TouchableOpacity
            style={[buttonStyles.primary, styles.paymentButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleManageClubPayment(club.id, club.member_count || 0);
            }}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={[buttonStyles.primaryText, styles.paymentButtonText]}>
                Set Up Payment
              </Text>
            )}
          </TouchableOpacity>
        )}

        {activeTab === 'discover' && (
          <TouchableOpacity
            style={[buttonStyles.primary, styles.joinButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleJoinClub(club.id);
            }}
          >
            <Text style={buttonStyles.primaryText}>Join Club</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'my-clubs' && !isOwner && (
          <TouchableOpacity
            style={[buttonStyles.secondary, styles.leaveButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleLeaveClub(club.id, club.name);
            }}
          >
            <Text style={buttonStyles.secondaryText}>Leave Club</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Clubs</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <IconSymbol ios_icon_name="plus" android_material_icon_name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Calendar Section */}
      {upcomingEvents.length > 0 && (
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <ClubCalendar events={upcomingEvents} />
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-clubs' && styles.tabActive]}
          onPress={() => setActiveTab('my-clubs')}
        >
          <Text style={[styles.tabText, activeTab === 'my-clubs' && styles.tabTextActive]}>
            My Clubs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {activeTab === 'my-clubs' ? (
          myClubs.length > 0 ? (
            myClubs.map((club, index) => renderClubCard(club, index))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol ios_icon_name="person.3" android_material_icon_name="group" size={48} color={colors.text} />
              <Text style={[commonStyles.text, styles.emptyText]}>
                You haven&apos;t joined any clubs yet
              </Text>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.emptyButton]}
                onPress={() => setActiveTab('discover')}
              >
                <Text style={buttonStyles.primaryText}>Discover Clubs</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          availableClubs.length > 0 ? (
            availableClubs.map((club, index) => renderClubCard(club, index))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol ios_icon_name="magnifyingglass" android_material_icon_name="search" size={48} color={colors.text} />
              <Text style={[commonStyles.text, styles.emptyText]}>
                No clubs available to join
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Create Club Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Club</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <IconSymbol ios_icon_name="xmark" android_material_icon_name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[commonStyles.input, styles.input]}
              placeholder="Club Name"
              placeholderTextColor={colors.text + '60'}
              value={newClubName}
              onChangeText={setNewClubName}
            />

            <TextInput
              style={[commonStyles.input, styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.text + '60'}
              value={newClubDescription}
              onChangeText={setNewClubDescription}
              multiline
              numberOfLines={4}
            />

            <View style={styles.pricingNote}>
              <IconSymbol ios_icon_name="info.circle" android_material_icon_name="info" size={20} color={colors.primary} />
              <Text style={[commonStyles.text, styles.pricingNoteText]}>
                Free for up to 15 members. Paid plans start at $15/month for larger clubs.
              </Text>
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.createModalButton]}
              onPress={handleCreateClub}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={buttonStyles.primaryText}>Create Club</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  clubCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  clubCardWarning: {
    borderWidth: 2,
    borderColor: colors.warning,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  clubMeta: {
    fontSize: 14,
    opacity: 0.6,
  },
  ownerBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  clubDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  pricingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  paymentButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  paymentButtonText: {
    fontSize: 14,
  },
  joinButton: {
    marginTop: 12,
  },
  leaveButton: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyButton: {
    minWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  pricingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pricingNoteText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.8,
  },
  createModalButton: {
    marginTop: 8,
  },
});
