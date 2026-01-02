import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, fontSize } from '../utils/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  backgroundColor?: string;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizeMap = {
  sm: fontSize.xs,
  md: fontSize.md,
  lg: fontSize.xl,
  xl: 32,
};

export default function Avatar({
  name,
  imageUrl,
  size = 'md',
  style,
  backgroundColor = colors.secondary,
}: AvatarProps) {
  const dimension = sizeMap[size];
  const textSize = fontSizeMap[size];
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  const containerStyle = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
      backgroundColor,
    },
    style,
  ];

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[containerStyle, styles.image]}
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.initial, { fontSize: textSize }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initial: {
    color: colors.background,
    fontWeight: 'bold',
  },
});
