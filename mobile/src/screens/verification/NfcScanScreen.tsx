import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScanLine, X } from 'lucide-react-native';

import { useNfcVerification } from '../../hooks/useNfcVerification';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { VerificationStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<VerificationStackParamList>;

const STATE_LABELS: Record<string, string> = {
  idle: 'Ready to scan',
  scanning: 'Scanning NFC tag…',
  verifying: 'Verifying with backend…',
  success: 'Verification complete',
  error: 'Verification failed',
  cancelled: 'Scan cancelled',
};

/**
 * NFC Scan screen — Module 7.
 *
 * Uses MockNFCService (real NFC hardware integration is Module 6 deliverable).
 * The identifier override input lets devs test against specific DEMO-NFC-*
 * tag identifiers from the backend seed data without hardware.
 *
 * The backend's POST /api/verification/nfc verdict is the ONLY source of truth.
 * This screen never shows "AUTHENTIC" based on anything other than the backend
 * response.
 */
export const NfcScanScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { scanState, result, error, tagIdentifier, startVerification, cancel, reset } =
    useNfcVerification();

  const [devOverride, setDevOverride] = useState('DEMO-NFC-0001');
  const [showDevInput, setShowDevInput] = useState(true);
  const pulseAnim = new Animated.Value(1);

  // Pulse animation while scanning
  useEffect(() => {
    if (scanState === 'scanning' || scanState === 'verifying') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [scanState]);

  // Navigate to result when done
  useEffect(() => {
    if (scanState === 'success' && result) {
      navigation.replace('VerificationResult', {
        tagIdentifier: tagIdentifier ?? '',
        verified: result.verified,
        status: result.status,
        component: result.component
          ? {
              id: String(result.component.id),
              aircraft: result.component.aircraft ?? 'Unknown',
              serial_number: result.component.serial_number,
            }
          : null,
        checks: result.checks,
        failure_reason: result.failure_reason,
      });
    }
  }, [scanState, result]);

  const isActive = scanState === 'scanning' || scanState === 'verifying';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>NFC Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {/* Scan visual */}
        <Animated.View
          style={[styles.scanRing, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.scanInner}>
            <ScanLine
              color={isActive ? colors.primary : colors.textMuted}
              size={48}
            />
          </View>
        </Animated.View>

        {/* Status label */}
        <Text
          style={[
            styles.stateLabel,
            scanState === 'error' || scanState === 'cancelled'
              ? { color: colors.critical }
              : undefined,
          ]}
        >
          {STATE_LABELS[scanState] ?? scanState}
        </Text>
        {tagIdentifier ? (
          <Text style={styles.tagId}>Tag: {tagIdentifier}</Text>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Dev override input (mock mode only) */}
        {showDevInput && !isActive ? (
          <View style={styles.devBox}>
            <Text style={styles.devLabel}>🔧 Mock Mode — Tag Identifier Override</Text>
            <TextInput
              style={styles.devInput}
              value={devOverride}
              onChangeText={setDevOverride}
              placeholder="DEMO-NFC-0001"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.devHint}>
              Use DEMO-NFC-0001…0004 for AUTHENTIC results (requires DEMO_SEED=true on backend)
            </Text>
          </View>
        ) : null}

        {/* Action buttons */}
        <View style={styles.actions}>
          {isActive ? (
            <TouchableOpacity style={styles.cancelBtn} onPress={cancel}>
              <Text style={styles.cancelBtnText}>Cancel Scan</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => {
                reset();
                startVerification(showDevInput ? devOverride.trim() || undefined : undefined);
              }}
            >
              {(scanState as string) === 'scanning' || (scanState as string) === 'verifying' ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <ScanLine color={colors.textInverse} size={22} />
              )}
              <Text style={styles.scanBtnText}>
                {scanState === 'idle' ? 'Start Scan' : 'Scan Again'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dev mode toggle */}
        <TouchableOpacity
          onPress={() => setShowDevInput((v) => !v)}
          style={styles.devToggle}
        >
          <Text style={styles.devToggleText}>
            {showDevInput ? 'Hide' : 'Show'} developer options
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, textAlign: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  scanRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateLabel: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  tagId: { color: colors.textMuted, fontSize: typography.size.sm, fontFamily: 'monospace' },
  errorText: { color: colors.critical, fontSize: typography.size.sm, textAlign: 'center' },
  devBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  devLabel: { color: colors.warning, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  devInput: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.textPrimary,
    fontFamily: 'monospace',
    fontSize: typography.size.sm,
  },
  devHint: { color: colors.textMuted, fontSize: typography.size.xs },
  actions: { width: '100%' },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  scanBtnText: { color: colors.textInverse, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  cancelBtn: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.critical,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  cancelBtnText: { color: colors.critical, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  devToggle: { paddingVertical: spacing.sm },
  devToggleText: { color: colors.textMuted, fontSize: typography.size.sm, textDecorationLine: 'underline' },
});
