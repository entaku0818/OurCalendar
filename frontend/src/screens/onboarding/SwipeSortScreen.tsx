import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing } from '../../utils/theme';
import SwipeCard from '../../components/SwipeCard';
import { useEvents } from '../../store';

type Props = OnboardingScreenProps<'SwipeSort'>;

export default function SwipeSortScreen() {
  const navigation = useNavigation<Props['navigation']>();
  const { events: allEvents, toggleShared } = useEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedIds, setSortedIds] = useState<Set<string>>(new Set());

  // Filter unsorted events (events that haven't been sorted yet)
  const unsortedEvents = useMemo(() => {
    return allEvents.filter((e) => !sortedIds.has(e.id));
  }, [allEvents, sortedIds]);

  const currentEvent = unsortedEvents[currentIndex];
  const totalCount = unsortedEvents.length;
  const progress = totalCount > 0 ? `${currentIndex + 1}/${totalCount}` : '0/0';

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentEvent) return;

    console.log(`[SwipeSortScreen] ========================================`);
    console.log(`[SwipeSortScreen] handleSwipe called: direction=${direction}`);
    console.log(`[SwipeSortScreen] Current event: "${currentEvent?.title}" (index: ${currentIndex})`);

    const shouldShare = direction === 'right';
    console.log(`[SwipeSortScreen] Setting isShared=${shouldShare} (${shouldShare ? '共有' : '非公開'})`);

    // Update isShared status if it needs to change
    if (currentEvent.isShared !== shouldShare) {
      toggleShared(currentEvent.id);
    }

    // Mark as sorted
    setSortedIds((prev) => new Set([...prev, currentEvent.id]));

    // Move to next
    if (currentIndex < totalCount - 1) {
      const nextIndex = currentIndex + 1;
      console.log(`[SwipeSortScreen] Moving to next: index ${nextIndex}`);
      setCurrentIndex(nextIndex);
    } else {
      // All events sorted
      console.log(`[SwipeSortScreen] All events sorted!`);
      console.log(`[SwipeSortScreen] Navigating to CreateGroup...`);
      navigation.navigate('CreateGroup');
    }
    console.log(`[SwipeSortScreen] ========================================`);
  };

  // If no events to sort, skip to next screen
  if (totalCount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>予定を振り分け</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>振り分ける予定がありません</Text>
          <Text style={styles.emptySubtext}>
            後から設定画面で振り分けることができます
          </Text>
        </View>
        <View style={styles.skipContainer}>
          <Text
            style={styles.skipButton}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            次へ進む →
          </Text>
        </View>
      </View>
    );
  }

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
            key={currentEvent.id}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  skipContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  skipButton: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
});
