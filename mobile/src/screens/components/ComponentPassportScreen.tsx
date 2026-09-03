import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle,
  ChevronLeft,
  Cpu,
  Database,
  Plane,
  Shield,
  Tag,
  XCircle,
} from 'lucide-react-native';

import { componentsApi } from '../../api/components';
import { maintenanceApi } from '../../api/maintenance';
import { verificationApi } from '../../api/verification';
import { SectionHeader } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { BlockchainVerifyResponse } from '../../types/domain';
import type { ComponentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ComponentStackParamList>;
type Route = RouteProp<ComponentStackParamList, 'ComponentPassport'>;

/**
 * Digital Component Passport (Module 6).
 *
 * Aggregates all available backend data for a component into a single
 * scrollable document:
 *
 * 1. Identity — GET /api/components/:id
 *    (uuid, serial, type, manufacturer, aircraft, status)
 * 2. Maintenance history — GET /api/components/:id/history
 *    (all records, with technician, result, notes, record_hash)
 * 3. Verification logs — GET /api/components/:id/verification
 *    (all scans with final_result, checks, failure_reason)
 * 4. Blockchain integrity — POST /api/blockchain/verify
 *    (compares maintenance_records.record_hash vs blockchain_records.onchain_hash)
 *    (triggered on-demand per record — NOT automatic to avoid spamming the API)
 */
export const ComponentPassportScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { componentId } = route.params;
  const [verifiedRecords, setVerifiedRecords] = useState<Record<number, BlockchainVerifyResponse>>({});

  const componentQuery = useQuery({
    queryKey: ['component', componentId],
    queryFn: () => componentsApi.getById(componentId),
  });

  const historyQuery = useQuery({
    queryKey: ['component', componentId, 'history'],
    queryFn: () => maintenanceApi.getComponentHistory(componentId),
  });

  const verifyLogsQuery = useQuery({
    queryKey: ['component', componentId, 'verification'],
    queryFn: () => verificationApi.getComponentVerifications(componentId),
  });

  const integrityMutation = useMutation({
    mutationFn: (recordId: number) =>
      verificationApi.verifyBlockchainRecord({ record_id: recordId }),
    onSuccess: (data, recordId) => {
      setVerifiedRecords((prev) => ({ ...prev, [recordId]: data }));
    },
    onError: (err, recordId) => {
      Alert.alert('Integrity Check Failed', normalizeApiError(err).message);
    },
  });

  const isLoading =
    componentQuery.isLoading || historyQuery.isLoading || verifyLogsQuery.isLoading;

  if (isLoading) return <LoadingState message="Loading passport…" />;
  if (componentQuery.isError)
    return <ErrorState message="Failed to load component" onRetry={() => componentQuery.refetch()} />;

  const comp = componentQuery.data!;
  const history = historyQuery.data ?? [];
  const verifyLogs = verifyLogsQuery.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Digital Passport</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header stamp */}
        <View style={styles.passportHeader}>
          <View style={styles.passportStamp}>
            <Cpu color={colors.primary} size={36} />
          </View>
          <Text style={styles.passportTitle}>COMPONENT PASSPORT</Text>
          <Text style={styles.passportUuid} numberOfLines={1} ellipsizeMode="middle">
            {comp.component_uuid}
          </Text>
          <View style={[styles.statusBadge, comp.status === 'OPERATIONAL' ? styles.statusOk : styles.statusWarn]}>
            <Text style={[styles.statusText, comp.status === 'OPERATIONAL' ? styles.statusTextOk : styles.statusTextWarn]}>
              {comp.status}
            </Text>
          </View>
        </View>

        {/* Section 1: Identity */}
        <SectionHeader title="① Identity" style={styles.sectionHeader} />
        <View style={styles.card}>
          <Row label="Serial Number" value={comp.serial_number} />
          <Row label="Type" value={comp.component_type} />
          <Row label="Manufacturer" value={comp.manufacturer} />
          {comp.aircraft_registration ? (
            <Row label="Aircraft" value={comp.aircraft_registration} />
          ) : null}
          <Row label="Registered" value={new Date(comp.created_at).toLocaleDateString()} />
        </View>

        {/* Section 2: Maintenance */}
        <SectionHeader
          title={`② Maintenance History (${history.length})`}
          style={styles.sectionHeader}
        />
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No maintenance records yet.</Text>
        ) : (
          history.map((record) => {
            const checked = verifiedRecords[record.id];
            return (
              <View key={record.id} style={styles.maintCard}>
                <View style={styles.maintHeader}>
                  <View
                    style={[
                      styles.resultDot,
                      {
                        backgroundColor:
                          record.inspection_result === 'PASSED'
                            ? colors.verified
                            : record.inspection_result === 'WARNING'
                            ? colors.warning
                            : colors.critical,
                      },
                    ]}
                  />
                  <View style={styles.maintInfo}>
                    <Text style={styles.maintType}>{record.maintenance_type}</Text>
                    <Text style={styles.maintMeta}>
                      {record.inspection_result} · {record.technician_name}
                    </Text>
                    <Text style={styles.maintDate}>
                      {new Date(record.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
                {record.description ? (
                  <Text style={styles.maintNotes}>{record.description}</Text>
                ) : null}
                {/* Record hash */}
                <View style={styles.hashRow}>
                  <Database color={colors.textMuted} size={12} />
                  <Text style={styles.hashText} numberOfLines={1} ellipsizeMode="middle">
                    {record.record_hash}
                  </Text>
                </View>
                {/* Blockchain integrity check */}
                {checked !== undefined ? (
                  <View
                    style={[
                      styles.integrityResult,
                      checked?.verified ? styles.integrityOk : styles.integrityCrit,
                    ]}
                  >
                    {checked?.verified ? (
                      <CheckCircle color={colors.verified} size={14} />
                    ) : (
                      <XCircle color={colors.critical} size={14} />
                    )}
                    <Text
                      style={[
                        styles.integrityText,
                        { color: checked?.verified ? colors.verified : colors.critical },
                      ]}
                    >
                      {checked?.verified ? 'Hash verified on chain' : 'HASH MISMATCH — record tampered'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.verifyHashBtn}
                    onPress={() => integrityMutation.mutate(record.id)}
                    disabled={integrityMutation.isPending}
                  >
                    <Shield color={colors.primary} size={14} />
                    <Text style={styles.verifyHashText}>
                      {integrityMutation.isPending && integrityMutation.variables === record.id
                        ? 'Verifying…'
                        : 'Verify Blockchain Integrity'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        {/* Section 3: Verification logs */}
        <SectionHeader
          title={`③ NFC Verification Logs (${verifyLogs.length})`}
          style={styles.sectionHeader}
        />
        {verifyLogs.length === 0 ? (
          <Text style={styles.emptyText}>No NFC verification scans yet.</Text>
        ) : (
          verifyLogs.map((log) => (
            <View
              key={log.id}
              style={[
                styles.logCard,
                log.final_result === 'AUTHENTIC'
                  ? styles.logOk
                  : log.final_result === 'SUSPICIOUS'
                  ? styles.logWarn
                  : styles.logCrit,
              ]}
            >
              {log.final_result === 'AUTHENTIC' ? (
                <CheckCircle color={colors.verified} size={18} />
              ) : (
                <XCircle
                  color={log.final_result === 'SUSPICIOUS' ? colors.warning : colors.critical}
                  size={18}
                />
              )}
              <View style={styles.logInfo}>
                <Text style={styles.logResult}>{log.final_result}</Text>
                {log.failure_reason ? (
                  <Text style={styles.logReason}>{log.failure_reason}</Text>
                ) : null}
                <Text style={styles.logDate}>
                  {new Date(log.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={rowStyles.value}>{value}</Text>
  </View>
);
const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  label: { flex: 1, color: colors.textMuted, fontSize: typography.size.sm },
  value: { flex: 2, color: colors.textPrimary, fontSize: typography.size.sm, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, textAlign: 'center' },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  passportHeader: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  passportStamp: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportTitle: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.bold, letterSpacing: 2 },
  passportUuid: { color: colors.textMuted, fontSize: typography.size.xs, fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusOk: { backgroundColor: colors.verifiedMuted },
  statusWarn: { backgroundColor: colors.warningMuted },
  statusText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  statusTextOk: { color: colors.verified },
  statusTextWarn: { color: colors.warning },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: typography.size.sm, textAlign: 'center', padding: spacing.lg },
  maintCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  maintHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  resultDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  maintInfo: { flex: 1 },
  maintType: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  maintMeta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  maintDate: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  maintNotes: { color: colors.textMuted, fontSize: typography.size.sm, fontStyle: 'italic', paddingLeft: spacing.xl },
  hashRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hashText: { flex: 1, color: colors.textMuted, fontSize: 10, fontFamily: 'monospace' },
  integrityResult: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.sm, padding: spacing.sm },
  integrityOk: { backgroundColor: colors.verifiedMuted },
  integrityCrit: { backgroundColor: colors.criticalMuted },
  integrityText: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  verifyHashBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  verifyHashText: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  logCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: radius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  logOk: { backgroundColor: colors.verifiedMuted, borderColor: colors.verified },
  logWarn: { backgroundColor: colors.warningMuted, borderColor: colors.warning },
  logCrit: { backgroundColor: colors.criticalMuted, borderColor: colors.critical },
  logInfo: { flex: 1 },
  logResult: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  logReason: { color: colors.textMuted, fontSize: typography.size.sm, marginTop: 2 },
  logDate: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
});
