import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, minTouchTarget, radius, spacing, typography } from '../../theme/tokens';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

/** Standard row for list screens (aircraft, components, maintenance
 * records, verification logs). Touch target always meets the minimum
 * tappable height. */
export const ListItem: React.FC<ListItemProps> = ({ title, subtitle, leading, trailing, onPress }) => {
  const content = (
    <View style={styles.row}>
      {leading}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={onPress} style={styles.pressable}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
};

const styles = StyleSheet.create({
  pressable: {
    minHeight: minTouchTarget,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
});
