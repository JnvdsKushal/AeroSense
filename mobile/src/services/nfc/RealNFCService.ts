import NfcManager, {
    NfcTech,
    NfcEvents,
    TagEvent,
} from 'react-native-nfc-manager';

import type { NFCService } from './NFCService';
import type { NfcScanOutcome } from './types';

export class RealNFCService implements NFCService {
    private scanning = false;

    async isSupported(): Promise<boolean> {
        try {
            const supported = await NfcManager.isSupported();

            if (!supported) {
                return false;
            }

            const enabled = await NfcManager.isEnabled();

            return enabled;
        } catch (error) {
            console.error('[NFC] Failed to check NFC support:', error);
            return false;
        }
    }

    async scan(): Promise<NfcScanOutcome> {
        if (this.scanning) {
            return {
                state: 'error',
                message: 'An NFC scan is already in progress.',
            };
        }

        this.scanning = true;

        try {
            const supported = await NfcManager.isSupported();

            if (!supported) {
                return {
                    state: 'error',
                    message: 'NFC is not supported on this device.',
                };
            }

            const enabled = await NfcManager.isEnabled();

            if (!enabled) {
                return {
                    state: 'error',
                    message: 'NFC is disabled. Please enable NFC in your phone settings.',
                };
            }

            console.log('[NFC] Starting NFC scan...');

            await NfcManager.start();

            await NfcManager.requestTechnology(NfcTech.NfcA, {
                alertMessage: 'Hold your phone near the NFC tag.',
            });

            console.log('[NFC] NFC-A technology requested.');

            const tag = await NfcManager.getTag();

            console.log('[NFC] Tag detected:', tag);

            if (!tag) {
                return {
                    state: 'error',
                    message: 'No NFC tag information was received.',
                };
            }

            const identifier = this.extractIdentifier(tag);

            if (!identifier) {
                return {
                    state: 'error',
                    message: 'The NFC tag was detected, but its UID could not be read.',
                };
            }

            console.log('[NFC] UID:', identifier);

            return {
                state: 'success',
                data: {
                    identifier,
                    technology: 'NFC',
                    security_type: 'TYPE_2',
                },
            };
        } catch (error: any) {
            console.error('[NFC] Scan failed:', error);

            const message =
                error?.message ||
                error?.toString?.() ||
                'Unable to read the NFC tag.';

            return {
                state: 'error',
                message,
            };
        } finally {
            try {
                await NfcManager.cancelTechnologyRequest();
            } catch {
                // Safe to ignore if no technology request is active.
            }

            this.scanning = false;

            console.log('[NFC] Scan session cleaned up.');
        }
    }

    async cancelScan(): Promise<void> {
        try {
            await NfcManager.cancelTechnologyRequest();
        } catch (error) {
            console.warn('[NFC] Cancel failed:', error);
        } finally {
            this.scanning = false;
        }
    }

    private extractIdentifier(tag: TagEvent): string | null {
        const rawId = tag.id;

        if (!rawId) {
            return null;
        }

        if (typeof rawId === 'string') {
            return this.normalizeUid(rawId);
        }

        if (Array.isArray(rawId)) {
            const bytes = rawId as number[];

            return bytes
                .map((byte) => byte.toString(16).padStart(2, '0'))
                .join(':')
                .toUpperCase();
        }

        return null;
    }

    private normalizeUid(uid: string): string {
        const cleaned = uid
            .replace(/[^0-9a-fA-F]/g, '')
            .toUpperCase();

        if (!cleaned) {
            return '';
        }

        const bytes = cleaned.match(/.{1,2}/g);

        return bytes ? bytes.join(':') : cleaned;
    }
}