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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, ScanLine, XCircle } from 'lucide-react-native';

import { verificationApi } from '../../api/verification';
import { ErrorState, LoadingState, SectionHeader, StatCard } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';

/**
 * Inspector dashboard.
 * Uses GET /api/verification/logs — no role restriction beyond company scope.
 * Inspector can perform NFC verification and view all verification history.
 */
export const InspectorDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  const logsQuery = useQuery({
    queryKey: ['verification', 'logs'],
    queryFn: verificationApi.getLogs,
  });

  if (logsQuery.isLoading) return <LoadingState message="Loading verification data…" />;

  const logs = logsQuery.data ?? [];
  const authentic = logs.filter((l) => l.final_result === 'AUTHENTIC').length;
  const suspicious = logs.filter((l) => l.final_result === 'SUSPICIOUS').length;
  const invalid = logs.filter((l) => l.final_result === 'INVALID').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={logsQuery.isRefetching}
            onRefresh={() => logsQuery.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>INSPECTOR</Text>
            <Text style={styles.title}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Verification Summary" style={styles.sectionHeader} />
        <View style={styles.statsRow}>
          <StatCard label="Total" value={logs.length} />
          <StatCard label="Authentic" value={authentic} valueColor={colors.verified} />
          <StatCard label="Suspicious" value={suspicious} valueColor={colors.warning} />
          <StatCard label="Invalid" value={invalid} valueColor={colors.critical} />
        </View>

        {/* Scan CTA */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() =>
            navigation.navigate('Verify', { screen: 'NfcScan' })
          }
        >
          <ScanLine color={colors.textInverse} size={22} />
          <Text style={styles.scanBtnText}>Scan NFC Tag</Text>
        </TouchableOpacity>

        {/* Recent verification logs */}
        {logs.length > 0 ? (
          <>
            <SectionHeader title="Recent Verifications" style={styles.sectionHeader} />
            {logs.slice(0, 8).map((log) => (
              <View key={log.id} style={styles.logRow}>
                {log.final_result === 'AUTHENTIC' ? (
                  <CheckCircle color={colors.verified} size={18} />
                ) : (
                  <XCircle
                    color={
                      log.final_result === 'SUSPICIOUS'
                        ? colors.warning
                        : colors.critical
                    }
                    size={18}
                  />
                )}
                <View style={styles.logInfo}>
                  <Text style={styles.logResult}>{log.final_result}</Text>
                  <Text style={styles.logMeta}>
                    {log.failure_reason ?? 'All checks passed'} ·{' '}
                    {new Date(log.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
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
  eyebrow: { color: colors.primary, fontSize: typography.size.xs, fontWeight: typography.weight.bold, letterSpacing: 1.5 },
  title: { color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  logoutBtn: { paddingVertical: spacing.xs },
  logoutText: { color: colors.critical, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  scanBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  logRow: {
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
  logInfo: { flex: 1 },
  logResult: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  logMeta: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
});
