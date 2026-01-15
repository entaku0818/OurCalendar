import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList, OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { APP_NAME } from '../../utils/constants';
import { useGroups } from '../../store';

type Props = OnboardingScreenProps<'InviteMembers'>;
type RouteProps = RouteProp<OnboardingStackParamList, 'InviteMembers'>;

export default function InviteMembersScreen() {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<RouteProps>();
  const { getGroupById } = useGroups();

  const { groupId } = route.params;
  const group = getGroupById(groupId);
  const inviteCode = group?.inviteCode || 'XXXXXX';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${APP_NAME}に参加しませんか？\n招待コード: ${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('コピーしました', '招待コードをクリップボードにコピーしました');
  };

  const handleNext = () => {
    navigation.navigate('Complete');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>メンバーを招待</Text>
        <Text style={styles.description}>
          招待コードを共有して、家族やグループメンバーを招待しましょう。
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>招待コード</Text>
          <Text style={styles.code}>{inviteCode}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
            <Text style={styles.copyButtonText}>コピー</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>招待リンクを共有</Text>
        </TouchableOpacity>

        <View style={styles.methodsContainer}>
          <Text style={styles.methodsTitle}>他の方法で招待</Text>
          <TouchableOpacity style={styles.methodItem} onPress={handleShare}>
            <Text style={styles.methodText}>LINEで送る</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.methodItem} onPress={handleShare}>
            <Text style={styles.methodText}>メールで送る</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>完了</Text>
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
  codeContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  code: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  copyButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  copyButtonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  shareButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
  methodsContainer: {
    gap: spacing.sm,
  },
  methodsTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  methodItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  methodText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  buttonContainer: {
    paddingBottom: spacing.xl,
  },
  nextButton: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
});
