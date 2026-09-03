import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

interface LoadingStateProps {
  message?: string;
  /** When true, fills available space (use inside a screen body). When
   * false, renders compactly (use inline, e.g. below a button). */
  fullscreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading…', fullscreen = true }) => (
  <View style={[styles.container, fullscreen && styles.fullscreen]}>
    <ActivityIndicator color={colors.primary} size="large" />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  fullscreen: {
    flex: 1,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
  },
});
