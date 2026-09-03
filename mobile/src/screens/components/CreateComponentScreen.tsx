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

import { componentsApi } from '../../api/components';
import { aircraftApi } from '../../api/aircraft';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { ComponentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ComponentStackParamList>;

const STATUS_OPTIONS = ['OPERATIONAL', 'MAINTENANCE', 'DECOMMISSIONED'] as const;

/**
 * Create component. POST /api/components.
 * MANUFACTURER only (or COMPANY_ADMIN override).
 * Optionally links to an aircraft via aircraft_id.
 *
 * Database: Inserts into `components` table.
 * Fields: id, component_uuid (auto), aircraft_id (nullable), serial_number,
 *         component_type, manufacturer, status, company_id (from JWT),
 *         created_at, updated_at.
 * Verification: SELECT * FROM components ORDER BY id DESC LIMIT 1;
 */
export const CreateComponentScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const [serialNumber, setSerialNumber] = useState('');
  const [componentType, setComponentType] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [status, setStatus] = useState('OPERATIONAL');
  const [selectedAircraftId, setSelectedAircraftId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aircraftQuery = useQuery({
    queryKey: ['aircraft'],
    queryFn: aircraftApi.list,
  });

  const mutation = useMutation({
    mutationFn: () =>
      componentsApi.create({
        serial_number: serialNumber.trim(),
        component_type: componentType.trim(),
        manufacturer: manufacturer.trim(),
        status,
        aircraft_id: selectedAircraftId,
      }),
    onSuccess: (component) => {
      qc.invalidateQueries({ queryKey: ['components'] });
      qc.invalidateQueries({ queryKey: ['aircraft'] });
      navigation.replace('ComponentDetail', { componentId: component.id });
    },
    onError: (err) => {
      setError(normalizeApiError(err).message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!serialNumber.trim()) { setError('Serial number is required.'); return; }
    if (!componentType.trim()) { setError('Component type is required.'); return; }
    if (!manufacturer.trim()) { setError('Manufacturer is required.'); return; }
    mutation.mutate();
  };

  const aircraft = aircraftQuery.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Register Component</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Input
              label="Serial Number *"
              placeholder="e.g. ENG-0001-2026"
              value={serialNumber}
              onChangeText={(v) => { setSerialNumber(v); setError(null); }}
              autoCapitalize="characters"
              editable={!mutation.isPending}
            />
            <Input
              label="Component Type *"
              placeholder="e.g. Turbofan Engine"
              value={componentType}
              onChangeText={(v) => { setComponentType(v); setError(null); }}
              autoCapitalize="words"
              editable={!mutation.isPending}
            />
            <Input
              label="Manufacturer *"
              placeholder="e.g. CFM International"
              value={manufacturer}
              onChangeText={(v) => { setManufacturer(v); setError(null); }}
              autoCapitalize="words"
              editable={!mutation.isPending}
            />

            {/* Status picker */}
            <View>
              <Text style={styles.label}>Status</Text>
              <View style={styles.chipRow}>
                {STATUS_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, status === s && styles.chipSelected]}
                    onPress={() => setStatus(s)}
                    disabled={mutation.isPending}
                  >
                    <Text style={[styles.chipText, status === s && styles.chipTextSelected]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Aircraft picker */}
            <View>
              <Text style={styles.label}>Attach to Aircraft (optional)</Text>
              {aircraftQuery.isLoading ? (
                <Text style={styles.loadingText}>Loading aircraft…</Text>
              ) : (
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      selectedAircraftId === null && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedAircraftId(null)}
                    disabled={mutation.isPending}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedAircraftId === null && styles.chipTextSelected,
                      ]}
                    >
                      None
                    </Text>
                  </TouchableOpacity>
                  {aircraft.map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      style={[
                        styles.chip,
                        selectedAircraftId === a.id && styles.chipSelected,
                      ]}
                      onPress={() => setSelectedAircraftId(a.id)}
                      disabled={mutation.isPending}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedAircraftId === a.id && styles.chipTextSelected,
                        ]}
                      >
                        {a.registration_number}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Registering…' : 'Register Component'}
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
  label: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.accentMuted },
  chipText: { color: colors.textSecondary, fontSize: typography.size.sm },
  chipTextSelected: { color: colors.primary, fontWeight: typography.weight.semibold },
  loadingText: { color: colors.textMuted, fontSize: typography.size.sm },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
});
