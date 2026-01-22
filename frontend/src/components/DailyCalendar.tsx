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
const HOUR_HEIGHT = 80;

interface DailyCalendarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventPress: (eventId: string) => void;
  onTimeSlotPress?: (date: Date, hour: number) => void;
}

interface EventBlockProps {
  event: CalendarEvent;
  onPress: (eventId: string) => void;
  overlappingCount: number;
  overlapIndex: number;
}

const EventBlock = memo(function EventBlock({
  event,
  onPress,
  overlappingCount,
  overlapIndex,
}: EventBlockProps) {
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

  const widthPercent = `${90 / overlappingCount}%` as const;
  const leftPercent = `${10 + (overlapIndex * 90) / overlappingCount}%` as const;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

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
          left: leftPercent as `${number}%`,
          width: widthPercent as `${number}%`,
          backgroundColor: getBackgroundColor(),
          opacity: isOtherMemberEvent ? 0.8 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={isOtherMemberEvent ? 1 : 0.7}
    >
      <Text style={styles.eventBlockTime}>
        {formatTime(event.startAt)} - {formatTime(event.endAt)}
      </Text>
      <Text style={styles.eventBlockTitle} numberOfLines={3}>
        {isOtherMemberEvent ? '予定あり' : event.title}
      </Text>
      {isOtherMemberEvent ? (
        <View style={styles.memberBadge}>
          <Text style={styles.memberBadgeText}>{event.ownerName}</Text>
        </View>
      ) : (
        event.isShared && (
          <View style={styles.sharedBadge}>
            <Text style={styles.sharedBadgeText}>共有</Text>
          </View>
        )
      )}
    </TouchableOpacity>
  );
});

export default memo(function DailyCalendar({
  selectedDate,
  events,
  onEventPress,
  onTimeSlotPress,
}: DailyCalendarProps) {
  // Filter events for selected date
  const dayEvents = useMemo(() => {
    const dateStr = selectedDate.toDateString();
    return events
      .filter((event) => event.startAt.toDateString() === dateStr)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [events, selectedDate]);

  // Calculate overlapping events
  const eventsWithOverlap = useMemo(() => {
    const result: Array<{
      event: CalendarEvent;
      overlappingCount: number;
      overlapIndex: number;
    }> = [];

    dayEvents.forEach((event, index) => {
      // Find overlapping events
      const overlapping = dayEvents.filter((other, otherIndex) => {
        if (otherIndex >= index) return false;
        return (
          (event.startAt < other.endAt && event.endAt > other.startAt)
        );
      });

      const overlappingIndices = overlapping.map((e) =>
        result.find((r) => r.event.id === e.id)?.overlapIndex ?? 0
      );

      let overlapIndex = 0;
      while (overlappingIndices.includes(overlapIndex)) {
        overlapIndex++;
      }

      const overlappingCount = Math.max(
        overlapping.length + 1,
        ...overlapping.map((e) =>
          result.find((r) => r.event.id === e.id)?.overlappingCount ?? 1
        )
      );

      // Update previous overlapping events' count
      overlapping.forEach((e) => {
        const item = result.find((r) => r.event.id === e.id);
        if (item) {
          item.overlappingCount = overlappingCount;
        }
      });

      result.push({ event, overlappingCount, overlapIndex });
    });

    return result;
  }, [dayEvents]);

  const handleTimeSlotPress = useCallback(
    (hour: number) => {
      if (onTimeSlotPress) {
        const date = new Date(selectedDate);
        date.setHours(hour, 0, 0, 0);
        onTimeSlotPress(date, hour);
      }
    },
    [selectedDate, onTimeSlotPress]
  );

  const formatHour = useCallback((hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with date */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <Text style={styles.eventCount}>
          {dayEvents.length}件の予定
        </Text>
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
              <TouchableOpacity
                key={hour}
                style={styles.hourRow}
                onPress={() => handleTimeSlotPress(hour)}
              >
                <View style={styles.halfHourLine} />
              </TouchableOpacity>
            ))}

            {/* Events */}
            {eventsWithOverlap.map(({ event, overlappingCount, overlapIndex }) => (
              <EventBlock
                key={event.id}
                event={event}
                onPress={onEventPress}
                overlappingCount={overlappingCount}
                overlapIndex={overlapIndex}
              />
            ))}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  dateText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  eventCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  timeLabels: {
    width: 60,
  },
  timeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'flex-start',
    paddingRight: spacing.sm,
    alignItems: 'flex-end',
  },
  timeLabelText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: -8,
  },
  grid: {
    flex: 1,
    position: 'relative',
  },
  hourRow: {
    height: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  halfHourLine: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
    marginLeft: spacing.sm,
  },
  eventBlock: {
    position: 'absolute',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255,255,255,0.5)',
  },
  eventBlockTime: {
    fontSize: fontSize.xs,
    color: colors.background,
    opacity: 0.9,
    marginBottom: 2,
  },
  eventBlockTitle: {
    fontSize: fontSize.sm,
    color: colors.background,
    fontWeight: '600',
  },
  sharedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  sharedBadgeText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: '600',
  },
  memberBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  memberBadgeText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: '600',
  },
});
