
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/app/integrations/supabase/client';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ClubWithDetails } from '@/types/club';
import { useEvents } from '@/hooks/useEvents';

export default function ClubDetailScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams();
  const [club, setClub] = useState<ClubWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents(clubId as string);

  const fetchClubDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();

      if (clubError) throw clubError;

      const { data: membershipData } = await supabase
        .from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', user.id)
        .single();

      const { data: membersData } = await supabase
        .from('club_members')
        .select('*')
        .eq('club_id', clubId);

      setClub({
        ...clubData,
        member_count: membersData?.length || 0,
        is_member: !!membershipData,
        user_role: membershipData?.role || null,
      });
    } catch (err) {
      console.error('Error fetching club details:', err);
      Alert.alert('Error', 'Failed to load club details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClubDetails();
    await refetchEvents();
  };

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.textSecondary}>Loading club...</Text>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.emptyStateText}>Club not found</Text>
      </View>
    );
  }

  const canManageEvents = club.user_role === 'owner' || club.user_role === 'admin';

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{club.name}</Text>
            {!club.is_public && (
              <IconSymbol
                ios_icon_name="lock.fill"
                android_material_icon_name="lock"
                size={20}
                color={colors.textSecondary}
              />
            )}
          </View>
          {club.user_role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{club.user_role}</Text>
            </View>
          )}
        </View>

        {club.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{club.description}</Text>
          </View>
        )}

        <View style={styles.metaSection}>
          {club.location && (
            <View style={styles.metaItem}>
              <IconSymbol
                ios_icon_name="location.fill"
                android_material_icon_name="location-on"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.metaText}>{club.location}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <IconSymbol
              ios_icon_name="person.3.fill"
              android_material_icon_name="groups"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.metaText}>
              {club.member_count} {club.member_count === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>

          {canManageEvents && (
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={() => {
                console.log('Create event for club:', clubId);
              }}
            >
              <Text style={buttonStyles.text}>Create Event</Text>
            </TouchableOpacity>
          )}

          {eventsLoading ? (
            <Text style={commonStyles.textSecondary}>Loading events...</Text>
          ) : events.length === 0 ? (
            <View style={commonStyles.emptyState}>
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="event"
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={commonStyles.emptyStateText}>No upcoming events</Text>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {events.map((event, index) => (
                <View key={index} style={styles.eventCard}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaItem}>
                      <IconSymbol
                        ios_icon_name="calendar"
                        android_material_icon_name="event"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.eventMetaText}>
                        {new Date(event.event_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.eventMetaItem}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="location-on"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.eventMetaText}>{event.location}</Text>
                    </View>
                  </View>
                  {event.rsvp_count !== undefined && (
                    <Text style={styles.rsvpCount}>
                      {event.rsvp_count} {event.rsvp_count === 1 ? 'person' : 'people'} going
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
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
    paddingBottom: 100,
  },
  androidPadding: {
    paddingTop: 48,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 48,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  metaSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rsvpCount: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});
