import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useEvents, useAuth } from '../../store';
import { MainStackParamList } from '../../navigation/types';
import { CalendarEvent } from '../../types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Memoized constants
const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

// Memoized event item component
interface EventItemProps {
  event: CalendarEvent;
  onPress: (id: string) => void;
}

const EventItem = memo(function EventItem({ event, onPress }: EventItemProps) {
  const handlePress = useCallback(() => onPress(event.id), [event.id, onPress]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity style={styles.eventItem} onPress={handlePress}>
      <View style={styles.eventTime}>
        <Text style={styles.eventTimeText}>{formatTime(event.startAt)}</Text>
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventTitleRow}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.isFromGoogle && (
            <View style={styles.googleBadge}>
              <Text style={styles.googleBadgeText}>G</Text>
            </View>
          )}
        </View>
        {event.isShared && <Text style={styles.eventShared}>共有中</Text>}
      </View>
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { events, isSyncing, fetchGoogleCalendarEvents } = useEvents();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch Google Calendar events on mount if user has Google linked
  useEffect(() => {
    if (user?.googleId) {
      fetchGoogleCalendarEvents();
    }
  }, [user?.googleId, fetchGoogleCalendarEvents]);

  // Memoized days calculation
  const days = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const result: Date[] = [];

    // Add padding for first week
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      result.push(new Date(year, month, -i));
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      result.push(new Date(year, month, i));
    }

    return result;
  }, [selectedDate]);

  // Memoized event dates set for quick lookup
  const eventDatesSet = useMemo(() => {
    return new Set(events.map((e) => e.startAt.toDateString()));
  }, [events]);

  // Memoized filtered events for selected date
  const todayEvents = useMemo(() => {
    const selectedDateStr = selectedDate.toDateString();
    return events
      .filter((event) => event.startAt.toDateString() === selectedDateStr)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [events, selectedDate]);

  const formatMonth = useCallback((date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  }, []);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const hasEvents = useCallback(
    (date: Date) => eventDatesSet.has(date.toDateString()),
    [eventDatesSet]
  );

  const handleTodayPress = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const handleAddPress = useCallback(() => {
    navigation.navigate('CreateEvent', { date: selectedDate.toISOString() });
  }, [navigation, selectedDate]);

  const handleEventPress = useCallback(
    (eventId: string) => {
      navigation.navigate('EventDetail', { eventId });
    },
    [navigation]
  );

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // FlatList render item
  const renderEventItem: ListRenderItem<CalendarEvent> = useCallback(
    ({ item }) => <EventItem event={item} onPress={handleEventPress} />,
    [handleEventPress]
  );

  const keyExtractor = useCallback((item: CalendarEvent) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{formatMonth(selectedDate)}</Text>
        <View style={styles.headerButtons}>
          {user?.googleId && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={fetchGoogleCalendarEvents}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.syncButtonText}>同期</Text>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.todayButton} onPress={handleTodayPress}>
            <Text style={styles.todayButtonText}>今日</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekDaysRow}>
          {WEEK_DAYS.map((day, index) => (
            <Text
              key={day}
              style={[
                styles.weekDay,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isToday(date) && styles.todayCell,
                date.toDateString() === selectedDate.toDateString() &&
                  styles.selectedCell,
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  date.getMonth() !== selectedDate.getMonth() &&
                    styles.otherMonthText,
                  index % 7 === 0 && styles.sundayText,
                  index % 7 === 6 && styles.saturdayText,
                  isToday(date) && styles.todayText,
                ]}
              >
                {date.getDate()}
              </Text>
              {hasEvents(date) && <View style={styles.eventDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.eventsSectionTitle}>
          {selectedDate.toLocaleDateString('ja-JP', {
            month: 'long',
            day: 'numeric',
          })}
          の予定
        </Text>

        <FlatList
          style={styles.eventsList}
          data={todayEvents}
          renderItem={renderEventItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <Text style={styles.noEvents}>予定はありません</Text>
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monthTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  syncButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    minWidth: 50,
    alignItems: 'center',
  },
  syncButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  todayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
  },
  todayButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  calendar: {
    paddingHorizontal: spacing.sm,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: borderRadius.full,
  },
  todayCell: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  dayText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  otherMonthText: {
    color: colors.textLight,
  },
  sundayText: {
    color: colors.danger,
  },
  saturdayText: {
    color: colors.primary,
  },
  todayText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.success,
  },
  eventsSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  eventsSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  eventsList: {
    flex: 1,
  },
  noEvents: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.xl,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  eventTime: {
    marginRight: spacing.md,
  },
  eventTimeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  eventContent: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  eventTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  googleBadge: {
    backgroundColor: '#4285F4',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleBadgeText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: 'bold',
  },
  eventShared: {
    fontSize: fontSize.xs,
    color: colors.success,
  },
  addButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: colors.background,
    fontWeight: '300',
  },
});
