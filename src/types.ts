/**
 * Shared prop vocabularies. Components narrow them with `Extract<Tone, …>` so every component
 * spells a tone or size the same way, and docs can link to one definition.
 */

/** Semantic colour intent. Each tone maps to a `--gds-<tone>` / `--gds-<tone>-glass` token pair. */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/** Control size, mapped to `--gds-control-height-*` where the component has a height. */
export type Size = 'sm' | 'md' | 'lg';
