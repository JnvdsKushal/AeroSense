import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../../theme/tokens';
import { StatusTone, TONE_COLORS } from '../../theme/status';

interface StatusIndicatorProps {
  title: string;
  subtitle?: string;
  tone: StatusTone;
  icon?: React.ReactNode;
}

/** Prominent result callout — used for the verification/scan result screen
 * and other "here's the outcome" moments where a small Badge isn't enough
 * visual weight. */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ title, subtitle, tone, icon }) => {
  const { fg, bg } = TONE_COLORS[tone];

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: fg + '40' }]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.title, { color: fg }]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.md,
    color: '#C7D3DE',
    textAlign: 'center',
  },
});
