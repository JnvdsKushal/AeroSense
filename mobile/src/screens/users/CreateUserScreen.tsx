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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';

import { usersApi } from '../../api/users';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { ROLE_LABELS } from '../../constants/roles';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { UserStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<UserStackParamList>;

// Company Admin can create any role EXCEPT SUPER_ADMIN.
// Backend enforces this — frontend just provides a picker.
const CREATABLE_ROLES = [
  'COMPANY_ADMIN',
  'MANUFACTURER',
  'MAINTENANCE_TECHNICIAN',
  'INSPECTOR',
  'VIEWER',
] as const;

/**
 * Company Admin: create a new user in their company.
 * POST /api/users — { name, email, password, role }
 * company_id always comes from the admin's JWT — never sent by client.
 *
 * Database: Inserts into `users` table.
 * Fields: id, uuid, name, email, password_hash, role, company_id=<admin's company>,
 *         created_at.
 * Verification: SELECT * FROM users WHERE email = '<email>';
 */
export const CreateUserScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState<string>('MANUFACTURER');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; role: string } | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      usersApi.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      }),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setCreated({ name: user.name, role: user.role });
    },
    onError: (err) => {
      setError(normalizeApiError(err).message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    mutation.mutate();
  };

  if (created) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>User Created</Text>
          <Text style={styles.successText}>
            <Text style={styles.bold}>{created.name}</Text> has been added as{' '}
            <Text style={styles.bold}>
              {ROLE_LABELS[created.role as keyof typeof ROLE_LABELS] ?? created.role}
            </Text>
            .{'\n\n'}They can sign in with their email and password.
          </Text>
          <TouchableOpacity
            style={styles.anotherBtn}
            onPress={() => {
              setName(''); setEmail(''); setPassword(''); setRole('MANUFACTURER');
              setCreated(null);
            }}
          >
            <Text style={styles.anotherBtnText}>Add Another User</Text>
          </TouchableOpacity>
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
        <Text style={styles.navTitle}>Create User</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Input
              label="Full Name *"
              placeholder="Jane Smith"
              value={name}
              onChangeText={(v) => { setName(v); setError(null); }}
              autoCapitalize="words"
              editable={!mutation.isPending}
            />
            <Input
              label="Email *"
              placeholder="user@company.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!mutation.isPending}
            />

            <View>
              <Input
                label="Password *"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={(v) => { setPassword(v); setError(null); }}
                secureTextEntry={!showPwd}
                editable={!mutation.isPending}
              />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)} style={styles.showPwd}>
                <Text style={styles.showPwdText}>{showPwd ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            {/* Role picker */}
            <View>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleGrid}>
                {CREATABLE_ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChip, role === r && styles.roleChipSelected]}
                    onPress={() => { setRole(r); setError(null); }}
                    disabled={mutation.isPending}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        role === r && styles.roleChipTextSelected,
                      ]}
                    >
                      {ROLE_LABELS[r as keyof typeof ROLE_LABELS]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Creating…' : 'Create User'}
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  form: { gap: spacing.lg },
  showPwd: { position: 'absolute', right: spacing.sm, bottom: spacing.xs + 2, paddingHorizontal: spacing.sm },
  showPwdText: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  label: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginBottom: spacing.sm },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleChipSelected: { borderColor: colors.primary, backgroundColor: colors.accentMuted },
  roleChipText: { color: colors.textSecondary, fontSize: typography.size.sm },
  roleChipTextSelected: { color: colors.primary, fontWeight: typography.weight.semibold },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
  successContainer: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  successIcon: { color: colors.verified, fontSize: 48 },
  successTitle: { color: colors.verified, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  successText: { color: colors.textSecondary, fontSize: typography.size.md, textAlign: 'center', lineHeight: typography.size.md * 1.6 },
  bold: { fontWeight: typography.weight.bold, color: colors.textPrimary },
  anotherBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  anotherBtnText: { color: colors.textSecondary, fontSize: typography.size.md },
  doneBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  doneBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
