import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing } from '../../utils/theme';
import SwipeCard from '../../components/SwipeCard';
import { CalendarEvent } from '../../types';

type Props = OnboardingScreenProps<'SwipeSort'>;

// Mock data for demo
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '歯医者の予約',
    startAt: new Date('2025-01-15T10:00:00'),
    endAt: new Date('2025-01-15T11:00:00'),
    isFromGoogle: true,
    isShared: false,
    createdBy: 'user1',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: '家族で外食',
    startAt: new Date('2025-01-18T18:00:00'),
    endAt: new Date('2025-01-18T20:00:00'),
    isFromGoogle: true,
    isShared: false,
    createdBy: 'user1',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: '子供の授業参観',
    startAt: new Date('2025-01-20T14:00:00'),
    endAt: new Date('2025-01-20T15:30:00'),
    isFromGoogle: true,
    isShared: false,
    createdBy: 'user1',
    createdAt: new Date(),
  },
  {
    id: '4',
    title: '仕事の打ち合わせ',
    startAt: new Date('2025-01-22T15:00:00'),
    endAt: new Date('2025-01-22T16:00:00'),
    isFromGoogle: true,
    isShared: false,
    createdBy: 'user1',
    createdAt: new Date(),
  },
];

export default function SwipeSortScreen() {
  const navigation = useNavigation<Props['navigation']>();
  const [events, setEvents] = useState(mockEvents);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    const isShared = direction === 'right';

    // Update event
    const updatedEvents = [...events];
    updatedEvents[currentIndex] = {
      ...updatedEvents[currentIndex],
      isShared,
    };
    setEvents(updatedEvents);

    // Move to next
    if (currentIndex < events.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All events sorted
      navigation.navigate('CreateGroup');
    }
  };

  const currentEvent = events[currentIndex];
  const progress = `${currentIndex + 1}/${events.length}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予定を振り分け</Text>
        <Text style={styles.progress}>{progress}</Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionLeft}>← 非公開</Text>
        <Text style={styles.instructionRight}>共有 →</Text>
      </View>

      <View style={styles.cardContainer}>
        {currentEvent && (
          <SwipeCard
            event={currentEvent}
            onSwipe={handleSwipe}
          />
        )}
      </View>

      <View style={styles.hints}>
        <View style={styles.hintItem}>
          <View style={[styles.hintDot, { backgroundColor: colors.swipeLeft }]} />
          <Text style={styles.hintText}>非公開: 自分だけ</Text>
        </View>
        <View style={styles.hintItem}>
          <View style={[styles.hintDot, { backgroundColor: colors.swipeRight }]} />
          <Text style={styles.hintText}>共有: グループに公開</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  progress: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  instructionLeft: {
    fontSize: fontSize.sm,
    color: colors.swipeLeft,
    fontWeight: '600',
  },
  instructionRight: {
    fontSize: fontSize.sm,
    color: colors.swipeRight,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  hints: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hintDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  hintText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
