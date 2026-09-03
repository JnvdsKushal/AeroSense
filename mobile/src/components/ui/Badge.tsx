import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../../theme/tokens';
import { StatusTone, TONE_COLORS } from '../../theme/status';

interface BadgeProps {
  label: string;
  tone?: StatusTone;
  mono?: boolean;
}

/** Small pill for status/result labels (AUTHENTIC, TAMPERED, PASSED, ...).
 * Mirrors the web app's Badge tone system (verified/warning/critical/info/
 * neutral) — see `theme/status.ts`. */
export const Badge: React.FC<BadgeProps> = ({ label, tone = 'neutral', mono = false }) => {
  const { fg, bg } = TONE_COLORS[tone];

  return (
    <View style={[styles.base, { backgroundColor: bg, borderColor: fg + '33' }]}>
      <Text style={[styles.label, { color: fg }, mono && styles.mono]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: typography.family.mono,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
