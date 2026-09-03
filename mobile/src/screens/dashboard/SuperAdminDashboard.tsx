import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronRight, Plus } from 'lucide-react-native';

import { companiesApi } from '../../api/companies';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatCard,
} from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { SuperAdminTabParamList, CompanyStackParamList } from '../../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<SuperAdminTabParamList, 'SADashboard'>,
  NativeStackNavigationProp<CompanyStackParamList>
>;

/**
 * Super Admin landing dashboard.
 * Fetches GET /api/companies and shows a platform-level company list with
 * per-tenant stats (users, aircraft, components, maintenance, verifications).
 * The Super Admin cannot access any company's operational data — this screen
 * is purely about platform/tenant oversight.
 */
export const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<Nav>();

  const {
    data: companies,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.list,
  });

  if (isLoading) {
    return <LoadingState message="Loading platform overview…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : 'Failed to load companies'
        }
        onRetry={refetch}
      />
    );
  }

  const totalUsers = companies?.reduce((s, c) => s + c.user_count, 0) ?? 0;
  const totalAircraft =
    companies?.reduce((s, c) => s + c.aircraft_count, 0) ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>AERO-SENSE PLATFORM</Text>
          <Text style={styles.title}>Super Admin</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => logout()}
          accessibilityLabel="Log out"
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Platform summary stats */}
      <View style={styles.statsRow}>
        <StatCard label="Companies" value={companies?.length ?? 0} />
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Aircraft" value={totalAircraft} />
      </View>

      {/* Company list */}
      <Text style={styles.sectionTitle}>Registered Companies</Text>
      <FlatList
        data={companies}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          companies?.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No companies yet"
            message="Create the first aviation company to get started."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.companyCard}
            onPress={() =>
              navigation.navigate('Companies', {
                screen: 'CompanyDetail',
                params: { companyId: item.id },
              })
            }
            accessibilityLabel={`Open ${item.name}`}
          >
            <View style={styles.companyIcon}>
              <Building2 color={colors.primary} size={20} />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{item.name}</Text>
              <Text style={styles.companyMeta}>
                {item.user_count} users · {item.aircraft_count} aircraft ·{' '}
                {item.component_count} components
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'ACTIVE'
                    ? styles.statusActive
                    : styles.statusSuspended,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === 'ACTIVE'
                      ? styles.statusTextActive
                      : styles.statusTextSuspended,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <ChevronRight color={colors.textMuted} size={18} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() =>
              navigation.navigate('Companies', { screen: 'CreateCompany' })
            }
            accessibilityLabel="Create new company"
          >
            <Plus color={colors.textInverse} size={18} />
            <Text style={styles.createBtnText}>Create Company</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  logoutBtn: { paddingVertical: spacing.xs },
  logoutText: {
    color: colors.critical,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  companyCard: {
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
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: { flex: 1, gap: 3 },
  companyName: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  companyMeta: { color: colors.textMuted, fontSize: typography.size.xs },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 2,
  },
  statusActive: { backgroundColor: colors.verifiedMuted },
  statusSuspended: { backgroundColor: colors.criticalMuted },
  statusText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  statusTextActive: { color: colors.verified },
  statusTextSuspended: { color: colors.critical },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  createBtnText: {
    color: colors.textInverse,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
