import React from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Cpu, Plane } from 'lucide-react-native';

import { aircraftApi } from '../../api/aircraft';
import { ErrorState, LoadingState, SectionHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { FleetStackParamList, ComponentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<FleetStackParamList>;
type Route = RouteProp<FleetStackParamList, 'AircraftDetail'>;

/** GET /api/aircraft/:id — returns aircraft with its components. */
export const AircraftDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { aircraftId } = route.params;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['aircraft', aircraftId],
    queryFn: () => aircraftApi.getById(aircraftId),
  });

  if (isLoading) return <LoadingState message="Loading aircraft…" />;
  if (isError)
    return <ErrorState message="Failed to load aircraft" onRetry={refetch} />;

  const aircraft = data!;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {aircraft.registration_number}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Aircraft identity */}
        <View style={styles.aircraftCard}>
          <View style={styles.planeIcon}>
            <Plane color={colors.primary} size={32} />
          </View>
          <Text style={styles.reg}>{aircraft.registration_number}</Text>
          <Text style={styles.model}>{aircraft.model}</Text>
          <Text style={styles.mfr}>{aircraft.manufacturer}</Text>
          <View
            style={[
              styles.statusBadge,
              aircraft.status === 'ACTIVE' ? styles.statusActive : styles.statusWarning,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                aircraft.status === 'ACTIVE'
                  ? styles.statusTextActive
                  : styles.statusTextWarning,
              ]}
            >
              {aircraft.status}
            </Text>
          </View>
        </View>

        {/* Metadata */}
        <SectionHeader title="Details" style={styles.sectionHeader} />
        <View style={styles.detailCard}>
          <DetailRow label="Aircraft UUID" value={aircraft.aircraft_uuid} mono />
          <DetailRow label="Registration" value={aircraft.registration_number} />
          <DetailRow label="Model" value={aircraft.model} />
          <DetailRow label="Manufacturer" value={aircraft.manufacturer} />
          <DetailRow label="Status" value={aircraft.status} />
          <DetailRow label="Added" value={new Date(aircraft.created_at).toLocaleDateString()} />
        </View>

        {/* Components */}
        <SectionHeader
          title={`Components (${aircraft.components.length})`}
          style={styles.sectionHeader}
        />
        {aircraft.components.length === 0 ? (
          <Text style={styles.emptyText}>No components attached to this aircraft.</Text>
        ) : (
          aircraft.components.map((comp) => (
            <TouchableOpacity
              key={comp.id}
              style={styles.componentCard}
              onPress={() => {
                // Navigate to component detail — accessed via the Components tab
                // since we're inside the Fleet stack here
              }}
            >
              <Cpu color={colors.primary} size={18} />
              <View style={styles.compInfo}>
                <Text style={styles.compSerial}>{comp.serial_number}</Text>
                <Text style={styles.compType}>{comp.component_type} · {comp.manufacturer}</Text>
              </View>
              <ChevronRight color={colors.textMuted} size={16} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={[rowStyles.value, mono ? rowStyles.mono : undefined]} numberOfLines={1} ellipsizeMode="middle">
      {value}
    </Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  label: { flex: 1, color: colors.textMuted, fontSize: typography.size.sm },
  value: { flex: 2, color: colors.textPrimary, fontSize: typography.size.sm, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: typography.size.xs },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  aircraftCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  planeIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reg: { color: colors.textPrimary, fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  model: { color: colors.textSecondary, fontSize: typography.size.md },
  mfr: { color: colors.textMuted, fontSize: typography.size.sm },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusActive: { backgroundColor: colors.verifiedMuted },
  statusWarning: { backgroundColor: colors.warningMuted },
  statusText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  statusTextActive: { color: colors.verified },
  statusTextWarning: { color: colors.warning },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  componentCard: {
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
  compInfo: { flex: 1 },
  compSerial: { color: colors.textPrimary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  compType: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  emptyText: { color: colors.textMuted, fontSize: typography.size.sm, textAlign: 'center', paddingVertical: spacing.lg },
});
