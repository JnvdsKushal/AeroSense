import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { ROLE_LABELS } from '../../constants/roles';

/**
 * Placeholder authenticated landing screen. Proves the root navigator
 * correctly switches from the auth stack to the app shell once a session
 * exists, and that role data from the real `/api/auth/me` response is
 * available to screens via `useAuthStore`. Role-specific dashboards with
 * real backend data are Module 2 scope (brief Section 37) — this screen
 * intentionally shows no metrics, fabricated or otherwise.
 */
export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>AERO-SENSE</Text>
        <Text style={styles.title}>Signed in</Text>
        {user ? (
          <Text style={styles.subtitle}>
            {user.name} · {ROLE_LABELS[user.role]}
          </Text>
        ) : null}
        <Text style={styles.note}>
          Role-based dashboards, fleet views, and the verification scanner are built in the
          modules that follow. This screen only confirms the authenticated navigation shell and
          session state are working end-to-end against the real backend.
        </Text>
        <Button label="Log Out" variant="secondary" onPress={() => logout()} style={styles.logout} />
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
    padding: spacing.xl,
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
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
  },
  note: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    marginTop: spacing.md,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  logout: {
    marginTop: spacing.xl,
  },
});
