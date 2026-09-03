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
import { ChevronRight, Plane, Plus } from 'lucide-react-native';

import { aircraftApi } from '../../api/aircraft';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { canPerform } from '../../constants/roles';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { FleetStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<FleetStackParamList>;

/** GET /api/aircraft — all company-scoped roles can view. */
export const AircraftListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const canCreate = canPerform(user?.role, 'CREATE_AIRCRAFT');

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['aircraft'],
    queryFn: aircraftApi.list,
  });

  if (isLoading) return <LoadingState message="Loading fleet…" />;
  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load aircraft'}
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fleet</Text>
        {canCreate ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateAircraft')}
            accessibilityLabel="Create aircraft"
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
            title="No aircraft registered"
            message={
              canCreate
                ? 'Tap + to register the first aircraft.'
                : 'No aircraft have been registered yet.'
            }
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('AircraftDetail', { aircraftId: item.id })
            }
          >
            <View style={styles.iconWrap}>
              <Plane color={colors.primary} size={20} />
            </View>
            <View style={styles.info}>
              <Text style={styles.reg}>{item.registration_number}</Text>
              <Text style={styles.model}>{item.model}</Text>
              <Text style={styles.mfr}>{item.manufacturer}</Text>
            </View>
            <View style={styles.right}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.status === 'ACTIVE' ? colors.verified : colors.warning },
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
  reg: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  model: { color: colors.textSecondary, fontSize: typography.size.sm, marginTop: 2 },
  mfr: { color: colors.textMuted, fontSize: typography.size.xs },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
