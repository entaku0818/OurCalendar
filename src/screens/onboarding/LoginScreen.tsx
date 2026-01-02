import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { APP_NAME } from '../../utils/constants';

type Props = OnboardingScreenProps<'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Props['navigation']>();

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
    navigation.navigate('GoogleConnect');
  };

  const handleLineLogin = () => {
    // TODO: Implement LINE login
    navigation.navigate('GoogleConnect');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>ログインして始めましょう</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.googleButtonText}>Googleでログイン</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.lineButton} onPress={handleLineLogin}>
          <Text style={styles.lineButtonText}>LINEでログイン</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        ログインすることで利用規約とプライバシーポリシーに同意したものとみなされます
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  buttonContainer: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  googleButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  lineButton: {
    backgroundColor: '#06C755',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  lineButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
  terms: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    paddingBottom: spacing.xl,
  },
});
