import React, { useState } from 'react';
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
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { CompanyStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<CompanyStackParamList>;

/** Super Admin: list all companies. GET /api/companies */
export const CompanyListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesApi.list,
  });

  if (isLoading) return <LoadingState message="Loading companies…" />;
  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load companies'}
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Companies</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateCompany')}
          accessibilityLabel="Create company"
        >
          <Plus color={colors.textInverse} size={20} />
        </TouchableOpacity>
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
        contentContainerStyle={
          !data?.length ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <EmptyState
            title="No companies yet"
            message="Tap + to create the first aviation company."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('CompanyDetail', { companyId: item.id })
            }
          >
            <View style={styles.iconWrap}>
              <Building2 color={colors.primary} size={20} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.user_count} users · {item.aircraft_count} aircraft ·{' '}
                {item.component_count} components
              </Text>
              <View
                style={[
                  styles.badge,
                  item.status === 'ACTIVE' ? styles.badgeActive : styles.badgeSuspended,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status === 'ACTIVE'
                      ? styles.badgeTextActive
                      : styles.badgeTextSuspended,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
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
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
  },
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
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 3 },
  name: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  meta: { color: colors.textMuted, fontSize: typography.size.xs },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 2,
  },
  badgeActive: { backgroundColor: colors.verifiedMuted },
  badgeSuspended: { backgroundColor: colors.criticalMuted },
  badgeText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  badgeTextActive: { color: colors.verified },
  badgeTextSuspended: { color: colors.critical },
});
