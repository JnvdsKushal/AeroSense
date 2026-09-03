import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, minTouchTarget, radius, spacing, typography } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<Variant, { bg: string; bgPressed: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, bgPressed: colors.primaryPressed, fg: colors.textInverse },
  secondary: { bg: colors.surfaceRaised, bgPressed: colors.border, fg: colors.textPrimary, border: colors.border },
  ghost: { bg: 'transparent', bgPressed: colors.surfaceRaised, fg: colors.textPrimary },
  destructive: { bg: colors.critical, bgPressed: '#D9463C', fg: colors.textInverse },
};

/** Primary touch-friendly action control. Every button in the app should
 * use this rather than a bare TouchableOpacity, so touch-target size,
 * disabled/loading states, and variant colors stay consistent. */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}) => {
  const v = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={0.8}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
          minHeight: size === 'lg' ? 52 : minTouchTarget,
          paddingHorizontal: size === 'lg' ? spacing.xl : spacing.lg,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { color: v.fg, fontSize: size === 'lg' ? typography.size.lg : typography.size.md },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  label: {
    fontWeight: typography.weight.semibold,
  },
});
