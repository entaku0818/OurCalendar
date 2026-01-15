import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useAuth } from '../../store';
import { MainStackParamList } from '../../navigation/types';
import { APP_VERSION } from '../../utils/constants';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ title, subtitle, onPress, rightElement }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Text style={styles.chevron}>›</Text>)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>設定</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="プロフィール"
              subtitle="名前、アイコンを変更"
              onPress={() => navigation.navigate('ProfileEdit')}
            />
            <SettingItem
              title="プランを変更"
              subtitle="無料プラン"
              onPress={() => Alert.alert('準備中', 'この機能は準備中です')}
            />
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カレンダー</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Googleカレンダー連携"
              subtitle={user?.email ? `連携中: ${user.email}` : '未連携'}
              onPress={() => Alert.alert('準備中', 'この機能は準備中です')}
            />
            <SettingItem
              title="予定の振り分け"
              subtitle="共有/非公開を再設定"
              onPress={() => navigation.navigate('ResortEvents')}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="プッシュ通知"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              }
            />
            <SettingItem
              title="通知設定"
              subtitle="リマインダー、グループ通知"
              onPress={() => navigation.navigate('NotificationSettings')}
            />
          </View>
        </View>

        {/* Other Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>その他</Text>
          <View style={styles.sectionContent}>
            <SettingItem title="利用規約" onPress={() => Alert.alert('準備中', 'この機能は準備中です')} />
            <SettingItem title="プライバシーポリシー" onPress={() => Alert.alert('準備中', 'この機能は準備中です')} />
            <SettingItem title="お問い合わせ" onPress={() => Alert.alert('準備中', 'この機能は準備中です')} />
            <SettingItem title="バージョン" subtitle={APP_VERSION} />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: colors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chevron: {
    fontSize: fontSize.xl,
    color: colors.textLight,
  },
  logoutButton: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: '600',
  },
});
