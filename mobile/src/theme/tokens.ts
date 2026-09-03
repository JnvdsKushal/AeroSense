/**
 * Design tokens for the Aero-Sense mobile app.
 *
 * This is a distinct, mobile-first visual identity — not a port of the web
 * app's warm/editorial palette (`frontend/src/components/ui/Badge.tsx` etc.
 * use a cream/ink/pebble palette suited to a marketing-adjacent desktop
 * app). The mobile app leans into a darker, instrument-panel-inspired
 * aviation register: it's a field tool a technician or inspector reaches
 * for on a tarmac or in a hangar, not a dashboard browsed at a desk.
 *
 * Status colors are semantically aligned with the web app's tone system
 * (verified/warning/critical/info/neutral) so "AUTHENTIC" / "SUSPICIOUS" /
 * "INVALID" always mean the same thing by color across both apps, even
 * though the exact hex values and surrounding palette differ.
 */

export const colors = {
  // Base surfaces
  background: '#0B1420',
  surface: '#12202F',
  surfaceRaised: '#182B3D',
  border: '#25394D',
  borderSubtle: '#1B2B3B',

  // Text
  textPrimary: '#F3F6F9',
  textSecondary: '#9FB2C4',
  textMuted: '#6C7F92',
  textInverse: '#0B1420',

  // Brand / accent — instrument-panel amber-cyan pairing
  accent: '#2FA8C9',
  accentMuted: '#1E4A5B',
  primary: '#2FA8C9',
  primaryPressed: '#278FAD',

  // Semantic status — aligned in meaning with the web app's Badge tones
  verified: '#3ECF8E',
  verifiedMuted: '#12321F',
  warning: '#F2B94D',
  warningMuted: '#3A2C10',
  critical: '#F0665A',
  criticalMuted: '#3A1815',
  info: '#5FA8E0',
  infoMuted: '#152C3F',
  neutral: '#9FB2C4',
  neutralMuted: '#1B2B3B',

  // Overlays
  overlay: 'rgba(6, 12, 20, 0.72)',
  scrim: 'rgba(6, 12, 20, 0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  family: {
    // System fonts for Module 0 — no custom font loading yet, keeps the
    // foundation dependency-light. A distinct display/mono pairing can be
    // introduced in a later module without touching component code, since
    // everything reads from this token file.
    regular: undefined as string | undefined,
    medium: undefined as string | undefined,
    semibold: undefined as string | undefined,
    mono: 'monospace',
  },
  size: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 30,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
} as const;

/** Touch targets must stay comfortably tappable on a phone — this is the
 * minimum height reusable interactive components (Button, ListItem rows,
 * etc.) should enforce. */
export const minTouchTarget = 44;
