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
import { Cpu, Plane, Tag } from 'lucide-react-native';

import { aircraftApi } from '../../api/aircraft';
import { componentsApi } from '../../api/components';
import { ErrorState, LoadingState, SectionHeader, StatCard } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';

/**
 * Manufacturer dashboard.
 * Uses real GET /api/aircraft and GET /api/components — both are available
 * to any company-scoped role. Shows creation shortcuts.
 */
export const ManufacturerDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  const aircraftQuery = useQuery({
    queryKey: ['aircraft'],
    queryFn: aircraftApi.list,
  });

  const componentsQuery = useQuery({
    queryKey: ['components'],
    queryFn: componentsApi.list,
  });

  const isLoading = aircraftQuery.isLoading || componentsQuery.isLoading;
  const isError = aircraftQuery.isError || componentsQuery.isError;

  if (isLoading) return <LoadingState message="Loading fleet overview…" />;
  if (isError)
    return (
      <ErrorState
        message="Failed to load fleet data"
        onRetry={() => {
          aircraftQuery.refetch();
          componentsQuery.refetch();
        }}
      />
    );

  const aircraft = aircraftQuery.data ?? [];
  const components = componentsQuery.data ?? [];
  const activeAircraft = aircraft.filter((a) => a.status === 'ACTIVE').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={aircraftQuery.isRefetching || componentsQuery.isRefetching}
            onRefresh={() => {
              aircraftQuery.refetch();
              componentsQuery.refetch();
            }}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MANUFACTURER</Text>
            <Text style={styles.title}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Fleet Overview" style={styles.sectionHeader} />
        <View style={styles.statsRow}>
          <StatCard label="Aircraft" value={aircraft.length} />
          <StatCard
            label="Active"
            value={activeAircraft}
            valueColor={colors.verified}
          />
          <StatCard label="Components" value={components.length} />
        </View>

        <SectionHeader title="Quick Actions" style={styles.sectionHeader} />
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Fleet', { screen: 'CreateAircraft' })}
          >
            <Plane color={colors.primary} size={24} />
            <Text style={styles.actionLabel}>New Aircraft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              navigation.navigate('Components', { screen: 'CreateComponent' })
            }
          >
            <Cpu color={colors.primary} size={24} />
            <Text style={styles.actionLabel}>New Component</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Tags', { screen: 'RegisterTag' })}
          >
            <Tag color={colors.primary} size={24} />
            <Text style={styles.actionLabel}>Register Tag</Text>
          </TouchableOpacity>
        </View>

        {/* Recent aircraft */}
        {aircraft.length > 0 ? (
          <>
            <SectionHeader title="Recent Aircraft" style={styles.sectionHeader} />
            {aircraft.slice(0, 5).map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.itemCard}
                onPress={() =>
                  navigation.navigate('Fleet', {
                    screen: 'AircraftDetail',
                    params: { aircraftId: a.id },
                  })
                }
              >
                <Plane color={colors.primary} size={18} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{a.registration_number}</Text>
                  <Text style={styles.itemMeta}>
                    {a.model} · {a.manufacturer}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: a.status === 'ACTIVE' ? colors.verified : colors.warning },
                  ]}
                />
              </TouchableOpacity>
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
  logoutBtn: { paddingVertical: spacing.xs },
  logoutText: { color: colors.critical, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  actionsGrid: { flexDirection: 'row', gap: spacing.sm },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    textAlign: 'center',
    fontWeight: typography.weight.medium,
  },
  itemCard: {
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
  itemInfo: { flex: 1 },
  itemTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  itemMeta: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
