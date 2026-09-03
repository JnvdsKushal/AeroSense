import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
}

/** Base surface container used for list rows, dashboard tiles, and grouped
 * content. Renders as a pressable card when `onPress` is given. */
export const Card: React.FC<CardProps> = ({ children, onPress, style, padded = true }) => {
  const content = (
    <View style={[styles.base, padded && styles.padded, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
