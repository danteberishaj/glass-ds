# GOTCHA.md: mistakes we've made (or will)

Read this before changing anything. Add an entry the moment you lose time to something non-obvious.
Format: **symptom** → cause → fix. Newest entries go at the top of their section.

## Build & packaging

- **The glass recipe appears many times in `dist/glass-ds.css`, and later copies override variant rules.**
  → CSS Modules `composes: x from './other.module.css'` makes Vite emit the composed file again for every
  importer. → Shared styles are a single *global* class (`.gds-glass` in `styles/glass.css`, applied via
  `GLASS_CLASS`). Don't use cross-file `composes`.
- **`'use client'` appears twice at the top of output files.** → Rolldown (Vite 8) keeps module directives with
  `preserveModules`. Our `preserveUseClient` plugin is only a safety net and must not add the directive
  when it's already there. → The plugin checks first. After a Vite/Rolldown upgrade, check
  `head -1 dist/components/TextField/TextField.js`.
- **`'use client'` missing in dist → Next.js error "useId only works in a Client Component".** → A bundler
  dropped the directive, or the file doesn't start with it (comments are fine above it, imports are not).
  → Keep `preserveModules: true` (one output file per source file) and the `preserveUseClient` plugin.
- **Consumers get "Cannot find module './Button.module.css'" or Next.js Pages Router rejects global CSS from
  node_modules.** → JS output importing CSS. → Vite lib mode with `cssCodeSplit: false` extracts all CSS into
  `dist/glass-ds.css`, and consumers import `glass-ds/styles.css` once. Never hand-write a CSS import into the JS output.
- **Storybook build fails or behaves like a library build.** → `vite.config.ts` lib/rollup options leak into
  Storybook. → `.storybook/main.ts` `viteFinal` deletes `build.lib` and `build.rollupOptions`.
- **`npm run test:next` passes against old code.** → `examples/next-app/package-lock.json` pinned the previous
  tarball's integrity hash, so npm reinstalled the stale `glass-ds`. → The script deletes that lockfile
  (gitignored) before installing.
- **Linking the library with `file:../..` or `npm link` → "Invalid hook call" / two copies of React.** → The
  symlinked package resolves `react` from the repo's own node_modules. → Test consumers with `npm pack`
  tarballs (what `test:next` does).
- **Next.js warns "inferred your workspace root" in the example.** → Two lockfiles (repo + example). →
  `turbopack.root` is set in `examples/next-app/next.config.ts`.
- **"A PostCSS plugin did not pass the `from` option" warning during build.** → Comes from Vite internals with
  CSS Modules. Harmless, ignore it.

## Tooling versions

- **typescript-eslint peer warnings or crashes on TypeScript 7.** → typescript-eslint supports TS `<6.1`.
  → TypeScript is pinned to `~6.0`. Recheck before bumping.
- **`eslint-plugin-jsx-a11y` doesn't support ESLint 10.** → We don't use it. a11y is enforced at runtime instead:
  axe in Vitest (`src/test/axe.ts`) and Storybook's a11y addon (`a11y.test: 'error'`).
- **`node scripts/build-tokens.ts` fails on `import ... from './other'`.** → Node's type stripping needs explicit
  `.ts` extensions and no TS-only syntax (enums, namespaces). → `tokens.ts` has no imports. Keep it that way.

## React / Next.js (RSC)

- **`Card.Header` is `undefined` when used from a Server Component.** → Client-reference proxies don't carry
  static properties. → Compound parts are flat named exports (`CardHeader`).
- **Hydration mismatch on ids.** → `Math.random()`/counters differ between server and client. → `useId()`.
- **"Event handlers cannot be passed to Client Component props" when passing `onClick` to `<Button>` from a
  Server Component.** → That's how Next.js works, not a bug in the design system. → The caller wraps it in its own
  `'use client'` component (see `examples/next-app/app/counter.tsx`). Don't mark Button `'use client'` to "fix" this.
- **Theme flashes on load / hydration warning on `<html>`.** → A theme script sets `data-theme` before React
  hydrates. → Consumers add `suppressHydrationWarning` on `<html>` (next-themes: `attribute="data-theme"`).
- **React 18 users see `ref` passed through as a prop and not forwarded.** → We use React 19 ref-as-prop.
  → The peer range is `^19.0.0` on purpose. Don't widen it without bringing back `forwardRef`.

## Glassmorphism CSS

- **Glass looks like flat white/grey.** → No backdrop: nothing behind it to blur. → Always preview on the
  Storybook vivid backdrop. `OnPlainBackground` stories show the intended fallback.
- **Nested glass doesn't blur the page behind it.** → An element with `backdrop-filter` becomes the
  *backdrop root* for its descendants. A glass child only sees its glass parent's content. → Avoid glass-in-glass.
  For an inner surface, use a higher `intensity` fill without relying on more blur.
- **`position: fixed` child (tooltip, menu) is positioned relative to a glass card instead of the viewport,
  or gets clipped.** → `backdrop-filter` (like `transform`/`filter`) creates a containing block for fixed
  descendants. → Render overlays in a portal to `document.body`.
- **Blur bleeds past rounded corners in Safari, or the corners look square.** → Older WebKit painting bugs with
  `backdrop-filter` + `border-radius` + `overflow`. → Put radius and blur on the same element. If content must
  clip, add `overflow: hidden` there, not on a wrapper.
- **No blur in Safari.** → Older Safari needs the `-webkit-backdrop-filter` prefix, and we don't run
  Autoprefixer. → `glass.css` writes both. Keep them in sync.
- **Unreadable text when the backdrop or the browser doesn't cooperate.** → Translucent fill without a fallback.
  → `glass.css` paints the opaque `--gds-surface-solid` first, and only switches to translucent inside
  `@supports (backdrop-filter)`. Overrides for `prefers-reduced-transparency`, `prefers-contrast: more` and
  `forced-colors` come last, so they win.
- **Janky scrolling on mobile.** → Many or large `backdrop-filter` layers, or an animated blur radius. →
  Limit glass layers per screen. Animate `opacity`/`transform` only, never `backdrop-filter`.
- **A component override in a CSS Module doesn't apply over `.gds-glass`.** → Same specificity, and source order
  across files isn't guaranteed. → Tune via the `--_fill`/`--_blur` custom properties, or raise specificity with
  the state/attribute selector you need anyway (`.root:hover`, `[data-…]`).

## Accessibility

- **axe reports color-contrast as "incomplete" (not pass) on every glass story.** → axe can't compute contrast
  over translucent fills on gradient backgrounds. → Check contrast by hand (DevTools picker on the rendered
  pixels) in both themes on the vivid backdrop. Unit tests disable `color-contrast` (jsdom can't do layout).
- **White text on the dark-theme accent fails contrast (~2.9:1).** → indigo-400 is light. → Dark
  `text-on-accent` is slate-950. Recheck both themes when changing `accent`.
- **Buttons submit forms unexpectedly.** → `<button>` defaults to `type="submit"`. → `Button` defaults to `type="button"`.
- **Placeholder used as label.** → It disappears on input and is low contrast. → `TextField` requires `label`.

## Design skills

- **Taste Skill says "no glass, no backdrop blur, no gradients, no shadows, no indigo/violet".** → It's a
  generic anti-slop skill for landing pages. → CLAUDE.md overrides it in this repo. Use it only for marketing pages.
- **A skill suggests Tailwind classes or inline hex values.** → Generic web defaults. → Convert the idea into
  tokens + CSS Modules. Never paste raw values into components.
