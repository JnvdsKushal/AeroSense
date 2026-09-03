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
import { Cpu, Plane } from 'lucide-react-native';

import { aircraftApi } from '../../api/aircraft';
import { componentsApi } from '../../api/components';
import { EmptyState, LoadingState, SectionHeader, StatCard } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';

/**
 * Viewer dashboard — read-only. No create/edit actions shown.
 * Uses GET /api/aircraft and GET /api/components — any company role.
 */
export const ViewerDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  const aircraftQuery = useQuery({ queryKey: ['aircraft'], queryFn: aircraftApi.list });
  const componentsQuery = useQuery({ queryKey: ['components'], queryFn: componentsApi.list });

  const isLoading = aircraftQuery.isLoading || componentsQuery.isLoading;
  if (isLoading) return <LoadingState message="Loading fleet…" />;

  const aircraft = aircraftQuery.data ?? [];
  const components = componentsQuery.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={aircraftQuery.isRefetching || componentsQuery.isRefetching}
            onRefresh={() => { aircraftQuery.refetch(); componentsQuery.refetch(); }}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>VIEWER</Text>
            <Text style={styles.title}>{user?.name}</Text>
            <Text style={styles.readOnly}>Read-only access</Text>
          </View>
          <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Fleet Overview" style={styles.sectionHeader} />
        <View style={styles.statsRow}>
          <StatCard label="Aircraft" value={aircraft.length} />
          <StatCard label="Components" value={components.length} />
        </View>

        <SectionHeader title="Aircraft" style={styles.sectionHeader} />
        {aircraft.length === 0 ? (
          <EmptyState title="No aircraft registered" />
        ) : (
          aircraft.map((a) => (
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
                <Text style={styles.itemMeta}>{a.model} · {a.manufacturer}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <SectionHeader title="Components" style={styles.sectionHeader} />
        {components.length === 0 ? (
          <EmptyState title="No components registered" />
        ) : (
          components.slice(0, 5).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.itemCard}
              onPress={() =>
                navigation.navigate('Components', {
                  screen: 'ComponentDetail',
                  params: { componentId: c.id },
                })
              }
            >
              <Cpu color={colors.primary} size={18} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{c.serial_number}</Text>
                <Text style={styles.itemMeta}>{c.component_type}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  readOnly: { color: colors.warning, fontSize: typography.size.xs, marginTop: 2 },
  logoutBtn: { paddingVertical: spacing.xs },
  logoutText: { color: colors.critical, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
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
});
