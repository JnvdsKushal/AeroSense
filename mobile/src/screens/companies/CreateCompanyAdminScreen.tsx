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
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';

import { companiesApi } from '../../api/companies';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, spacing, typography } from '../../theme/tokens';
import type { CompanyStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<CompanyStackParamList>;
type Route = RouteProp<CompanyStackParamList, 'CreateCompanyAdmin'>;

/**
 * Super Admin: Provision the first Company Admin for a company.
 * POST /api/companies/:id/admins — { name, email, password }
 *
 * The provisioned user is created as COMPANY_ADMIN role in the users table
 * with company_id = the given company's ID.
 *
 * Database: Inserts into `users` table.
 * Fields: id, uuid, name, email, password_hash, role=COMPANY_ADMIN,
 *         company_id=<companyId>, created_at.
 */
export const CreateCompanyAdminScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { companyId } = route.params;
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      companiesApi.createAdmin(companyId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company', companyId, 'users'] });
      qc.invalidateQueries({ queryKey: ['company', companyId] });
      setSuccess(true);
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

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>✓ Admin Created</Text>
          <Text style={styles.successText}>
            Company Admin account created successfully. They can now sign in
            with their email and password using this company's name.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
          >
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
        <Text style={styles.navTitle}>Provision Company Admin</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.hint}>
            Creates the first Company Admin for this tenant. The admin can then
            independently manage their company's users, fleet, and operations.
          </Text>

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
              placeholder="admin@company.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(null); }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!mutation.isPending}
            />
            <Input
              label="Password *"
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(null); }}
              secureTextEntry={!showPwd}
              editable={!mutation.isPending}
            />
            <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
              <Text style={styles.togglePwd}>{showPwd ? 'Hide' : 'Show'} password</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Creating…' : 'Provision Admin'}
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
  hint: { color: colors.textMuted, fontSize: typography.size.sm, lineHeight: typography.size.sm * 1.5, marginBottom: spacing.xl },
  form: { gap: spacing.lg },
  togglePwd: { color: colors.primary, fontSize: typography.size.sm, textAlign: 'right', marginTop: -spacing.sm },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
  successContainer: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  successTitle: { color: colors.verified, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  successText: { color: colors.textSecondary, fontSize: typography.size.md, textAlign: 'center', lineHeight: typography.size.md * 1.5 },
  doneBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.lg },
  doneBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
