/**
 * Global class for the glass recipe in src/styles/glass.css.
 * Not a CSS Module on purpose: `composes` across files duplicates the recipe in the bundle.
 */
export const GLASS_CLASS = 'gds-glass';

/**
 * Global class from src/styles/glass.css: a specular highlight sweeps across the element on hover and
 * keyboard focus. Uses the element's own `::after` and sets `overflow: clip` on it (descendants are
 * clipped; the element's own focus outline is not). Equivalent to the `data-sheen` attribute.
 * Off under reduced motion, reduced transparency, more contrast and forced colors.
 */
export const GLASS_SHEEN_CLASS = 'gds-sheen';
