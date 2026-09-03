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
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Plus, ScanLine, XCircle } from 'lucide-react-native';

import { verificationApi } from '../../api/verification';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme/tokens';

/** Verification logs list — GET /api/verification/logs */
export const VerificationLogsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['verification', 'logs'],
    queryFn: verificationApi.getLogs,
  });

  if (isLoading) return <LoadingState message="Loading logs…" />;
  if (isError)
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load logs'}
        onRetry={refetch}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verification Logs</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate('NfcScan')}
        >
          <ScanLine color={colors.textInverse} size={20} />
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
            title="No verifications yet"
            message="Scan an NFC tag to create the first verification record."
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.logCard,
              item.final_result === 'AUTHENTIC'
                ? styles.logOk
                : item.final_result === 'SUSPICIOUS'
                ? styles.logWarn
                : styles.logCrit,
            ]}
          >
            <View style={styles.logIcon}>
              {item.final_result === 'AUTHENTIC' ? (
                <CheckCircle color={colors.verified} size={20} />
              ) : (
                <XCircle
                  color={item.final_result === 'SUSPICIOUS' ? colors.warning : colors.critical}
                  size={20}
                />
              )}
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.logResult}>{item.final_result}</Text>
              {item.failure_reason ? (
                <Text style={styles.logReason}>{item.failure_reason}</Text>
              ) : null}
              <Text style={styles.logDate}>
                {new Date(item.created_at).toLocaleString()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: { color: colors.textPrimary, fontSize: typography.size.xxl, fontWeight: typography.weight.bold },
  scanBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  emptyContainer: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  logCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  logOk: { backgroundColor: colors.verifiedMuted, borderColor: colors.verified },
  logWarn: { backgroundColor: colors.warningMuted, borderColor: colors.warning },
  logCrit: { backgroundColor: colors.criticalMuted, borderColor: colors.critical },
  logIcon: { paddingTop: 2 },
  logInfo: { flex: 1 },
  logResult: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  logReason: { color: colors.textMuted, fontSize: typography.size.sm, marginTop: 2 },
  logDate: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 4 },
});
