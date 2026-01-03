import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { Button } from '../../components';

export default function JoinGroupScreen() {
  const navigation = useNavigation();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('エラー', '招待コードを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to join group
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success
      Alert.alert('成功', 'グループに参加しました', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('エラー', '招待コードが無効です');
    } finally {
      setIsLoading(false);
    }
  };

  const formatInviteCode = (text: string) => {
    // Convert to uppercase and remove non-alphanumeric
    return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 戻る</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>グループに参加</Text>
          <Text style={styles.description}>
            招待コードを入力して、グループに参加しましょう。
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="招待コード"
              placeholderTextColor={colors.textLight}
              value={inviteCode}
              onChangeText={(text) => setInviteCode(formatInviteCode(text))}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
          </View>

          <Text style={styles.hint}>
            招待コードは6文字の英数字です
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="参加する"
            onPress={handleJoin}
            loading={isLoading}
            disabled={inviteCode.length < 6}
            fullWidth
          />
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
