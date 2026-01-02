import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing } from '../../utils/theme';
import { SwipeCard, Button } from '../../components';
import { CalendarEvent } from '../../types';

// Mock data - would come from context
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '歯医者の予約',
    startAt: new Date('2025-01-15T10:00:00'),
    endAt: new Date('2025-01-15T11:00:00'),
    isFromGoogle: true,
    isShared: true,
    createdBy: 'user1',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: '仕事の打ち合わせ',
    startAt: new Date('2025-01-18T14:00:00'),
    endAt: new Date('2025-01-18T15:00:00'),
    isFromGoogle: true,
    isShared: false,
    createdBy: 'user1',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: '家族旅行',
    startAt: new Date('2025-01-25T09:00:00'),
    endAt: new Date('2025-01-27T18:00:00'),
    isFromGoogle: true,
    isShared: true,
    createdBy: 'user1',
    createdAt: new Date(),
  },
];

export default function ResortEventsScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState(mockEvents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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
      setIsComplete(true);
      // TODO: Save to context/storage
    }
  };

  const handleComplete = () => {
    navigation.goBack();
  };

  const currentEvent = events[currentIndex];
  const progress = `${currentIndex + 1}/${events.length}`;

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>✅</Text>
          <Text style={styles.completeTitle}>振り分け完了！</Text>
          <Text style={styles.completeDescription}>
            {events.filter((e) => e.isShared).length}件の予定を共有設定にしました
          </Text>
          <Button
            title="完了"
            onPress={handleComplete}
            style={styles.completeButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予定の振り分け</Text>
        <Text style={styles.progress}>{progress}</Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionLeft}>← 非公開</Text>
        <Text style={styles.instructionRight}>共有 →</Text>
      </View>

      <View style={styles.cardContainer}>
        {currentEvent && (
          <SwipeCard event={currentEvent} onSwipe={handleSwipe} />
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

      <View style={styles.currentStatus}>
        <Text style={styles.currentStatusText}>
          現在: {currentEvent?.isShared ? '共有中' : '非公開'}
        </Text>
      </View>
    </SafeAreaView>
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
    paddingTop: spacing.md,
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
    paddingBottom: spacing.md,
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
  currentStatus: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  currentStatusText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  completeDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  completeButton: {
    minWidth: 200,
  },
});
