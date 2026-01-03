import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { Avatar, Button } from '../../components';
import { useAuth } from '../../store';

export default function ProfileEditScreen() {
  const navigation = useNavigation();
  const { user, signIn } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Update user in backend
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (user) {
        await signIn({ ...user, name: name.trim() });
      }

      Alert.alert('成功', 'プロフィールを更新しました', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('エラー', '更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    // TODO: Implement image picker
    Alert.alert('準備中', 'アイコン変更機能は準備中です');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButton}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>プロフィール</Text>
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
              保存
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.avatarSection}>
            <Avatar
              name={name || user?.name}
              imageUrl={user?.avatarUrl}
              size="xl"
            />
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={handleChangeAvatar}
            >
              <Text style={styles.changeAvatarText}>アイコンを変更</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>名前</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="名前を入力"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>メールアドレス</Text>
              <Text style={styles.readOnlyValue}>{user?.email || '未設定'}</Text>
              <Text style={styles.readOnlyHint}>
                メールアドレスは変更できません
              </Text>
            </View>

            {user?.googleId && (
              <View style={styles.connectedAccount}>
                <Text style={styles.connectedLabel}>連携中のアカウント</Text>
                <View style={styles.connectedItem}>
                  <Text style={styles.connectedIcon}>G</Text>
                  <Text style={styles.connectedText}>Googleアカウント</Text>
                </View>
              </View>
            )}

            {user?.lineId && (
              <View style={styles.connectedAccount}>
                <Text style={styles.connectedLabel}>連携中のアカウント</Text>
                <View style={styles.connectedItem}>
                  <Text style={[styles.connectedIcon, styles.lineIcon]}>L</Text>
                  <Text style={styles.connectedText}>LINEアカウント</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  changeAvatarButton: {
    marginTop: spacing.md,
  },
  changeAvatarText: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  form: {
    paddingHorizontal: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  readOnlyValue: {
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  readOnlyHint: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  connectedAccount: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  connectedLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  connectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  connectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4285F4',
    color: colors.background,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  lineIcon: {
    backgroundColor: '#06C755',
  },
  connectedText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
});
