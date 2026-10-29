/**
 * Single source of truth for design tokens.
 *
 * Three tiers:
 *   1. primitive — raw values (palette, scales). Never used directly by components.
 *   2. semantic  — intent-named aliases (surface, text, border…), themed light/dark.
 *   3. component — local custom properties inside each *.module.css (e.g. --_bg),
 *                  which read from semantic tokens only.
 *
 * `npm run tokens` turns this file into src/styles/tokens.css. Keep this file free
 * of imports so Node can run the generator with plain type stripping.
 */

export const primitive = {
  color: {
    white: '255 255 255',
    black: '0 0 0',
    slate: { 50: '248 250 252', 100: '241 245 249', 300: '203 213 225', 500: '100 116 139', 700: '51 65 85', 900: '15 23 42', 950: '2 6 23' },
    indigo: { 300: '165 180 252', 400: '129 140 248', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202' },
    violet: { 400: '167 139 250', 500: '139 92 246' },
    cyan: { 400: '34 211 238' },
    pink: { 400: '244 114 182' },
    red: { 400: '248 113 113', 600: '220 38 38', 700: '185 28 28' },
    green: { 400: '74 222 128', 500: '34 197 94', 700: '21 128 61' },
    amber: { 400: '251 191 36', 500: '245 158 11', 700: '180 83 9', 800: '146 64 14' },
    sky: { 400: '56 189 248', 500: '14 165 233', 700: '3 105 161' },
  },
  blur: { none: '0px', sm: '8px', md: '16px', lg: '24px', xl: '40px' },
  saturate: { regular: '160%', vivid: '200%' },
  radius: { none: '0px', sm: '8px', md: '12px', lg: '20px', xl: '28px', full: '9999px' },
  space: { 0: '0px', px: '1px', '0-5': '2px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px' },
  font: {
    family: {
      sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
    size: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
    weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
    lineHeight: { tight: '1.2', normal: '1.5' },
  },
  duration: { fast: '120ms', normal: '200ms', slow: '320ms', loopFast: '800ms', loop: '1600ms', pulse: '2000ms', sheen: '640ms',
    // Settle times for the spring easings below; always pair them (e.g. --gds-duration-spring-bounce).
    springBounce: '690ms',
    springSnappy: '410ms',
    springGentle: '480ms',
  },
  controlHeight: { sm: '32px', md: '40px', lg: '48px' },
  // Geometry of the small form controls (box = checkbox/radio square, switch track, range slider).
  control: {
    box: { sm: '16px', md: '20px' },
    switchTrackW: { sm: '36px', md: '44px' },
    switchTrackH: { sm: '20px', md: '24px' },
    sliderTrack: '6px',
    sliderThumb: '20px',
    borderWidth: '1.5px',
  },
  size: { navbar: '64px', sidebar: '264px', sidebarCollapsed: '72px' },
  opacity: { disabled: '0.5', muted: '0.4', subdued: '0.72' },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1.3)',
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Damped springs sampled into CSS linear() (stiffness/damping: bounce 300/18, snappy 400/30, gentle 170/26).
    springBounce: 'linear(0, 0.061, 0.21, 0.401, 0.599, 0.78, 0.927, 1.035, 1.105, 1.14, 1.148, 1.136, 1.113, 1.084, 1.055, 1.029, 1.008, 0.993, 0.983, 0.979, 0.978, 0.98, 0.984, 0.988, 0.993, 0.996, 0.999, 1.001, 1.003, 1.003, 1.003, 1.003, 1)',
    springSnappy: 'linear(0, 0.029, 0.103, 0.202, 0.314, 0.427, 0.536, 0.635, 0.723, 0.798, 0.859, 0.909, 0.948, 0.977, 0.998, 1.012, 1.021, 1.026, 1.028, 1.028, 1.026, 1.024, 1.021, 1.017, 1.014, 1.011, 1.009, 1.006, 1.005, 1.003, 1.002, 1.001, 1)',
    springGentle: 'linear(0, 0.017, 0.059, 0.117, 0.184, 0.255, 0.327, 0.396, 0.462, 0.524, 0.581, 0.632, 0.679, 0.721, 0.757, 0.79, 0.819, 0.844, 0.866, 0.885, 0.902, 0.916, 0.928, 0.939, 0.948, 0.956, 0.962, 0.968, 0.973, 0.977, 0.981, 0.984, 1)',
  },
  zIndex: { base: '0', raised: '10', dropdown: '1000', overlay: '1100', modal: '1200', toast: '1300' },
} as const;

/** Writes `rgb(var-triplet / alpha)` so alpha stays a token-level decision. */
const rgb = (triplet: string, alpha = 1) => (alpha === 1 ? `rgb(${triplet})` : `rgb(${triplet} / ${alpha})`);
const c = primitive.color;

