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
    red: { 400: '248 113 113', 600: '220 38 38' },
  },
  blur: { none: '0px', sm: '8px', md: '16px', lg: '24px', xl: '40px' },
  saturate: { regular: '160%', vivid: '200%' },
  radius: { none: '0px', sm: '8px', md: '12px', lg: '20px', xl: '28px', full: '9999px' },
  space: { 0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px' },
  font: {
    family: {
      sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    },
    size: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem' },
    weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
    lineHeight: { tight: '1.2', normal: '1.5' },
  },
  duration: { fast: '120ms', normal: '200ms', slow: '320ms' },
  easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', emphasized: 'cubic-bezier(0.3, 0, 0, 1.3)' },
  zIndex: { base: '0', raised: '10', dropdown: '1000', overlay: '1100', modal: '1200', toast: '1300' },
} as const;

/** Writes `rgb(var-triplet / alpha)` so alpha stays a token-level decision. */
const rgb = (triplet: string, alpha = 1) => (alpha === 1 ? `rgb(${triplet})` : `rgb(${triplet} / ${alpha})`);
const c = primitive.color;

type SemanticTheme = Record<string, string>;

export const semantic: { light: SemanticTheme; dark: SemanticTheme } = {
  light: {
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
    'focus-ring': rgb(c.indigo[600]),
    'shadow-glass': `0 8px 32px ${rgb(c.slate[900], 0.12)}, inset 0 1px 0 ${rgb(c.white, 0.6)}`,
    'shadow-glass-raised': `0 16px 48px ${rgb(c.slate[900], 0.18)}, inset 0 1px 0 ${rgb(c.white, 0.7)}`,
  },
  dark: {
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
    'focus-ring': rgb(c.indigo[300]),
    'shadow-glass': `0 8px 32px ${rgb(c.black, 0.4)}, inset 0 1px 0 ${rgb(c.white, 0.08)}`,
    'shadow-glass-raised': `0 16px 48px ${rgb(c.black, 0.5)}, inset 0 1px 0 ${rgb(c.white, 0.12)}`,
  },
};

/** Contrast: light accent (indigo-600) + white and dark accent (indigo-400) + slate-950 both pass WCAG AA. */
