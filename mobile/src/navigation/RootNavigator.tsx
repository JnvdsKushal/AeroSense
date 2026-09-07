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
 * `idle`/`bootstrapping` shows a bootstrap spinner while the stored token (if
 * any) is being validated, `authenticated` shows the app shell, everything
 * else (including the `loading` state while the login form submits) shows the
 * auth stack.
 *
 * FIX: Previously 'loading' (login in progress) was conflated with
 * 'bootstrapping' (initial session restore), causing the NavigationContainer
 * to unmount and remount every time the user pressed Sign in. This would race
 * with re-mounting the AppNavigator and could swallow the authenticated state
 * transition in certain timing windows.
 *
 * Now only 'idle' and 'bootstrapping' trigger the full-screen spinner — the
 * NavigationContainer stays mounted throughout the login flow. The login
 * button's own `loading` prop (driven by `status === 'loading'`) handles the
 * in-form loading indicator without destroying the navigation tree.
 */
export const RootNavigator: React.FC = () => {
  const { status, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  console.log('[NAV] NAVIGATION AUTH STATE: status =', status);

  // Only show the full-screen spinner during the initial session restore.
  // The login form handles its own loading state while status === 'loading'.
  if (status === 'idle' || status === 'bootstrapping') {
    return <LoadingState message="Checking your session…" />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
