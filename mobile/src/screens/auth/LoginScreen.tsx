import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { useAuthStore } from '../../store/authStore';
import {
  colors,
  minTouchTarget,
  radius,
  spacing,
  typography,
} from '../../theme/tokens';

interface FieldErrors {
  companyName?: string;
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitting = status === 'loading';

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!companyName.trim()) {
      next.companyName = 'Company name is required.';
    }

    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!password) {
      next.password = 'Password is required.';
    }

    return next;
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await login({
        company_name: companyName.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      setSubmitError(normalizeApiError(error).message);
    }
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });

    setSubmitError(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>A</Text>
            </View>

            <View>
              <Text style={styles.eyebrow}>AERO-SENSE</Text>
              <Text style={styles.brandSubtitle}>
                Aircraft component intelligence
              </Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Sign in to securely access your fleet, components, verification
              records, and operational intelligence.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Company name"
              placeholder="Enter your company name"
              value={companyName}
              onChangeText={(value) => {
                setCompanyName(value);
                clearFieldError('companyName');
              }}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="organization"
              returnKeyType="next"
              error={errors.companyName}
              editable={!submitting}
            />

            <Input
              label="Email ID"
              placeholder="you@company.com"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                clearFieldError('email');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              error={errors.email}
              editable={!submitting}
            />

            <View>
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  clearFieldError('password');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                error={errors.password}
                editable={!submitting}
                style={styles.passwordInput}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? 'Hide password' : 'Show password'
                }
                onPress={() => setShowPassword((value) => !value)}
                disabled={submitting}
                style={styles.showPasswordButton}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            {submitError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorTitle}>Sign in failed</Text>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            ) : null}

            <Button
              label="Sign in"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              fullWidth
            />

            <View style={styles.securityNote}>
              <Text style={styles.securityDot}>●</Text>

              <Text style={styles.securityText}>
                Your session is stored securely on this device.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkText: {
    color: colors.accent,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },

  eyebrow: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.5,
  },

  brandSubtitle: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
  },

  hero: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },

  title: {
    color: colors.textPrimary,
    fontSize: typography.size.display,
    lineHeight:
      typography.size.display * typography.lineHeight.tight,
    fontWeight: typography.weight.bold,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    lineHeight:
      typography.size.md * typography.lineHeight.normal,
  },

  form: {
    gap: spacing.lg,
  },

  passwordInput: {
    paddingRight: 72,
  },

  showPasswordButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.xs,
    minHeight: minTouchTarget,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  showPasswordText: {
    color: colors.accent,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },

  errorBanner: {
    borderWidth: 1,
    borderColor: colors.critical,
    backgroundColor: colors.criticalMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },

  errorTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },

  errorText: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    lineHeight:
      typography.size.sm * typography.lineHeight.normal,
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  securityDot: {
    color: colors.verified,
    fontSize: 8,
  },

  securityText: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    textAlign: 'center',
  },
});