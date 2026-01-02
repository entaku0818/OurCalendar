import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { APP_NAME } from '../../utils/constants';

export default function CompleteScreen() {
  const handleStart = () => {
    // TODO: Set onboarding complete flag and navigate to main
    // This would typically update app state/storage
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>準備完了！</Text>
        <Text style={styles.description}>
          {APP_NAME}の設定が完了しました。{'\n'}
          さっそくカレンダーを共有しましょう。
        </Text>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>予定を確認</Text>
              <Text style={styles.featureDescription}>
                ホーム画面でみんなの予定をチェック
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👆</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>フリックで振り分け</Text>
              <Text style={styles.featureDescription}>
                新しい予定はフリックで共有/非公開を選択
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👨‍👩‍👧‍👦</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>グループで共有</Text>
              <Text style={styles.featureDescription}>
                家族や友達と予定を共有
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>はじめる</Text>
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
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  features: {
    width: '100%',
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  buttonContainer: {
    paddingBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
});
