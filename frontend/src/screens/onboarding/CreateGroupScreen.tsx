import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useGroups, useAuth } from '../../store';

type Props = OnboardingScreenProps<'CreateGroup'>;

export default function CreateGroupScreen() {
  const navigation = useNavigation<Props['navigation']>();
  const { createGroup } = useGroups();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim() || !user) return;

    setIsLoading(true);
    try {
      const group = await createGroup(groupName.trim(), user.id);
      navigation.navigate('InviteMembers', { groupId: group.id });
    } catch (error) {
      Alert.alert('エラー', 'グループの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Complete');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>グループを作成</Text>
        <Text style={styles.description}>
          家族や友達とカレンダーを共有するためのグループを作成しましょう。
        </Text>

        <TextInput
          style={styles.input}
          placeholder="グループ名を入力"
          placeholderTextColor={colors.textLight}
          value={groupName}
          onChangeText={setGroupName}
        />

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>おすすめ:</Text>
          {['我が家', '家族', 'ファミリー'].map((name) => (
            <TouchableOpacity
              key={name}
              style={styles.suggestionChip}
              onPress={() => setGroupName(name)}
            >
              <Text style={styles.suggestionText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, (!groupName.trim() || isLoading) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!groupName.trim() || isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? '作成中...' : 'グループを作成'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>後で作成</Text>
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  suggestionText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  buttonContainer: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  createButtonText: {
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
