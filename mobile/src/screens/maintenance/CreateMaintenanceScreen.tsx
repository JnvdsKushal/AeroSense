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
import { ChevronLeft } from 'lucide-react-native';

import { maintenanceApi } from '../../api/maintenance';
import { componentsApi } from '../../api/components';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { MaintenanceStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MaintenanceStackParamList>;

const RESULT_OPTIONS = ['PASSED', 'WARNING', 'FAILED'] as const;

/**
 * Create maintenance record.
 * POST /api/maintenance — { component_id, maintenance_type, inspection_result, notes? }
 * MAINTENANCE_TECHNICIAN only (or COMPANY_ADMIN override).
 *
 * Backend computes a SHA-256 record_hash over all fields at insert time
 * and stores it in both maintenance_records.record_hash AND
 * blockchain_records.onchain_hash.
 *
 * Database: Inserts into `maintenance_records` AND `blockchain_records`.
 * Verification:
 *   SELECT * FROM maintenance_records ORDER BY id DESC LIMIT 1;
 *   SELECT * FROM blockchain_records ORDER BY id DESC LIMIT 1;
 */
export const CreateMaintenanceScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const [maintenanceType, setMaintenanceType] = useState('');
  const [inspectionResult, setInspectionResult] = useState('PASSED');
  const [description, setDescription] = useState('');
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const componentsQuery = useQuery({
    queryKey: ['components'],
    queryFn: componentsApi.list,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedComponentId) throw new Error('Select a component first.');
      return maintenanceApi.create({
        component_id: selectedComponentId,
        maintenance_type: maintenanceType.trim(),
        inspection_result: inspectionResult,
        description: description.trim(),
      });
    },
    onSuccess: (record) => {
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['component', selectedComponentId, 'history'] });
      navigation.replace('MaintenanceDetail', { recordId: record.id });
    },
    onError: (err) => {
      setError(normalizeApiError(err).message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!maintenanceType.trim()) { setError('Maintenance type is required.'); return; }
    if (!selectedComponentId) { setError('Select a component.'); return; }
    mutation.mutate();
  };

  const components = componentsQuery.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Log Maintenance</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Component picker */}
            <View>
              <Text style={styles.label}>Component *</Text>
              {componentsQuery.isLoading ? (
                <Text style={styles.loading}>Loading…</Text>
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
                      <Text style={[styles.compSerial, selectedComponentId === c.id && styles.compSerialSelected]}>
                        {c.serial_number}
                      </Text>
                      <Text style={styles.compType}>{c.component_type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Input
              label="Maintenance Type *"
              placeholder="e.g. 100-Hour Inspection, Engine Overhaul"
              value={maintenanceType}
              onChangeText={(v) => { setMaintenanceType(v); setError(null); }}
              autoCapitalize="words"
              editable={!mutation.isPending}
            />

            {/* Inspection result */}
            <View>
              <Text style={styles.label}>Inspection Result *</Text>
              <View style={styles.resultRow}>
                {RESULT_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.resultChip,
                      inspectionResult === r && styles.resultChipSelected,
                      inspectionResult === r && r === 'PASSED' && styles.resultPassedSelected,
                      inspectionResult === r && r === 'WARNING' && styles.resultWarnSelected,
                      inspectionResult === r && r === 'FAILED' && styles.resultFailedSelected,
                    ]}
                    onPress={() => setInspectionResult(r)}
                    disabled={mutation.isPending}
                  >
                    <Text
                      style={[
                        styles.resultChipText,
                        inspectionResult === r && {
                          color:
                            r === 'PASSED'
                              ? colors.verified
                              : r === 'WARNING'
                              ? colors.warning
                              : colors.critical,
                          fontWeight: typography.weight.bold,
                        },
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Notes (optional)"
              placeholder="Observations, actions taken…"
              value={description}
              onChangeText={(v) => { setDescription(v); setError(null); }}
              multiline
              numberOfLines={4}
              editable={!mutation.isPending}
            />

            <View style={styles.blockchainNote}>
              <Text style={styles.blockchainNoteTitle}>🔗 Blockchain Integrity</Text>
              <Text style={styles.blockchainNoteText}>
                The backend will compute a SHA-256 hash of this record and store it
                in both the maintenance records and blockchain records tables. This
                hash can later be verified via the Component Passport.
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Saving…' : 'Log Maintenance Record'}
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
  loading: { color: colors.textMuted, fontSize: typography.size.sm },
  compList: { gap: spacing.sm },
  compOption: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  compOptionSelected: { borderColor: colors.primary, backgroundColor: colors.accentMuted },
  compSerial: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  compSerialSelected: { color: colors.primary },
  compType: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  resultRow: { flexDirection: 'row', gap: spacing.sm },
  resultChip: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  resultChipSelected: { borderWidth: 2 },
  resultPassedSelected: { borderColor: colors.verified, backgroundColor: colors.verifiedMuted },
  resultWarnSelected: { borderColor: colors.warning, backgroundColor: colors.warningMuted },
  resultFailedSelected: { borderColor: colors.critical, backgroundColor: colors.criticalMuted },
  resultChipText: { color: colors.textSecondary, fontSize: typography.size.sm },
  blockchainNote: { backgroundColor: colors.accentMuted, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, padding: spacing.md, gap: spacing.xs },
  blockchainNoteTitle: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  blockchainNoteText: { color: colors.textSecondary, fontSize: typography.size.xs, lineHeight: typography.size.xs * 1.5 },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
});
