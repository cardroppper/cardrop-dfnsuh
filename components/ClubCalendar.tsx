
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ClubCalendarProps {
  events: Event[];
  onEventPress: (event: Event) => void;
}

export function ClubCalendar({ events, onEventPress }: ClubCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePreviousMonth = () => {
    console.log('[ClubCalendar] Previous month');
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    console.log('[ClubCalendar] Next month');
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getEventsForMonth = () => {
    const monthEvents = events.filter((event) => {
      const eventDate = new Date(event.event_date);
      const eventMonth = eventDate.getMonth();
      const eventYear = eventDate.getFullYear();
      const isInMonth = eventMonth === selectedMonth && eventYear === selectedYear;
      return isInMonth;
    });
    console.log('[ClubCalendar] Events for month:', monthEvents.length);
    return monthEvents;
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const formattedDate = `${month} ${day}`;
    const formattedTime = time;
    return { formattedDate, formattedTime };
  };

  const monthEvents = getEventsForMonth();
  const monthName = monthNames[selectedMonth];
  const yearText = selectedYear.toString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousMonth}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron-left"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthText}>{monthName}</Text>
          <Text style={styles.yearText}>{yearText}</Text>
        </View>
        <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
        {monthEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No events this month</Text>
          </View>
        ) : (
          monthEvents.map((event) => {
            const { formattedDate, formattedTime } = formatEventDate(event.event_date);
            const locationText = event.location || 'Location TBD';

            return (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => onEventPress(event)}
              >
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateText}>{new Date(event.event_date).getDate()}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaItem}>
                      <IconSymbol
                        ios_icon_name="clock"
                        android_material_icon_name="access-time"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.eventMetaText}>{formattedTime}</Text>
                    </View>
                    <View style={styles.eventMetaItem}>
                      <IconSymbol
                        ios_icon_name="location"
                        android_material_icon_name="location-on"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.eventMetaText}>{locationText}</Text>
                    </View>
                  </View>
                  {event.description && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  yearText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  eventsContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  eventDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
});
