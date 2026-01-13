import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { CalendarEvent } from '../types';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { SWIPE_THRESHOLD } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeCardProps {
  event: CalendarEvent;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeCard({ event, onSwipe }: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const leftOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rightOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx, vx } = gesture;
        console.log(`[SwipeCard] Release: dx=${dx.toFixed(0)}, vx=${vx.toFixed(2)}, threshold=${SWIPE_THRESHOLD}`);
        console.log(`[SwipeCard] Right condition: ${dx} > ${SWIPE_THRESHOLD} = ${dx > SWIPE_THRESHOLD}`);
        console.log(`[SwipeCard] Left condition: ${dx} < -${SWIPE_THRESHOLD} = ${dx < -SWIPE_THRESHOLD}`);

        if (dx > SWIPE_THRESHOLD) {
          console.log('[SwipeCard] → Swiping RIGHT (共有)');
          swipeOut('right');
        } else if (dx < -SWIPE_THRESHOLD) {
          console.log('[SwipeCard] ← Swiping LEFT (非公開)');
          swipeOut('left');
        } else {
          console.log(`[SwipeCard] ↺ Reset (dx=${dx.toFixed(0)} didn't reach threshold)`);
          resetPosition();
        }
      },
    })
  ).current;

  const swipeOut = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    console.log(`[SwipeCard] swipeOut called: direction=${direction}, animating to x=${x}`);
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      console.log(`[SwipeCard] Animation complete, calling onSwipe(${direction})`);
      onSwipe(direction);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const resetPosition = () => {
    console.log('[SwipeCard] resetPosition called, returning to center');
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={[styles.label, styles.labelLeft, { opacity: leftOpacity }]}>
        <Text style={styles.labelText}>非公開</Text>
      </Animated.View>

      <Animated.View style={[styles.label, styles.labelRight, { opacity: rightOpacity }]}>
        <Text style={styles.labelText}>共有</Text>
      </Animated.View>

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{formatDate(event.startAt)}</Text>
      <Text style={styles.time}>
        {formatTime(event.startAt)} - {formatTime(event.endAt)}
      </Text>

      {event.isFromGoogle && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Google</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: 280,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    position: 'absolute',
    top: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  labelLeft: {
    left: spacing.lg,
    borderColor: colors.swipeLeft,
  },
  labelRight: {
    right: spacing.lg,
    borderColor: colors.swipeRight,
  },
  labelText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  date: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  badge: {
    position: 'absolute',
    bottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
