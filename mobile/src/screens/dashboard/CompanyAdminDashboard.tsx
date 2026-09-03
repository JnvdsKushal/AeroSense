import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle,
  Users,
  XCircle,
} from 'lucide-react-native';

import { analyticsApi } from '../../api/analytics';
import {
  ErrorState,
  LoadingState,
  SectionHeader,
  StatCard,
} from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';

/**
 * Company Admin dashboard.
 * Uses GET /api/analytics/overview — returns WorkAnalytics for the caller's
 * own company derived from the JWT company_id.
 */
export const CompanyAdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
  });

  if (isLoading) {
    return <LoadingState message="Loading dashboard…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load analytics'
        }
        onRetry={refetch}
      />
    );
  }

  const passRate = data && data.total_verifications > 0
    ? Math.round((data.verifications_passed / data.total_verifications) * 100)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>COMPANY ADMIN</Text>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        {/* Summary stats */}
        <SectionHeader title="Overview" style={styles.sectionHeader} />
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard label="Users" value={data?.total_users ?? 0} />
            <StatCard label="Aircraft" value={data?.total_aircraft ?? 0} />
            <StatCard label="Components" value={data?.total_components ?? 0} />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Maintenance Records"
              value={data?.total_maintenance_records ?? 0}
            />
            <StatCard
              label="Verifications"
              value={data?.total_verifications ?? 0}
            />
            <StatCard
              label="Pass Rate"
              value={passRate !== null ? `${passRate}%` : '—'}
              valueColor={
                passRate !== null && passRate >= 80
                  ? colors.verified
                  : passRate !== null && passRate >= 50
                  ? colors.warning
                  : colors.critical
              }
            />
          </View>
        </View>

        {/* Verification breakdown */}
        {data && data.total_verifications > 0 ? (
          <>
            <SectionHeader
              title="Verification Results"
              style={styles.sectionHeader}
            />
            <View style={styles.verifyRow}>
              <View style={[styles.verifyCard, styles.verifyCardPassed]}>
                <CheckCircle color={colors.verified} size={22} />
                <Text style={[styles.verifyCount, { color: colors.verified }]}>
                  {data.verifications_passed}
                </Text>
                <Text style={styles.verifyLabel}>Passed</Text>
              </View>
              <View style={[styles.verifyCard, styles.verifyCardFailed]}>
                <XCircle color={colors.critical} size={22} />
                <Text style={[styles.verifyCount, { color: colors.critical }]}>
                  {data.verifications_failed}
                </Text>
                <Text style={styles.verifyLabel}>Failed</Text>
              </View>
            </View>
          </>
        ) : null}

        {/* Maintenance by result */}
        {data && data.maintenance_by_result.length > 0 ? (
          <>
            <SectionHeader
              title="Maintenance by Result"
              style={styles.sectionHeader}
            />
            <View style={styles.card}>
              {data.maintenance_by_result.map((item) => (
                <View key={item.inspection_result} style={styles.breakdownRow}>
                  <Activity
                    color={
                      item.inspection_result === 'PASSED'
                        ? colors.verified
                        : item.inspection_result === 'WARNING'
                        ? colors.warning
                        : colors.critical
                    }
                    size={16}
                  />
                  <Text style={styles.breakdownLabel}>
                    {item.inspection_result}
                  </Text>
                  <Text style={styles.breakdownCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* Records by user */}
        {data && data.records_by_user.length > 0 ? (
          <>
            <SectionHeader
              title="Output by Technician"
              style={styles.sectionHeader}
            />
            <View style={styles.card}>
              {data.records_by_user.map((u) => (
                <View key={u.user_id} style={styles.breakdownRow}>
                  <Users color={colors.primary} size={16} />
                  <Text style={styles.breakdownLabel}>{u.user_name}</Text>
                  <Text style={styles.breakdownCount}>
                    {u.maintenance_count} records
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  subtitle: { color: colors.textMuted, fontSize: typography.size.sm, marginTop: 2 },
  logoutBtn: { paddingVertical: spacing.xs },
  logoutText: {
    color: colors.critical,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  statsGrid: { gap: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  verifyRow: { flexDirection: 'row', gap: spacing.sm },
  verifyCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  verifyCardPassed: {
    backgroundColor: colors.verifiedMuted,
    borderColor: colors.verified,
  },
  verifyCardFailed: {
    backgroundColor: colors.criticalMuted,
    borderColor: colors.critical,
  },
  verifyCount: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
  verifyLabel: { color: colors.textMuted, fontSize: typography.size.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  breakdownLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
  breakdownCount: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});
