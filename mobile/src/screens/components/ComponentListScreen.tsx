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
import { ChevronRight, Cpu, Plus } from 'lucide-react-native';

import { componentsApi } from '../../api/components';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { canPerform } from '../../constants/roles';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { ComponentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ComponentStackParamList>;

/** GET /api/components — all company-scoped roles. */
export const ComponentListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const canCreate = canPerform(user?.role, 'CREATE_COMPONENT');

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['components'],
    queryFn: componentsApi.list,
  });

  if (isLoading) return <LoadingState message="Loading components…" />;
  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load components'}
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Components</Text>
        {canCreate ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateComponent')}
            accessibilityLabel="Create component"
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
            title="No components registered"
            message={
              canCreate
                ? 'Tap + to register the first component.'
                : 'No components have been registered yet.'
            }
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('ComponentDetail', { componentId: item.id })
            }
          >
            <View style={styles.iconWrap}>
              <Cpu color={colors.primary} size={20} />
            </View>
            <View style={styles.info}>
              <Text style={styles.serial}>{item.serial_number}</Text>
              <Text style={styles.type}>{item.component_type}</Text>
              <Text style={styles.mfr}>
                {item.manufacturer}
                {item.aircraft_registration
                  ? ` · ${item.aircraft_registration}`
                  : ' · Unattached'}
              </Text>
            </View>
            <View style={styles.right}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      item.status === 'OPERATIONAL'
                        ? colors.verified
                        : item.status === 'MAINTENANCE'
                        ? colors.warning
                        : colors.critical,
                  },
                ]}
              />
              <ChevronRight color={colors.textMuted} size={18} />
            </View>
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
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  serial: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  type: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  mfr: { color: colors.textMuted, fontSize: typography.size.xs },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
