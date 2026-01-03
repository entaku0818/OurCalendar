import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { FREE_PLAN, PRO_PLAN, FAMILY_PLAN } from '../../utils/constants';

interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

function PlanCard({
  name,
  price,
  features,
  isCurrentPlan,
  isRecommended,
  onSelect,
}: PlanCardProps) {
  return (
    <View
      style={[
        styles.planCard,
        isRecommended && styles.recommendedCard,
        isCurrentPlan && styles.currentPlanCard,
      ]}
    >
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>おすすめ</Text>
        </View>
      )}

      <Text style={styles.planName}>{name}</Text>
      <Text style={styles.planPrice}>{price}</Text>

      <View style={styles.featureList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          isCurrentPlan && styles.currentButton,
        ]}
        onPress={onSelect}
        disabled={isCurrentPlan}
      >
        <Text
          style={[
            styles.selectButtonText,
            isCurrentPlan && styles.currentButtonText,
          ]}
        >
          {isCurrentPlan ? '現在のプラン' : '選択する'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlanScreen() {
  const navigation = useNavigation();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'family'>('free');

  const handleSelectPlan = (plan: 'free' | 'pro' | 'family') => {
    if (plan === 'free') {
      Alert.alert('確認', '無料プランにダウングレードしますか？', [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'OK', onPress: () => setCurrentPlan(plan) },
      ]);
    } else {
      // TODO: Implement in-app purchase
      Alert.alert('準備中', '課金機能は準備中です');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プラン</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>プランを選択</Text>
        <Text style={styles.description}>
          あなたに合ったプランをお選びください
        </Text>

        <PlanCard
          name="無料プラン"
          price="¥0"
          features={[
            `グループ ${FREE_PLAN.maxGroups}つまで`,
            `メンバー ${FREE_PLAN.maxMembersPerGroup}人まで`,
            'Googleカレンダー連携',
            '広告あり',
          ]}
          isCurrentPlan={currentPlan === 'free'}
          onSelect={() => handleSelectPlan('free')}
        />

        <PlanCard
          name="Proプラン"
          price={`¥${PRO_PLAN.priceMonthly}/月`}
          features={[
            'グループ無制限',
            `メンバー ${PRO_PLAN.maxMembersPerGroup}人/グループ`,
            '複数Googleアカウント連携',
            '広告なし',
            'カスタムテーマ',
          ]}
          isCurrentPlan={currentPlan === 'pro'}
          isRecommended
          onSelect={() => handleSelectPlan('pro')}
        />

        <PlanCard
          name="Familyプラン"
          price={`¥${FAMILY_PLAN.priceMonthly}/月`}
          features={[
            'グループ無制限',
            'メンバー無制限',
            `最大${FAMILY_PLAN.maxSharedMembers}人でプラン共有`,
            '全Pro機能',
            '優先サポート',
          ]}
          isCurrentPlan={currentPlan === 'family'}
          onSelect={() => handleSelectPlan('family')}
        />

        <Text style={styles.note}>
          ※ プランはいつでも変更・解約できます
        </Text>
      </ScrollView>
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
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommendedCard: {
    borderColor: colors.primary,
  },
  currentPlanCard: {
    borderColor: colors.success,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  recommendedText: {
    fontSize: fontSize.xs,
    color: colors.background,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  planPrice: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  featureList: {
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureCheck: {
    fontSize: fontSize.md,
    color: colors.success,
    marginRight: spacing.sm,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  selectButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  currentButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  selectButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
  currentButtonText: {
    color: colors.textSecondary,
  },
  note: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
