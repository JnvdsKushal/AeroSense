import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  CheckCircle,
  ChevronLeft,
  Shield,
  XCircle,
} from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { VerificationStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<VerificationStackParamList>;
type Route = RouteProp<VerificationStackParamList, 'VerificationResult'>;

/**
 * Verification result screen.
 * Displays the backend's VerificationResponse verbatim — no client-side
 * verdict interpretation. The status field is exactly what the backend
 * returned ("AUTHENTIC" | "SUSPICIOUS" | "INVALID").
 */
export const VerificationResultScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tagIdentifier, verified, status, component, checks, failure_reason } =
    route.params;

  const isAuthentic = status === 'AUTHENTIC';
  const isSuspicious = status === 'SUSPICIOUS';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Verification Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Primary result */}
        <View
          style={[
            styles.resultCard,
            isAuthentic
              ? styles.resultOk
              : isSuspicious
              ? styles.resultWarn
              : styles.resultCrit,
          ]}
        >
          {isAuthentic ? (
            <CheckCircle color={colors.verified} size={48} />
          ) : (
            <XCircle
              color={isSuspicious ? colors.warning : colors.critical}
              size={48}
            />
          )}
          <Text
            style={[
              styles.resultLabel,
              {
                color: isAuthentic
                  ? colors.verified
                  : isSuspicious
                  ? colors.warning
                  : colors.critical,
              },
            ]}
          >
            {status}
          </Text>
          {failure_reason ? (
            <Text style={styles.failureReason}>{failure_reason}</Text>
          ) : (
            <Text style={styles.successMsg}>All security checks passed.</Text>
          )}
        </View>

        {/* Tag identifier */}
        <View style={styles.tagCard}>
          <Text style={styles.tagLabel}>TAG IDENTIFIER</Text>
          <Text style={styles.tagId}>{tagIdentifier}</Text>
        </View>

        {/* Component info */}
        {component ? (
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Registered Component</Text>
            <Row label="Serial Number" value={component.serial_number} />
            <Row label="Aircraft" value={component.aircraft} />
          </View>
        ) : (
          <View style={[styles.detailCard, styles.unregisteredCard]}>
            <Text style={styles.unregisteredText}>
              This tag is not registered to any component in your company.
            </Text>
          </View>
        )}

        {/* Checks breakdown */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Security Checks</Text>
          <CheckRow
            label="NFC Authentication"
            passed={checks.nfc_authentication}
          />
          <CheckRow
            label="Component Binding"
            passed={checks.component_binding}
          />
          <CheckRow label="Tamper Status" passed={checks.tamper_status} />
          <CheckRow
            label="Blockchain Integrity"
            passed={checks.blockchain_integrity}
          />
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => navigation.replace('NfcScan')}
        >
          <Shield color={colors.textInverse} size={18} />
          <Text style={styles.scanAgainText}>Scan Another Tag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logsBtn}
          onPress={() => navigation.navigate('VerificationLogs')}
        >
          <Text style={styles.logsBtnText}>View All Verification Logs</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={rowStyles.value}>{value}</Text>
  </View>
);

const CheckRow: React.FC<{ label: string; passed: boolean }> = ({
  label,
  passed,
}) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    {passed ? (
      <CheckCircle color={colors.verified} size={16} />
    ) : (
      <XCircle color={colors.critical} size={16} />
    )}
  </View>
);

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  label: { flex: 1, color: colors.textSecondary, fontSize: typography.size.sm },
  value: { color: colors.textPrimary, fontSize: typography.size.sm },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, textAlign: 'center' },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  resultCard: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  resultOk: { backgroundColor: colors.verifiedMuted, borderColor: colors.verified },
  resultWarn: { backgroundColor: colors.warningMuted, borderColor: colors.warning },
  resultCrit: { backgroundColor: colors.criticalMuted, borderColor: colors.critical },
  resultLabel: { fontSize: typography.size.display, fontWeight: typography.weight.bold, letterSpacing: 2 },
  failureReason: { color: colors.textSecondary, fontSize: typography.size.sm, textAlign: 'center' },
  successMsg: { color: colors.verified, fontSize: typography.size.sm },
  tagCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tagLabel: { color: colors.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.bold, letterSpacing: 1 },
  tagId: { color: colors.textPrimary, fontFamily: 'monospace', fontSize: typography.size.md },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  unregisteredCard: { borderColor: colors.warning },
  unregisteredText: { color: colors.warning, fontSize: typography.size.sm },
  sectionTitle: { color: colors.textSecondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginBottom: spacing.sm },
  scanAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  scanAgainText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  logsBtn: { alignItems: 'center', paddingVertical: spacing.md },
  logsBtnText: { color: colors.primary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
});
