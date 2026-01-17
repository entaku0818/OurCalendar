import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = memo(function Card({
  children,
  style,
  onPress,
  variant = 'default',
}: CardProps) {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
});

export default Card;

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  elevated: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
