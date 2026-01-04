import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingScreenProps } from '../../navigation/types';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { APP_NAME } from '../../utils/constants';
import { useGoogleAuth, useLineAuth } from '../../hooks';
import { useAuth } from '../../store';

type Props = OnboardingScreenProps<'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Props['navigation']>();
  const { signIn: authSignIn } = useAuth();
  const { isLoading: googleLoading, isReady: googleReady, signIn: googleSignIn } = useGoogleAuth();
  const { isLoading: lineLoading, isReady: lineReady, signIn: lineSignIn } = useLineAuth();

  const handleGoogleLogin = async () => {
    const result = await googleSignIn();

    if (result) {
      await authSignIn(result.user, result.accessToken);
      navigation.navigate('GoogleConnect');
    }
  };

  const handleLineLogin = async () => {
    const result = await lineSignIn();

    if (result) {
      await authSignIn(result.user, result.accessToken);
      navigation.navigate('GoogleConnect');
    }
  };

  const isLoading = googleLoading || lineLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>ログインして始めましょう</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.googleButton, !googleReady && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isLoading || !googleReady}
        >
          {googleLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.googleButtonText}>Googleでログイン</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.lineButton, !lineReady && styles.buttonDisabled]}
          onPress={handleLineLogin}
          disabled={isLoading || !lineReady}
        >
          {lineLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.lineButtonText}>LINEでログイン</Text>
          )}
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
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
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
    minHeight: 50,
    justifyContent: 'center',
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
