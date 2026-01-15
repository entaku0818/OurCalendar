import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { storageService, NotificationSettings } from '../../services/storage';

interface SettingRowProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingRow({ title, description, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    eventReminder: true,
    newEvent: true,
    eventUpdate: true,
    memberJoined: true,
    dailySummary: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const appSettings = await storageService.getSettings();
      setSettings(appSettings.notifications);
    };
    loadSettings();
  }, []);

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const appSettings = await storageService.getSettings();
    await storageService.setSettings({
      ...appSettings,
      notifications: newSettings,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>通知設定</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>全般</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              title="プッシュ通知"
              description="すべての通知をオン/オフ"
              value={settings.pushEnabled}
              onValueChange={(v) => updateSetting('pushEnabled', v)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>予定</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              title="リマインダー"
              description="予定の30分前に通知"
              value={settings.eventReminder}
              onValueChange={(v) => updateSetting('eventReminder', v)}
            />
            <SettingRow
              title="新しい予定"
              description="グループに予定が追加されたとき"
              value={settings.newEvent}
              onValueChange={(v) => updateSetting('newEvent', v)}
            />
            <SettingRow
              title="予定の変更"
              description="予定が変更・削除されたとき"
              value={settings.eventUpdate}
              onValueChange={(v) => updateSetting('eventUpdate', v)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>グループ</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              title="メンバー参加"
              description="新しいメンバーが参加したとき"
              value={settings.memberJoined}
              onValueChange={(v) => updateSetting('memberJoined', v)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>その他</Text>
          <View style={styles.sectionContent}>
            <SettingRow
              title="毎日のまとめ"
              description="朝8時に今日の予定を通知"
              value={settings.dailySummary}
              onValueChange={(v) => updateSetting('dailySummary', v)}
            />
          </View>
        </View>
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
