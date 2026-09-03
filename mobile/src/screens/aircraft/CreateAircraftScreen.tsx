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

import { aircraftApi } from '../../api/aircraft';
import { Button, Input } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, spacing, typography } from '../../theme/tokens';
import type { FleetStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<FleetStackParamList>;

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const;

/**
 * Create aircraft. POST /api/aircraft.
 * MANUFACTURER only (or COMPANY_ADMIN override).
 *
 * Database: Inserts into `aircraft` table.
 * Fields: id, aircraft_uuid (auto-generated UUID), registration_number,
 *         model, manufacturer, status, company_id (from JWT), created_at,
 *         updated_at.
 * Verification: SELECT * FROM aircraft ORDER BY id DESC LIMIT 1;
 */
export const CreateAircraftScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const qc = useQueryClient();

  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      aircraftApi.create({
        registration_number: regNum.trim().toUpperCase(),
        model: model.trim(),
        manufacturer: manufacturer.trim(),
        status,
      }),
    onSuccess: (aircraft) => {
      qc.invalidateQueries({ queryKey: ['aircraft'] });
      navigation.replace('AircraftDetail', { aircraftId: aircraft.id });
    },
    onError: (err) => {
      setError(normalizeApiError(err).message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (!regNum.trim()) { setError('Registration number is required.'); return; }
    if (!model.trim()) { setError('Model is required.'); return; }
    if (!manufacturer.trim()) { setError('Manufacturer is required.'); return; }
    mutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Register Aircraft</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Input
              label="Registration Number *"
              placeholder="e.g. VT-AES"
              value={regNum}
              onChangeText={(v) => { setRegNum(v); setError(null); }}
              autoCapitalize="characters"
              editable={!mutation.isPending}
            />
            <Input
              label="Aircraft Model *"
              placeholder="e.g. Boeing 737-800"
              value={model}
              onChangeText={(v) => { setModel(v); setError(null); }}
              autoCapitalize="words"
              editable={!mutation.isPending}
            />
            <Input
              label="Manufacturer *"
              placeholder="e.g. Boeing"
              value={manufacturer}
              onChangeText={(v) => { setManufacturer(v); setError(null); }}
              autoCapitalize="words"
              editable={!mutation.isPending}
            />

            {/* Status picker */}
            <View>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusChip, status === s && styles.statusChipSelected]}
                    onPress={() => setStatus(s)}
                    disabled={mutation.isPending}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        status === s && styles.statusChipTextSelected,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label={mutation.isPending ? 'Registering…' : 'Register Aircraft'}
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
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  statusChipSelected: { borderColor: colors.primary, backgroundColor: colors.accentMuted },
  statusChipText: { color: colors.textSecondary, fontSize: typography.size.xs },
  statusChipTextSelected: { color: colors.primary, fontWeight: typography.weight.semibold },
  errorText: { color: colors.critical, fontSize: typography.size.sm },
});
