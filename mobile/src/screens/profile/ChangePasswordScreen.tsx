import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';

import { authApi } from '../../api/auth';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, spacing, typography } from '../../theme/tokens';
import type { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

/**
 * Change password screen.
 * POST /api/auth/password — { current_password, new_password }
 * Requires re-verification of the current password server-side.
 * The user identity comes from the JWT — never from the request body.
 */
export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err) => {
      setError(normalizeApiError(err).message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!currentPassword) { setError('Current password is required.'); return; }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    mutation.mutate();
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🔐</Text>
          <Text style={styles.successTitle}>Password Changed</Text>
          <Text style={styles.successText}>
            Your password has been updated successfully.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View>
              <Input
                label="Current Password *"
                placeholder="Your current password"
                value={currentPassword}
                onChangeText={(v) => { setCurrentPassword(v); setError(null); }}
                secureTextEntry={!showCurrent}
                editable={!mutation.isPending}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent((v) => !v)}
                style={styles.showToggle}
              >
                <Text style={styles.showToggleText}>{showCurrent ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Input
                label="New Password *"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChangeText={(v) => { setNewPassword(v); setError(null); }}
                secureTextEntry={!showNew}
                editable={!mutation.isPending}
              />
              <TouchableOpacity
                onPress={() => setShowNew((v) => !v)}
                style={styles.showToggle}
              >
                <Text style={styles.showToggleText}>{showNew ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Confirm New Password *"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setError(null); }}
              secureTextEntry={!showNew}
              editable={!mutation.isPending}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Updating…' : 'Change Password'}
              onPress={handleSubmit}
              disabled={mutation.isPending}
              loading={mutation.isPending}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, textAlign: 'center' },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  form: { gap: spacing.lg },
  showToggle: { position: 'absolute', right: spacing.sm, bottom: spacing.xs + 2, paddingHorizontal: spacing.sm },
  showToggleText: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
  successContainer: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  successIcon: { fontSize: 48 },
  successTitle: { color: colors.verified, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  successText: { color: colors.textSecondary, fontSize: typography.size.md, textAlign: 'center' },
  doneBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  doneBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
