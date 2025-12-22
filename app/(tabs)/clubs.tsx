
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useClubs } from '@/hooks/useClubs';

export default function ClubsScreen() {
  const router = useRouter();
  const { clubs, myClubs, loading, error, createClub, joinClub, leaveClub, refetch } = useClubs();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    is_public: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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

    try {
      await createClub(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        location: '',
        is_public: true,
      });
      Alert.alert('Success', 'Club created successfully!');
    } catch (err) {
      console.error('Error creating club:', err);
      Alert.alert('Error', 'Failed to create club. Please try again.');
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await joinClub(clubId);
      Alert.alert('Success', 'You have joined the club!');
    } catch (err) {
      console.error('Error joining club:', err);
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
              await leaveClub(clubId);
              Alert.alert('Success', 'You have left the club');
            } catch (err) {
              console.error('Error leaving club:', err);
              Alert.alert('Error', 'Failed to leave club. Please try again.');
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
              {club.member_count || 0} {club.member_count === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        <View style={styles.clubActions}>
          {isMember ? (
            <React.Fragment>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.actionButton]}
                onPress={() => {
                  console.log('Navigate to club details:', club.id);
                }}
              >
                <Text style={buttonStyles.text}>View Club</Text>
              </TouchableOpacity>
              {!isOwner && (
                <TouchableOpacity
                  style={[buttonStyles.outline, styles.actionButton]}
                  onPress={() => handleLeaveClub(club.id, club.name)}
                >
                  <Text style={[buttonStyles.text, { color: colors.error }]}>Leave</Text>
                </TouchableOpacity>
              )}
            </React.Fragment>
          ) : (
            <TouchableOpacity
              style={[buttonStyles.primary, styles.actionButton]}
              onPress={() => handleJoinClub(club.id)}
            >
              <Text style={buttonStyles.text}>Join Club</Text>
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
            <Text style={commonStyles.textSecondary}>Loading...</Text>
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
            <Text style={commonStyles.textSecondary}>Loading...</Text>
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
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Club</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
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
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="City, State"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Public Club</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    formData.is_public && styles.switchActive,
                  ]}
                  onPress={() => setFormData({ ...formData, is_public: !formData.is_public })}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      formData.is_public && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[commonStyles.textSecondary, { marginBottom: 24 }]}>
                {formData.is_public
                  ? 'Anyone can discover and join this club'
                  : 'Only invited members can join this club'}
              </Text>

              <TouchableOpacity
                style={[buttonStyles.primary, { marginBottom: 16 }]}
                onPress={handleCreateClub}
              >
                <Text style={buttonStyles.text}>Create Club</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={buttonStyles.outline}
                onPress={() => setShowCreateModal(false)}
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
  clubActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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
