import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Database } from 'lucide-react-native';

import { maintenanceApi } from '../../api/maintenance';
import { ErrorState, LoadingState, SectionHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { MaintenanceStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MaintenanceStackParamList>;
type Route = RouteProp<MaintenanceStackParamList, 'MaintenanceDetail'>;

/** Maintenance record detail view. Shows all fields including the record_hash. */
export const MaintenanceDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { recordId } = route.params;

  // Fetch from the list and find by ID — no single-record endpoint exists.
  const { data: records, isLoading, isError, refetch } = useQuery({
    queryKey: ['maintenance'],
    queryFn: maintenanceApi.list,
  });

  if (isLoading) return <LoadingState message="Loading record…" />;
  if (isError) return <ErrorState message="Failed to load record" onRetry={refetch} />;

  const record = records?.find((r) => r.id === recordId);
  if (!record) return <ErrorState message="Record not found" onRetry={refetch} />;

  const resultColor =
    record.inspection_result === 'PASSED'
      ? colors.verified
      : record.inspection_result === 'WARNING'
      ? colors.warning
      : colors.critical;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{record.maintenance_type}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Result banner */}
        <View
          style={[
            styles.resultBanner,
            {
              backgroundColor:
                record.inspection_result === 'PASSED'
                  ? colors.verifiedMuted
                  : record.inspection_result === 'WARNING'
                  ? colors.warningMuted
                  : colors.criticalMuted,
              borderColor: resultColor,
            },
          ]}
        >
          <Text style={[styles.resultText, { color: resultColor }]}>
            {record.inspection_result}
          </Text>
          <Text style={styles.resultType}>{record.maintenance_type}</Text>
        </View>

        {/* Details */}
        <SectionHeader title="Record Details" style={styles.sectionHeader} />
        <View style={styles.detailCard}>
          <Row label="Record ID" value={String(record.id)} />
          <Row label="Component ID" value={String(record.component_id)} />
          <Row label="Maintenance Type" value={record.maintenance_type} />
          <Row label="Inspection Result" value={record.inspection_result} />
          <Row label="Technician" value={record.technician_name} />
          <Row label="Date" value={new Date(record.created_at).toLocaleString()} />
        </View>

        {/* Notes */}
        {record.description ? (
          <>
            <SectionHeader title="Notes" style={styles.sectionHeader} />
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{record.description}</Text>
            </View>
          </>
        ) : null}

        {/* Blockchain hash */}
        <SectionHeader title="Record Hash (Blockchain)" style={styles.sectionHeader} />
        <View style={styles.hashCard}>
          <View style={styles.hashHeader}>
            <Database color={colors.primary} size={16} />
            <Text style={styles.hashLabel}>SHA-256 hash stored in blockchain_records</Text>
          </View>
          <Text style={styles.hashValue} selectable>
            {record.record_hash}
          </Text>
          <Text style={styles.hashHint}>
            Verify this hash via the Component Passport → blockchain integrity check.
          </Text>
        </View>
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
  resultBanner: { borderRadius: radius.lg, borderWidth: 2, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  resultText: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, letterSpacing: 1 },
  resultType: { color: colors.textSecondary, fontSize: typography.size.md },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  detailCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  notesCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  notesText: { color: colors.textSecondary, fontSize: typography.size.md, lineHeight: typography.size.md * 1.5 },
  hashCard: { backgroundColor: colors.accentMuted, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, padding: spacing.md, gap: spacing.sm },
  hashHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hashLabel: { color: colors.primary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold, flex: 1 },
  hashValue: { color: colors.textPrimary, fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
  hashHint: { color: colors.textMuted, fontSize: typography.size.xs },
});
