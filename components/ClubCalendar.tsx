
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { EventWithClub } from '@/hooks/useClubEvents';

interface ClubCalendarProps {
  events: EventWithClub[];
  onEventPress?: (event: EventWithClub) => void;
}

export function ClubCalendar({ events, onEventPress }: ClubCalendarProps) {
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  const openInMaps = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    
    if (Platform.OS === 'ios') {
      Linking.openURL(`maps://app?q=${encodedLocation}`);
    } else if (Platform.OS === 'android') {
      Linking.openURL(`geo:0,0?q=${encodedLocation}`);
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`);
    }
  };

  const addToCalendar = (event: EventWithClub) => {
    // Format dates for calendar
    const startDate = new Date(event.event_date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
    
    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location);
    const start = formatCalendarDate(startDate);
    const end = formatCalendarDate(endDate);

    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
    
    Linking.openURL(googleCalendarUrl);
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyState}>
        <IconSymbol
          ios_icon_name="calendar"
          android_material_icon_name="event"
          size={48}
          color={colors.textSecondary}
          style={{ opacity: 0.5 }}
        />
        <Text style={styles.emptyStateText}>No upcoming events</Text>
        <Text style={styles.emptyStateSubtext}>
          Events from your clubs will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="calendar"
          android_material_icon_name="event"
          size={24}
          color={colors.secondary}
        />
        <Text style={styles.headerTitle}>Upcoming Events</Text>
      </View>

      <View style={styles.eventsList}>
        {events.map((event, index) => {
          const dateInfo = formatEventDate(event.event_date);
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.eventCard}
              onPress={() => onEventPress?.(event)}
              activeOpacity={0.7}
            >
              <View style={styles.eventDateBadge}>
                <Text style={styles.eventDateDay}>{dateInfo.day}</Text>
                <Text style={styles.eventDateMonth}>{dateInfo.month}</Text>
              </View>

              <View style={styles.eventContent}>
                <Text style={styles.eventName} numberOfLines={1}>
                  {event.name}
                </Text>
                
                <View style={styles.eventMeta}>
                  <View style={styles.eventMetaItem}>
                    <IconSymbol
                      ios_icon_name="clock.fill"
                      android_material_icon_name="schedule"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.eventMetaText}>
                      {dateInfo.weekday}, {dateInfo.time}
                    </Text>
                  </View>

                  {event.club && (
                    <View style={styles.eventMetaItem}>
                      <IconSymbol
                        ios_icon_name="person.3.fill"
                        android_material_icon_name="groups"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.eventMetaText} numberOfLines={1}>
                        {event.club.name}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    openInMaps(event.location);
                  }}
                >
                  <IconSymbol
                    ios_icon_name="location.fill"
                    android_material_icon_name="location-on"
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {event.location}
                  </Text>
                </TouchableOpacity>

                <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCalendar(event);
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="calendar.badge.plus"
                      android_material_icon_name="event-available"
                      size={16}
                      color={colors.secondary}
                    />
                    <Text style={styles.actionButtonText}>Add to Calendar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      openInMaps(event.location);
                    }}
                  >
                    <IconSymbol
                      ios_icon_name="map.fill"
                      android_material_icon_name="map"
                      size={16}
                      color={colors.secondary}
                    />
                    <Text style={styles.actionButtonText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  eventDateBadge: {
    width: 60,
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDateDay: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  eventDateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  eventContent: {
    flex: 1,
    gap: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  eventMeta: {
    gap: 6,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
