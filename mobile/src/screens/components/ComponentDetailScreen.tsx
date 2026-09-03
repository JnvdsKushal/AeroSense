import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ScanLine,
  Shield,
} from 'lucide-react-native';

import { componentsApi } from '../../api/components';
import { maintenanceApi } from '../../api/maintenance';
import { verificationApi } from '../../api/verification';
import { canPerform } from '../../constants/roles';
import { useAuthStore } from '../../store/authStore';
import {
  ErrorState,
  LoadingState,
  SectionHeader,
} from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { ComponentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ComponentStackParamList>;
type Route = RouteProp<ComponentStackParamList, 'ComponentDetail'>;

/**
 * Component detail screen — aggregates:
 * - GET /api/components/:id
 * - GET /api/components/:id/history (latest 3)
 * - GET /api/components/:id/verification (latest 3)
 *
 * Links to ComponentPassport for the full passport view.
 */
export const ComponentDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { componentId } = route.params;
  const { user } = useAuthStore();

  const componentQuery = useQuery({
    queryKey: ['component', componentId],
    queryFn: () => componentsApi.getById(componentId),
  });

  const historyQuery = useQuery({
    queryKey: ['component', componentId, 'history'],
    queryFn: () => maintenanceApi.getComponentHistory(componentId),
  });

  const verifyQuery = useQuery({
    queryKey: ['component', componentId, 'verification'],
    queryFn: () => verificationApi.getComponentVerifications(componentId),
  });

  if (componentQuery.isLoading) return <LoadingState message="Loading component…" />;
  if (componentQuery.isError)
    return <ErrorState message="Failed to load component" onRetry={() => componentQuery.refetch()} />;

  const comp = componentQuery.data!;
  const history = historyQuery.data ?? [];
  const verifications = verifyQuery.data ?? [];
  const lastVerify = verifications[0];
  const canCreateMaint = canPerform(user?.role, 'CREATE_MAINTENANCE');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{comp.serial_number}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.identityCard}>
          <View style={styles.uuidRow}>
            <Text style={styles.uuidLabel}>COMPONENT UUID</Text>
            <Text style={styles.uuid} numberOfLines={1} ellipsizeMode="middle">
              {comp.component_uuid}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              comp.status === 'OPERATIONAL'
                ? styles.statusOk
                : comp.status === 'MAINTENANCE'
                ? styles.statusWarn
                : styles.statusCrit,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                comp.status === 'OPERATIONAL'
                  ? styles.statusTextOk
                  : comp.status === 'MAINTENANCE'
                  ? styles.statusTextWarn
                  : styles.statusTextCrit,
              ]}
            >
              {comp.status}
            </Text>
          </View>
        </View>

        {/* Details */}
        <SectionHeader title="Identity" style={styles.sectionHeader} />
        <View style={styles.detailCard}>
          <Row label="Serial Number" value={comp.serial_number} />
          <Row label="Type" value={comp.component_type} />
          <Row label="Manufacturer" value={comp.manufacturer} />
          <Row label="Aircraft" value={comp.aircraft_registration ?? 'Not attached'} />
          <Row label="Registered" value={new Date(comp.created_at).toLocaleDateString()} />
        </View>

        {/* Passport shortcut */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ComponentPassport', { componentId })}
        >
          <BookOpen color={colors.primary} size={20} />
          <Text style={styles.actionText}>View Digital Passport</Text>
          <ChevronRight color={colors.textMuted} size={18} />
        </TouchableOpacity>

        {/* Latest verification */}
        {lastVerify ? (
          <>
            <SectionHeader title="Latest Verification" style={styles.sectionHeader} />
            <View
              style={[
                styles.verifyCard,
                lastVerify.final_result === 'AUTHENTIC'
                  ? styles.verifyOk
                  : lastVerify.final_result === 'SUSPICIOUS'
                  ? styles.verifyWarn
                  : styles.verifyCrit,
              ]}
            >
              <Shield
                color={
                  lastVerify.final_result === 'AUTHENTIC'
                    ? colors.verified
                    : lastVerify.final_result === 'SUSPICIOUS'
                    ? colors.warning
                    : colors.critical
                }
                size={20}
              />
              <View style={styles.verifyInfo}>
                <Text style={styles.verifyResult}>{lastVerify.final_result}</Text>
                <Text style={styles.verifyDate}>
                  {new Date(lastVerify.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {/* Maintenance history summary */}
        <SectionHeader
          title={`Maintenance History (${history.length})`}
          style={styles.sectionHeader}
        />
        {history.slice(0, 3).map((r) => (
          <View key={r.id} style={styles.histRow}>
            <View
              style={[
                styles.resultDot,
                {
                  backgroundColor:
                    r.inspection_result === 'PASSED'
                      ? colors.verified
                      : r.inspection_result === 'WARNING'
                      ? colors.warning
                      : colors.critical,
                },
              ]}
            />
            <View style={styles.histInfo}>
              <Text style={styles.histType}>{r.maintenance_type}</Text>
              <Text style={styles.histMeta}>
                {r.inspection_result} · {r.technician_name} ·{' '}
                {new Date(r.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
        {history.length > 3 ? (
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('ComponentHistory', { componentId })}
          >
            <ClipboardList color={colors.primary} size={16} />
            <Text style={styles.seeAllText}>See all {history.length} records</Text>
          </TouchableOpacity>
        ) : null}

        {/* Quick actions */}
        {canCreateMaint ? (
          <TouchableOpacity
            style={styles.maintenanceBtn}
            onPress={() =>
              navigation.navigate('ComponentPassport', { componentId })
            }
          >
            <ClipboardList color={colors.textInverse} size={18} />
            <Text style={styles.maintenanceBtnText}>Log Maintenance</Text>
          </TouchableOpacity>
        ) : null}
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
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  label: { flex: 1, color: colors.textMuted, fontSize: typography.size.sm },
  value: { flex: 2, color: colors.textPrimary, fontSize: typography.size.sm, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, textAlign: 'center' },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  identityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  uuidRow: { gap: 4 },
  uuidLabel: { color: colors.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.bold, letterSpacing: 1 },
  uuid: { color: colors.primary, fontSize: typography.size.sm, fontFamily: 'monospace' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusOk: { backgroundColor: colors.verifiedMuted },
  statusWarn: { backgroundColor: colors.warningMuted },
  statusCrit: { backgroundColor: colors.criticalMuted },
  statusText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  statusTextOk: { color: colors.verified },
  statusTextWarn: { color: colors.warning },
  statusTextCrit: { color: colors.critical },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  detailCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionText: { flex: 1, color: colors.primary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  verifyCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, borderWidth: 1, padding: spacing.md, gap: spacing.md },
  verifyOk: { backgroundColor: colors.verifiedMuted, borderColor: colors.verified },
  verifyWarn: { backgroundColor: colors.warningMuted, borderColor: colors.warning },
  verifyCrit: { backgroundColor: colors.criticalMuted, borderColor: colors.critical },
  verifyInfo: { flex: 1 },
  verifyResult: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  verifyDate: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  histRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  resultDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  histInfo: { flex: 1 },
  histType: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  histMeta: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, justifyContent: 'center' },
  seeAllText: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  maintenanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  maintenanceBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
