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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Tag } from 'lucide-react-native';

import { tagsApi } from '../../api/tags';
import { componentsApi } from '../../api/components';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { VerificationStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<VerificationStackParamList>;

const TECHNOLOGY_OPTIONS = ['NFC', 'UHF_RFID'] as const;

/**
 * Register NFC/RFID tag to a component.
 * POST /api/tags/register — { component_id, technology, identifier, security_type? }
 * MANUFACTURER only (or COMPANY_ADMIN override).
 *
 * Database: Inserts into `component_tags` table.
 * Fields: id, component_id, technology, identifier, security_type,
 *         tamper_status='INTACT', company_id (from JWT), registered_at, updated_at.
 * Verification: SELECT * FROM component_tags WHERE identifier = '<id>';
 */
export const RegisterTagScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const [identifier, setIdentifier] = useState('');
  const [technology, setTechnology] = useState<string>('NFC');
  const [securityType, setSecurityType] = useState('MOCK');
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<{ identifier: string; componentSerial: string } | null>(null);

  const componentsQuery = useQuery({
    queryKey: ['components'],
    queryFn: componentsApi.list,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedComponentId) throw new Error('Select a component first.');
      return tagsApi.register({
        component_id: selectedComponentId,
        technology,
        identifier: identifier.trim(),
        security_type: securityType,
      });
    },
    onSuccess: (tag) => {
      const comp = componentsQuery.data?.find((c) => c.id === selectedComponentId);
      qc.invalidateQueries({ queryKey: ['components'] });
      setRegistered({ identifier: tag.identifier, componentSerial: comp?.serial_number ?? String(selectedComponentId) });
    },
    onError: (err) => {
      setError(normalizeApiError(err).message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!identifier.trim()) { setError('Tag identifier is required.'); return; }
    if (!selectedComponentId) { setError('Select a component to bind this tag to.'); return; }
    mutation.mutate();
  };

  if (registered) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Tag color={colors.verified} size={48} />
          <Text style={styles.successTitle}>Tag Registered</Text>
          <Text style={styles.successText}>
            Tag <Text style={styles.mono}>{registered.identifier}</Text> has been
            bound to component{' '}
            <Text style={styles.bold}>{registered.componentSerial}</Text>.{'\n\n'}
            Scan this tag to verify the component.
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

  const components = componentsQuery.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Register NFC Tag</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Input
              label="Tag Identifier *"
              placeholder="e.g. DEMO-NFC-0001 or 04:A3:91:XX"
              value={identifier}
              onChangeText={(v) => { setIdentifier(v); setError(null); }}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!mutation.isPending}
            />

            {/* Technology */}
            <View>
              <Text style={styles.label}>Technology</Text>
              <View style={styles.chipRow}>
                {TECHNOLOGY_OPTIONS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, technology === t && styles.chipSelected]}
                    onPress={() => setTechnology(t)}
                    disabled={mutation.isPending}
                  >
                    <Text style={[styles.chipText, technology === t && styles.chipTextSelected]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Security type */}
            <Input
              label="Security Type"
              placeholder="MOCK / BASIC_UID / SECURE_NTAG424"
              value={securityType}
              onChangeText={(v) => { setSecurityType(v); setError(null); }}
              autoCapitalize="characters"
              editable={!mutation.isPending}
            />

            {/* Component picker */}
            <View>
              <Text style={styles.label}>Bind to Component *</Text>
              {componentsQuery.isLoading ? (
                <Text style={styles.loading}>Loading components…</Text>
              ) : components.length === 0 ? (
                <Text style={styles.loading}>No components found. Create one first.</Text>
              ) : (
                <View style={styles.compList}>
                  {components.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.compOption,
                        selectedComponentId === c.id && styles.compOptionSelected,
                      ]}
                      onPress={() => { setSelectedComponentId(c.id); setError(null); }}
                      disabled={mutation.isPending}
                    >
                      <Text
                        style={[
                          styles.compSerial,
                          selectedComponentId === c.id && styles.compSerialSelected,
                        ]}
                      >
                        {c.serial_number}
                      </Text>
                      <Text style={styles.compType}>{c.component_type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Registering…' : 'Register Tag'}
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
  label: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.accentMuted },
  chipText: { color: colors.textSecondary, fontSize: typography.size.sm },
  chipTextSelected: { color: colors.primary, fontWeight: typography.weight.semibold },
  loading: { color: colors.textMuted, fontSize: typography.size.sm },
  compList: { gap: spacing.sm },
  compOption: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  compOptionSelected: { borderColor: colors.primary, backgroundColor: colors.accentMuted },
  compSerial: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  compSerialSelected: { color: colors.primary },
  compType: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
  successContainer: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  successTitle: { color: colors.verified, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  successText: { color: colors.textSecondary, fontSize: typography.size.md, textAlign: 'center', lineHeight: typography.size.md * 1.6 },
  mono: { fontFamily: 'monospace', color: colors.primary },
  bold: { fontWeight: typography.weight.bold, color: colors.textPrimary },
  doneBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  doneBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
