import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useGoogleCalendar } from '../../hooks';
import { useEvents } from '../../store';
import { storageService } from '../../services';

type Props = OnboardingScreenProps<'GoogleConnect'>;

export default function GoogleConnectScreen() {
  const navigation = useNavigation<Props['navigation']>();
  const [isConnecting, setIsConnecting] = useState(false);
  const { setAccessToken, fetchEvents, isLoading } = useGoogleCalendar();
  const { syncFromGoogle } = useEvents();

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Get access token from storage (saved during login)
      const accessToken = await storageService.getAccessToken();

      if (!accessToken) {
        Alert.alert('エラー', '再度ログインしてください');
        setIsConnecting(false);
        return;
      }

      // Set token and fetch events
      setAccessToken(accessToken);
      const events = await fetchEvents(30);

      if (events.length > 0) {
        // Store events for swipe sorting
        syncFromGoogle(events);
        navigation.navigate('SwipeSort');
      } else {
        // No events to sort, skip to group creation
        Alert.alert(
          '予定がありません',
          '今後1ヶ月の予定がありませんでした。',
          [{ text: 'OK', onPress: () => navigation.navigate('CreateGroup') }]
        );
      }
    } catch (error) {
      Alert.alert('エラー', 'カレンダーの連携に失敗しました');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('CreateGroup');
  };

  const loading = isConnecting || isLoading;

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
        <TouchableOpacity
          style={[styles.connectButton, loading && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.connectButtonText}>Googleカレンダーを連携</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
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
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
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
