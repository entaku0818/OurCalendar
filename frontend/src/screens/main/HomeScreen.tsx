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
import WeeklyCalendar from '../../components/WeeklyCalendar';
import DailyCalendar from '../../components/DailyCalendar';

type ViewMode = 'month' | 'week' | 'day';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Memoized constants
const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

// Memoized event item component
interface EventItemProps {
  event: CalendarEvent;
  onPress: (id: string) => void;
}

const EventItem = memo(function EventItem({ event, onPress }: EventItemProps) {
  const handlePress = useCallback(() => {
    // Only allow pressing own events
    if (event.isOwnEvent !== false) {
      onPress(event.id);
    }
  }, [event.id, event.isOwnEvent, onPress]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const isOtherMemberEvent = event.isOwnEvent === false;

  return (
    <TouchableOpacity
      style={[styles.eventItem, isOtherMemberEvent && styles.otherMemberEventItem]}
      onPress={handlePress}
      activeOpacity={isOtherMemberEvent ? 1 : 0.7}
    >
      {isOtherMemberEvent && (
        <View style={styles.memberAvatar}>
          {event.ownerAvatarUrl ? (
            <View style={styles.avatarImage}>
              <Text style={styles.avatarInitial}>
                {event.ownerName?.charAt(0) || '?'}
              </Text>
            </View>
          ) : (
            <View style={styles.avatarImage}>
              <Text style={styles.avatarInitial}>
                {event.ownerName?.charAt(0) || '?'}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.eventTime}>
        <Text style={styles.eventTimeText}>{formatTime(event.startAt)}</Text>
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventTitleRow}>
          <Text style={[styles.eventTitle, isOtherMemberEvent && styles.otherMemberEventTitle]}>
            {isOtherMemberEvent ? '予定あり' : event.title}
          </Text>
          {!isOtherMemberEvent && event.isFromGoogle && (
            <View style={styles.googleBadge}>
              <Text style={styles.googleBadgeText}>G</Text>
            </View>
          )}
        </View>
        {isOtherMemberEvent ? (
          <Text style={styles.memberName}>{event.ownerName}</Text>
        ) : (
          event.isShared && <Text style={styles.eventShared}>共有中</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { allEvents, isSyncing, fetchGoogleCalendarEvents } = useEvents();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

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
    return new Set(allEvents.map((e) => e.startAt.toDateString()));
  }, [allEvents]);

  // Memoized filtered events for selected date
  const todayEvents = useMemo(() => {
    const selectedDateStr = selectedDate.toDateString();
    return allEvents
      .filter((event) => event.startAt.toDateString() === selectedDateStr)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [allEvents, selectedDate]);

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

  const handleTimeSlotPress = useCallback(
    (date: Date, hour: number) => {
      const eventDate = new Date(date);
      eventDate.setHours(hour, 0, 0, 0);
      navigation.navigate('CreateEvent', { date: eventDate.toISOString() });
    },
    [navigation]
  );

  const handlePrevious = useCallback(() => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  }, [viewMode]);

  // FlatList render item
  const renderEventItem: ListRenderItem<CalendarEvent> = useCallback(
    ({ item }) => <EventItem event={item} onPress={handleEventPress} />,
    [handleEventPress]
  );

  const keyExtractor = useCallback((item: CalendarEvent) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.navigationRow}>
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
              <Text style={styles.navButtonText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{formatMonth(selectedDate)}</Text>
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Text style={styles.navButtonText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
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

        <View style={styles.viewModeRow}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'month' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
              月
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'week' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
              週
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'day' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.viewModeText, viewMode === 'day' && styles.viewModeTextActive]}>
              日
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'week' && (
        <WeeklyCalendar
          selectedDate={selectedDate}
          events={allEvents}
          onDateSelect={handleDateSelect}
          onEventPress={handleEventPress}
          onTimeSlotPress={handleTimeSlotPress}
        />
      )}

      {viewMode === 'day' && (
        <DailyCalendar
          selectedDate={selectedDate}
          events={allEvents}
          onEventPress={handleEventPress}
          onTimeSlotPress={handleTimeSlotPress}
        />
      )}

      {viewMode === 'month' && (
        <>
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
        </>
      )}

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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 140,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewModeRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: 2,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  viewModeButtonActive: {
    backgroundColor: colors.background,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  viewModeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: colors.primary,
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
    alignItems: 'center',
  },
  otherMemberEventItem: {
    backgroundColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  memberAvatar: {
    marginRight: spacing.sm,
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: fontSize.sm,
    color: colors.background,
    fontWeight: '600',
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
  otherMemberEventTitle: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  memberName: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    fontWeight: '500',
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
