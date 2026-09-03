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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ChevronLeft,
  PauseCircle,
  PlayCircle,
  Users,
} from 'lucide-react-native';

import { companiesApi } from '../../api/companies';
import { ErrorState, LoadingState, SectionHeader, StatCard } from '../../components/ui';
import { normalizeApiError } from '../../api/apiError';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { CompanyStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<CompanyStackParamList>;
type Route = RouteProp<CompanyStackParamList, 'CompanyDetail'>;

/**
 * Super Admin: Company detail view.
 * GET /api/companies/:id — stats + users
 * GET /api/companies/:id/analytics — work analytics
 * PUT /api/companies/:id/status — activate / suspend
 */
export const CompanyDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { companyId } = route.params;
  const qc = useQueryClient();
  const [statusError, setStatusError] = useState<string | null>(null);

  const companyQuery = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companiesApi.getById(companyId),
  });

  const usersQuery = useQuery({
    queryKey: ['company', companyId, 'users'],
    queryFn: () => companiesApi.listUsers(companyId),
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      companiesApi.updateStatus(companyId, { status: newStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company', companyId] });
      qc.invalidateQueries({ queryKey: ['companies'] });
      setStatusError(null);
    },
    onError: (err) => {
      setStatusError(normalizeApiError(err).message);
    },
  });

  const handleToggleStatus = () => {
    const company = companyQuery.data;
    if (!company) return;
    const newStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    Alert.alert(
      `${newStatus === 'ACTIVE' ? 'Activate' : 'Suspend'} Company`,
      `Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'suspend'} ${company.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'ACTIVE' ? 'Activate' : 'Suspend',
          style: newStatus === 'SUSPENDED' ? 'destructive' : 'default',
          onPress: () => statusMutation.mutate(newStatus),
        },
      ],
    );
  };

  if (companyQuery.isLoading) return <LoadingState message="Loading company…" />;
  if (companyQuery.isError)
    return (
      <ErrorState
        message="Failed to load company"
        onRetry={() => companyQuery.refetch()}
      />
    );

  const company = companyQuery.data!;
  const users = usersQuery.data ?? [];
  const isActive = company.status === 'ACTIVE';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {company.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Company info */}
        <View style={styles.companyCard}>
          <View style={styles.companyIcon}>
            <Building2 color={colors.primary} size={28} />
          </View>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.slug}>/{company.slug}</Text>
          <View
            style={[
              styles.statusBadge,
              isActive ? styles.statusActive : styles.statusSuspended,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isActive ? styles.statusTextActive : styles.statusTextSuspended,
              ]}
            >
              {company.status}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <SectionHeader title="Statistics" style={styles.sectionHeader} />
        <View style={styles.statsRow}>
          <StatCard label="Users" value={company.user_count} />
          <StatCard label="Aircraft" value={company.aircraft_count} />
          <StatCard label="Components" value={company.component_count} />
        </View>
        <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
          <StatCard label="Maintenance" value={company.maintenance_count} />
          <StatCard label="Verifications" value={company.verification_count} />
        </View>

        {/* Users */}
        <SectionHeader
          title="Users"
          subtitle={`${users.length} accounts in this company`}
          style={styles.sectionHeader}
        />
        {users.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <Users color={colors.primary} size={16} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userMeta}>{u.email} · {u.role}</Text>
            </View>
          </View>
        ))}

        {/* Provision admin */}
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() =>
            navigation.navigate('CreateCompanyAdmin', { companyId })
          }
        >
          <Text style={styles.adminBtnText}>+ Provision Company Admin</Text>
        </TouchableOpacity>

        {/* Status toggle */}
        {statusError ? (
          <Text style={styles.errorText}>{statusError}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.statusBtn, isActive ? styles.suspendBtn : styles.activateBtn]}
          onPress={handleToggleStatus}
          disabled={statusMutation.isPending}
        >
          {isActive ? (
            <PauseCircle color={colors.critical} size={18} />
          ) : (
            <PlayCircle color={colors.verified} size={18} />
          )}
          <Text
            style={[
              styles.statusBtnText,
              { color: isActive ? colors.critical : colors.verified },
            ]}
          >
            {statusMutation.isPending
              ? 'Updating…'
              : isActive
              ? 'Suspend Company'
              : 'Activate Company'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  companyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  companyIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: { color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold, textAlign: 'center' },
  slug: { color: colors.textMuted, fontSize: typography.size.sm },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusActive: { backgroundColor: colors.verifiedMuted },
  statusSuspended: { backgroundColor: colors.criticalMuted },
  statusText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  statusTextActive: { color: colors.verified },
  statusTextSuspended: { color: colors.critical },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  userInfo: { flex: 1 },
  userName: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  userMeta: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  adminBtn: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  adminBtnText: { color: colors.primary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  errorText: { color: colors.critical, fontSize: typography.size.sm, marginTop: spacing.md, textAlign: 'center' },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  suspendBtn: { borderColor: colors.critical, backgroundColor: colors.criticalMuted },
  activateBtn: { borderColor: colors.verified, backgroundColor: colors.verifiedMuted },
  statusBtnText: { fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
