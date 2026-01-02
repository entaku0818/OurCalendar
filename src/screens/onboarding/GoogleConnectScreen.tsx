import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';

type Props = OnboardingScreenProps<'GoogleConnect'>;

export default function GoogleConnectScreen() {
  const navigation = useNavigation<Props['navigation']>();

  const handleConnect = () => {
    // TODO: Implement Google Calendar API connection
    navigation.navigate('SwipeSort');
  };

  const handleSkip = () => {
    navigation.navigate('CreateGroup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Googleカレンダーと連携</Text>
        <Text style={styles.description}>
          Googleカレンダーと連携すると、既存の予定を取り込んでグループで共有できます。
        </Text>

        <View style={styles.features}>
          <Text style={styles.featureItem}>✓ 既存の予定を自動取り込み</Text>
          <Text style={styles.featureItem}>✓ 双方向同期</Text>
          <Text style={styles.featureItem}>✓ 共有/非公開をフリックで選択</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
          <Text style={styles.connectButtonText}>Googleカレンダーを連携</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>スキップ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  features: {
    gap: spacing.sm,
  },
  featureItem: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  buttonContainer: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  connectButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
