import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';
import { Button } from './Button';
import type { NormalizedApiError } from '../../api/apiError';
import { SYNTHETIC_ERROR_CODES } from '../../api/apiError';

interface ErrorStateProps {
  error: NormalizedApiError;
  onRetry?: () => void;
}

/** Renders a `NormalizedApiError` (see `api/apiError.ts`) with an
 * appropriate title per failure class (network vs. timeout vs. server) and
 * an optional retry action. Every screen that calls the API should render
 * this on failure rather than a generic/blank error. */
export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const title =
    error.code === SYNTHETIC_ERROR_CODES.NETWORK_ERROR
      ? 'No connection'
      : error.code === SYNTHETIC_ERROR_CODES.TIMEOUT
      ? 'Request timed out'
      : 'Something went wrong';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{error.message}</Text>
      {onRetry ? <Button label="Try Again" onPress={onRetry} variant="secondary" style={styles.action} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    color: colors.critical,
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
