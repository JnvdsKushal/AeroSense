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
import { ClipboardList, Plus } from 'lucide-react-native';

import { maintenanceApi } from '../../api/maintenance';
import { componentsApi } from '../../api/components';
import { ErrorState, LoadingState, SectionHeader, StatCard } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';

/**
 * Maintenance Technician dashboard.
 * Uses GET /api/maintenance and GET /api/components.
 * Technician can only CREATE maintenance (not aircraft/components).
 */
export const TechnicianDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  const maintenanceQuery = useQuery({
    queryKey: ['maintenance'],
    queryFn: maintenanceApi.list,
  });

  const componentsQuery = useQuery({
    queryKey: ['components'],
    queryFn: componentsApi.list,
  });

  const isLoading = maintenanceQuery.isLoading || componentsQuery.isLoading;

  if (isLoading) return <LoadingState message="Loading records…" />;

  const records = maintenanceQuery.data ?? [];
  const components = componentsQuery.data ?? [];
  const passed = records.filter((r) => r.inspection_result === 'PASSED').length;
  const failed = records.filter((r) => r.inspection_result === 'FAILED').length;
  const warnings = records.filter((r) => r.inspection_result === 'WARNING').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={maintenanceQuery.isRefetching}
            onRefresh={() => maintenanceQuery.refetch()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MAINTENANCE TECHNICIAN</Text>
            <Text style={styles.title}>{user?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="My Records" style={styles.sectionHeader} />
        <View style={styles.statsRow}>
          <StatCard label="Total" value={records.length} />
          <StatCard label="Passed" value={passed} valueColor={colors.verified} />
          <StatCard label="Failed" value={failed} valueColor={colors.critical} />
          <StatCard label="Warning" value={warnings} valueColor={colors.warning} />
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() =>
            navigation.navigate('Maintenance', { screen: 'CreateMaintenance' })
          }
        >
          <Plus color={colors.textInverse} size={18} />
          <Text style={styles.createBtnText}>Log Maintenance</Text>
        </TouchableOpacity>

        {/* Components available */}
        <SectionHeader
          title={`Components (${components.length})`}
          subtitle="Tap to view history"
          style={styles.sectionHeader}
        />
        {components.slice(0, 5).map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.itemCard}
            onPress={() =>
              navigation.navigate('Components', {
                screen: 'ComponentHistory',
                params: { componentId: c.id },
              })
            }
          >
            <ClipboardList color={colors.primary} size={18} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{c.serial_number}</Text>
              <Text style={styles.itemMeta}>{c.component_type} · {c.manufacturer}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Recent records */}
        {records.length > 0 ? (
          <>
            <SectionHeader title="Recent Records" style={styles.sectionHeader} />
            {records.slice(0, 5).map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.itemCard}
                onPress={() =>
                  navigation.navigate('Maintenance', {
                    screen: 'MaintenanceDetail',
                    params: { recordId: r.id },
                  })
                }
              >
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
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{r.maintenance_type}</Text>
                  <Text style={styles.itemMeta}>
                    Component #{r.component_id} · {r.inspection_result}
                  </Text>
                </View>
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
  title: { color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  logoutBtn: { paddingVertical: spacing.xs },
  logoutText: { color: colors.critical, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  createBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
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
  itemTitle: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  itemMeta: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  resultDot: { width: 10, height: 10, borderRadius: 5 },
});
