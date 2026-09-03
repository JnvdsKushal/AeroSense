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

import { companiesApi } from '../../api/companies';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, spacing, typography } from '../../theme/tokens';
import type { CompanyStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<CompanyStackParamList>;

/**
 * Super Admin: Create a new aviation company.
 * POST /api/companies — { name, slug? }
 * On success, navigates to the new company's detail screen.
 *
 * Database: Inserts into `companies` table.
 * Fields: id, uuid (auto), name, slug (auto from name if omitted), status=ACTIVE,
 *         created_at, updated_at.
 */
export const CreateCompanyScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      companiesApi.create({ name: name.trim(), slug: slug.trim() || undefined }),
    onSuccess: (company) => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      navigation.replace('CompanyDetail', { companyId: company.id });
    },
    onError: (err) => {
      setError(normalizeApiError(err).message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }
    mutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create Company</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.hint}>
            Creates a new aviation company (tenant) on the platform. The company
            will be ACTIVE immediately and will appear in the company list.
          </Text>

          <View style={styles.form}>
            <Input
              label="Company Name *"
              placeholder="e.g. Skyline Aviation Ltd."
              value={name}
              onChangeText={(v) => { setName(v); setError(null); }}
              autoCapitalize="words"
              editable={!mutation.isPending}
            />
            <Input
              label="URL Slug (optional)"
              placeholder="e.g. skyline-aviation (auto-generated if empty)"
              value={slug}
              onChangeText={(v) => { setSlug(v); setError(null); }}
              autoCapitalize="none"
              editable={!mutation.isPending}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Creating…' : 'Create Company'}
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
  hint: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * 1.5,
    marginBottom: spacing.xl,
  },
  form: { gap: spacing.lg },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
});
