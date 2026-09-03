import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Shown when a real API call succeeded but returned zero items. Never
 * shown in place of a loading or error state — those are distinct
 * (`LoadingState`, `ErrorState`). No fabricated placeholder data is ever
 * substituted here. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionLabel, onAction }) => (
  <View style={styles.container}>
    {icon}
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {actionLabel && onAction ? (
      <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});