/** Every semantic token must exist in both themes: `dark` is typed by the keys of `light`. */
const light = {
  // Glass fills — translucent; always paired with a solid fallback below.
  'surface-glass-subtle': rgb(c.white, 0.25),
  'surface-glass': rgb(c.white, 0.45),
  'surface-glass-strong': rgb(c.white, 0.7),
  // Opaque equivalents for no-backdrop-filter, reduced transparency and high contrast.
  'surface-solid': rgb(c.slate[50]),
  'surface-solid-strong': rgb(c.white),
  'border-glass': rgb(c.white, 0.6),
  'border-glass-highlight': rgb(c.white, 0.9),
  'border-strong': rgb(c.slate[700]),
  'text-primary': rgb(c.slate[950]),
  'text-secondary': rgb(c.slate[700]),
  'text-on-accent': rgb(c.white),
  'accent': rgb(c.indigo[600]),
  'accent-hover': rgb(c.indigo[700]),
  'accent-glass': rgb(c.indigo[500], 0.18),
  'danger': rgb(c.red[600]),
  // Status: the solid colour is for text/icons on glass (AA on light glass); *-glass is a tinted fill.
  'danger-text': rgb(c.red[700]),
  'danger-glass': rgb(c.red[400], 0.18),
  'success': rgb(c.green[700]),
  'success-glass': rgb(c.green[500], 0.18),
  'warning': rgb(c.amber[700]),
  // amber-700 is < 4.5:1 on light glass; text and icons in the warning tone use this darker one.
  'warning-text': rgb(c.amber[800]),
  'warning-glass': rgb(c.amber[500], 0.2),
  'info': rgb(c.sky[700]),
  'info-glass': rgb(c.sky[500], 0.18),
  // Structural
  'border-subtle': rgb(c.slate[900], 0.1),
  'surface-track': rgb(c.slate[900], 0.12),
  'surface-scrim': rgb(c.slate[900], 0.3),
  'surface-selected': rgb(c.white, 0.85),
  'surface-stripe': rgb(c.slate[900], 0.04),
  'focus-ring': rgb(c.indigo[600]),
  'shadow-glass': `0 8px 32px ${rgb(c.slate[900], 0.12)}, inset 0 1px 0 ${rgb(c.white, 0.6)}`,
  'shadow-glass-raised': `0 16px 48px ${rgb(c.slate[900], 0.18)}, inset 0 1px 0 ${rgb(c.white, 0.7)}`,
} satisfies Record<string, string>;

export type SemanticToken = keyof typeof light;

const dark: Record<SemanticToken, string> = {
  'surface-glass-subtle': rgb(c.slate[900], 0.25),
  'surface-glass': rgb(c.slate[900], 0.45),
  'surface-glass-strong': rgb(c.slate[900], 0.7),
  'surface-solid': rgb(c.slate[900]),
  'surface-solid-strong': rgb(c.slate[950]),
  'border-glass': rgb(c.white, 0.14),
  'border-glass-highlight': rgb(c.white, 0.28),
  'border-strong': rgb(c.slate[300]),
  'text-primary': rgb(c.slate[50]),
  'text-secondary': rgb(c.slate[300]),
  'text-on-accent': rgb(c.slate[950]), // indigo-400 is too light for white text
  'accent': rgb(c.indigo[400]),
  'accent-hover': rgb(c.indigo[300]),
  'accent-glass': rgb(c.indigo[400], 0.22),
  'danger': rgb(c.red[400]),
  'danger-text': rgb(c.red[400]),
  'danger-glass': rgb(c.red[400], 0.2),
  'success': rgb(c.green[400]),
  'success-glass': rgb(c.green[400], 0.18),
  'warning': rgb(c.amber[400]),
  'warning-text': rgb(c.amber[400]),
  'warning-glass': rgb(c.amber[400], 0.18),
  'info': rgb(c.sky[400]),
  'info-glass': rgb(c.sky[400], 0.18),
  'border-subtle': rgb(c.white, 0.1),
  'surface-track': rgb(c.white, 0.14),
  'surface-scrim': rgb(c.black, 0.5),
  'surface-selected': rgb(c.white, 0.12),
  'surface-stripe': rgb(c.white, 0.04),
  'focus-ring': rgb(c.indigo[300]),
  'shadow-glass': `0 8px 32px ${rgb(c.black, 0.4)}, inset 0 1px 0 ${rgb(c.white, 0.08)}`,
  'shadow-glass-raised': `0 16px 48px ${rgb(c.black, 0.5)}, inset 0 1px 0 ${rgb(c.white, 0.12)}`,
};

export const semantic = { light, dark };

/** Contrast: light accent (indigo-600) + white and dark accent (indigo-400) + slate-950 both pass WCAG AA. */
