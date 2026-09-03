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
import { Plus, User } from 'lucide-react-native';

import { usersApi } from '../../api/users';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { ROLE_LABELS } from '../../constants/roles';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { UserStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<UserStackParamList>;

/**
 * Company Admin: list all users in the caller's own company.
 * GET /api/users — company_id from JWT, never from client.
 */
export const UserListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  if (isLoading) return <LoadingState message="Loading users…" />;
  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load users'}
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Team</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateUser')}
          accessibilityLabel="Create user"
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
        contentContainerStyle={!data?.length ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No users yet"
            message="Tap + to add the first team member."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <User color={colors.primary} size={20} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {ROLE_LABELS[item.role as keyof typeof ROLE_LABELS] ?? item.role}
                </Text>
              </View>
            </View>
          </View>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 3 },
  name: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  email: { color: colors.textMuted, fontSize: typography.size.xs },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.infoMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 2,
  },
  roleText: { color: colors.info, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
});
