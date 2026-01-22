import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { CalendarEvent } from '../types';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;
const HOUR_HEIGHT = 60;

interface WeeklyCalendarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventPress: (eventId: string) => void;
  onTimeSlotPress?: (date: Date, hour: number) => void;
}

interface EventBlockProps {
  event: CalendarEvent;
  dayIndex: number;
  onPress: (eventId: string) => void;
}

const EventBlock = memo(function EventBlock({ event, dayIndex, onPress }: EventBlockProps) {
  const handlePress = useCallback(() => {
    // Only allow pressing own events
    if (event.isOwnEvent !== false) {
      onPress(event.id);
    }
  }, [event.id, event.isOwnEvent, onPress]);

  const startHour = event.startAt.getHours();
  const startMinute = event.startAt.getMinutes();
  const endHour = event.endAt.getHours();
  const endMinute = event.endAt.getMinutes();

  const top = (startHour + startMinute / 60) * HOUR_HEIGHT;
  const height = Math.max(
    ((endHour - startHour) + (endMinute - startMinute) / 60) * HOUR_HEIGHT,
    HOUR_HEIGHT / 2
  );

  const isOtherMemberEvent = event.isOwnEvent === false;

  // Different colors: own shared (green), own private (blue), other member (purple/gray)
  const getBackgroundColor = () => {
    if (isOtherMemberEvent) return colors.secondary;
    return event.isShared ? colors.success : colors.primary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.eventBlock,
        {
          top,
          height,
          left: `${dayIndex * (100 / 7)}%`,
          width: `${100 / 7 - 1}%`,
          backgroundColor: getBackgroundColor(),
          opacity: isOtherMemberEvent ? 0.7 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={isOtherMemberEvent ? 1 : 0.7}
    >
      <Text style={styles.eventBlockTitle} numberOfLines={2}>
        {isOtherMemberEvent ? (event.ownerName?.charAt(0) || '?') : event.title}
      </Text>
    </TouchableOpacity>
  );
});

export default memo(function WeeklyCalendar({
  selectedDate,
  events,
  onDateSelect,
  onEventPress,
  onTimeSlotPress,
}: WeeklyCalendarProps) {
  // Get the week's start (Sunday)
  const weekStart = useMemo(() => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
  }, [selectedDate]);

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [weekStart]);

  // Filter events for this week
  const weekEvents = useMemo(() => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return events.filter((event) => {
      const eventDate = event.startAt;
      return eventDate >= weekStart && eventDate < weekEnd;
    });
  }, [events, weekStart]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const handleTimeSlotPress = useCallback(
    (dayIndex: number, hour: number) => {
      if (onTimeSlotPress) {
        const date = new Date(weekDays[dayIndex]);
        date.setHours(hour, 0, 0, 0);
        onTimeSlotPress(date, hour);
      }
    },
    [weekDays, onTimeSlotPress]
  );

  const formatHour = useCallback((hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with day names and dates */}
      <View style={styles.header}>
        <View style={styles.timeColumn} />
        {weekDays.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayHeader,
              isToday(date) && styles.todayHeader,
              date.toDateString() === selectedDate.toDateString() && styles.selectedHeader,
            ]}
            onPress={() => onDateSelect(date)}
          >
            <Text
              style={[
                styles.dayName,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {WEEK_DAYS[index]}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                isToday(date) && styles.todayText,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}
            >
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Time labels */}
          <View style={styles.timeLabels}>
            {HOURS.map((hour) => (
              <View key={hour} style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>{formatHour(hour)}</Text>
              </View>
            ))}
          </View>

          {/* Grid cells */}
          <View style={styles.grid}>
            {/* Hour rows */}
            {HOURS.map((hour) => (
              <View key={hour} style={styles.hourRow}>
                {weekDays.map((_, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={styles.gridCell}
                    onPress={() => handleTimeSlotPress(dayIndex, hour)}
                  />
                ))}
              </View>
            ))}

            {/* Events */}
            {weekEvents.map((event) => {
              const dayIndex = event.startAt.getDay();
              return (
                <EventBlock
                  key={event.id}
                  event={event}
                  dayIndex={dayIndex}
                  onPress={onEventPress}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  timeColumn: {
    width: 50,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginHorizontal: 2,
  },
  todayHeader: {
    backgroundColor: colors.primary,
  },
  selectedHeader: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  todayText: {
    color: colors.background,
  },
  sundayText: {
    color: colors.danger,
  },
  saturdayText: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  timeLabels: {
    width: 50,
  },
  timeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'flex-start',
    paddingRight: spacing.sm,
    alignItems: 'flex-end',
  },
  timeLabelText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: -6,
  },
  grid: {
    flex: 1,
    position: 'relative',
  },
  hourRow: {
    height: HOUR_HEIGHT,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gridCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  eventBlock: {
    position: 'absolute',
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    overflow: 'hidden',
    marginLeft: 1,
  },
  eventBlockTitle: {
    fontSize: fontSize.xs,
    color: colors.background,
    fontWeight: '500',
  },
});
