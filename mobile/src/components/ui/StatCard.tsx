import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  /** Optional semantic color for the value */
  valueColor?: string;
  style?: ViewStyle;
}

/**
 * Single metric tile used on dashboards. Shows a numeric or text value
 * with a label underneath.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  valueColor,
  style,
}) => (
  <View style={[styles.card, style]}>
    <Text style={[styles.value, valueColor ? { color: valueColor } : undefined]}>
      {value}
    </Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  value: {
    color: colors.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
