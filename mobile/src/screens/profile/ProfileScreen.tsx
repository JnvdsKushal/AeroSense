import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Key, LogOut, User } from 'lucide-react-native';

import { useAuthStore } from '../../store/authStore';
import { ROLE_LABELS } from '../../constants/roles';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

/** Profile screen — shows user identity and provides change password / logout. */
export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <User color={colors.primary} size={40} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
            </Text>
          </View>
        </View>

        {/* Identity details */}
        <View style={styles.card}>
          <Row label="User UUID" value={user.uuid} mono />
          {user.company_id ? (
            <Row label="Company ID" value={String(user.company_id)} />
          ) : (
            <Row label="Company" value="Platform Super Admin" />
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Key color={colors.primary} size={20} />
            <Text style={styles.actionText}>Change Password</Text>
            <ChevronRight color={colors.textMuted} size={18} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => logout()}
          >
            <LogOut color={colors.critical} size={20} />
            <Text style={[styles.actionText, { color: colors.critical }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Aero-Sense Mobile v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text
      style={[rowStyles.value, mono ? rowStyles.mono : undefined]}
      numberOfLines={1}
      ellipsizeMode="middle"
    >
      {value}
    </Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  label: { flex: 1, color: colors.textMuted, fontSize: typography.size.sm },
  value: { flex: 2, color: colors.textPrimary, fontSize: typography.size.sm, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: typography.size.xs },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  pageTitle: { color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold, marginBottom: spacing.xl },
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  email: { color: colors.textMuted, fontSize: typography.size.sm },
  roleBadge: { backgroundColor: colors.infoMuted, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  roleText: { color: colors.info, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  actionsCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.xl },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  actionText: { flex: 1, color: colors.textPrimary, fontSize: typography.size.md },
  divider: { height: 1, backgroundColor: colors.border },
  version: { color: colors.textMuted, fontSize: typography.size.xs, textAlign: 'center' },
});
