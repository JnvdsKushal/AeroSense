import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { maintenanceApi } from '../../api/maintenance';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { MaintenanceStackParamList } from '../../navigation/types';

type Route = RouteProp<MaintenanceStackParamList, 'ComponentHistory'>;

/** GET /api/components/:id/history — full maintenance history for one component. */
export const ComponentHistoryScreen: React.FC = () => {
  const route = useRoute<Route>();
  const { componentId } = route.params;

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['component', componentId, 'history'],
    queryFn: () => maintenanceApi.getComponentHistory(componentId),
  });

  if (isLoading) return <LoadingState message="Loading history…" />;
  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load history'}
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Maintenance History</Text>
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
          <EmptyState title="No maintenance history" message="No records found for this component." />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={[
                styles.resultBar,
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
            <View style={styles.info}>
              <Text style={styles.type}>{item.maintenance_type}</Text>
              <Text style={styles.meta}>
                {item.inspection_result} · {item.technician_name}
              </Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
              {item.description ? <Text style={styles.notes}>{item.description}</Text> : null}
              <Text style={styles.hash} numberOfLines={1} ellipsizeMode="middle">
                {item.record_hash}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  emptyContainer: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  resultBar: { width: 4 },
  info: { flex: 1, padding: spacing.md },
  type: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  meta: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  date: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  notes: { color: colors.textMuted, fontSize: typography.size.sm, marginTop: spacing.xs, fontStyle: 'italic' },
  hash: { color: colors.textMuted, fontSize: 10, fontFamily: 'monospace', marginTop: spacing.xs },
});
