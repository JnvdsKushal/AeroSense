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
import { ChevronRight, ClipboardList, Plus } from 'lucide-react-native';

import { maintenanceApi } from '../../api/maintenance';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { canPerform } from '../../constants/roles';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { MaintenanceStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MaintenanceStackParamList>;

/** GET /api/maintenance — all company-scoped roles can view. */
export const MaintenanceListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const canCreate = canPerform(user?.role, 'CREATE_MAINTENANCE');

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['maintenance'],
    queryFn: maintenanceApi.list,
  });

  if (isLoading) return <LoadingState message="Loading maintenance records…" />;
  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load records'}
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Maintenance</Text>
        {canCreate ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateMaintenance')}
            accessibilityLabel="Create maintenance record"
          >
            <Plus color={colors.textInverse} size={20} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={!data?.length ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No maintenance records"
            message={
              canCreate
                ? 'Tap + to log the first maintenance record.'
                : 'No maintenance records yet.'
            }
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('MaintenanceDetail', { recordId: item.id })
            }
          >
            <View
              style={[
                styles.resultIndicator,
                {
                  backgroundColor:
                    item.inspection_result === 'PASSED'
                      ? colors.verified
                      : item.inspection_result === 'WARNING'
                      ? colors.warning
                      : colors.critical,
                },
              ]}
            />
            <View style={styles.iconWrap}>
              <ClipboardList color={colors.primary} size={18} />
            </View>
            <View style={styles.info}>
              <Text style={styles.type}>{item.maintenance_type}</Text>
              <Text style={styles.meta}>
                {item.inspection_result} · Component #{item.component_id}
              </Text>
              <Text style={styles.tech}>
                {item.technician_name} · {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <ChevronRight color={colors.textMuted} size={18} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: { color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  emptyContainer: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    overflow: 'hidden',
  },
  resultIndicator: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: 2 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  info: { flex: 1 },
  type: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  meta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  tech: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
});
