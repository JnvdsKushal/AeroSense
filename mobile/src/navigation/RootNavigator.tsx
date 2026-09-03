import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '../store/authStore';
import { LoadingState } from '../components/ui';
import { colors } from '../theme/tokens';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.textPrimary,
  },
};

/**
 * Root of the navigation tree. Branches purely on real session state from
 * `useAuthStore` (populated from `GET /api/auth/me`, never fabricated) —
 * `idle`/`loading` shows a bootstrap spinner while the stored token (if
 * any) is being validated, `unauthenticated` shows the auth stack,
 * `authenticated` shows the app shell.
 */
export const RootNavigator: React.FC = () => {
  const { status, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (status === 'idle' || status === 'loading') {
    return <LoadingState message="Checking your session…" />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
