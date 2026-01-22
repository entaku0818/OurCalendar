import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { SwipeCard, Button } from '../../components';
import { useEvents } from '../../store';

export default function ResortEventsScreen() {
  const navigation = useNavigation();
  const { events: allEvents, toggleShared } = useEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedIds, setSortedIds] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [sortedCount, setSortedCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(0);

  const unsortedEvents = useMemo(() => {
    return allEvents.filter((e) => !sortedIds.has(e.id));
  }, [allEvents, sortedIds]);

  const currentEvent = unsortedEvents[currentIndex];
  const totalCount = unsortedEvents.length;
  const progress = totalCount > 0 ? `${currentIndex + 1}/${totalCount}` : '0/0';

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentEvent) return;

    const shouldShare = direction === 'right';

    // Update isShared status if it needs to change
    if (currentEvent.isShared !== shouldShare) {
      toggleShared(currentEvent.id);
    }

    // Track sorting
    setSortedIds((prev) => new Set([...prev, currentEvent.id]));
    setSortedCount((prev) => prev + 1);
    if (shouldShare) {
      setSharedCount((prev) => prev + 1);
    }

    // Move to next
    if (currentIndex < totalCount - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleComplete = () => {
    navigation.goBack();
  };

  // Handle empty state
  if (totalCount === 0 && !isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>予定の振り分け</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>📅</Text>
          <Text style={styles.completeTitle}>予定がありません</Text>
          <Text style={styles.completeDescription}>
            振り分ける予定がありません
          </Text>
          <Button
            title="戻る"
            onPress={handleComplete}
            style={styles.completeButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>✅</Text>
          <Text style={styles.completeTitle}>振り分け完了！</Text>
          <Text style={styles.completeDescription}>
            {sharedCount}件の予定を共有設定にしました
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => setIsComplete(true)}
        >
          <Text style={styles.skipButtonText}>スキップして完了</Text>
        </TouchableOpacity>
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
  backButton: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  skipButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
