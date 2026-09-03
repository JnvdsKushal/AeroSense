import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/tokens';

/**
 * Placeholder — establishes the auth navigation route and screen file so
 * `AuthNavigator` has somewhere real to point at. The full login form
 * (company name / email / password fields, submit handling, validation,
 * and error display wired to `useAuthStore().login`) is Module 1 scope per
 * the module plan (brief Section 36), not Module 0's foundation work.
 */
export const LoginScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>AERO-SENSE</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>
          Login form arrives in Module 1. This screen currently only proves the navigation
          architecture (auth vs. app stacks) is wired correctly.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    marginTop: spacing.sm,
  },
});
