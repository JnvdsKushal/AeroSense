import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}

/** Consistent header used at the top of every screen's content area —
 * mirrors the web app's PageHeader (eyebrow + title + optional action)
 * translated to a mobile-first layout. */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ eyebrow, title, action }) => (
  <View style={styles.container}>
    <View style={styles.textBlock}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
    </View>
    {action}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  textBlock: {
    flexShrink: 1,
  },
  eyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
});
