# glass-ds — rules for working in this repo

A glassmorphism design system for React 19, shipped as an ESM library that must work in
**Next.js App Router (React Server Components)**, plain Vite/React apps, and SSR.

**Before any change, read [GOTCHA.md](GOTCHA.md).** When you hit a new non-obvious mistake, add it there
(symptom → cause → fix) in the same change.

## Commands

| Command | What it does |
| --- | --- |
| `npm run storybook` | Storybook dev server on :6006 (the main workbench) |
| `npm run tokens` | Regenerate `src/styles/tokens.css` from `src/tokens/tokens.ts` |
| `npm test` | Vitest: unit, axe, and SSR tests (jsdom + node) |
| `npm run typecheck` / `npm run lint` | tsc / ESLint |
| `npm run build` | Library build to `dist/` (JS + `.d.ts` + `glass-ds.css`) |
| `npm run test:next` | Build, pack, install into `examples/next-app`, run `next build` |
| `npm run verify` | Everything above except Storybook and Next. Run before calling work done |

Run `npm run test:next` whenever you touch the build config, `package.json` exports, a `'use client'`
boundary, or add a component.

## Architecture

```
src/
  tokens/tokens.ts        single source of truth for tokens (no imports; Node runs it directly)
  styles/
    index.css             global CSS entry, in order: layers → tokens → glass recipe
    layers.css            @layer gds.tokens, gds.base, gds.components;
    tokens.css            GENERATED, committed, checked in CI (`tokens:check`)
    glass.css             the one glass recipe, global class `.gds-glass`
  utils/                  cx (clsx), GLASS_CLASS
  components/<Name>/
    <Name>.tsx            implementation
    <Name>.module.css     styles (CSS Modules → stable class `gds-<Name>-<local>`)
    <Name>.stories.tsx    Storybook stories (required)
    <Name>.test.tsx       behaviour + axe test (required for interactive components)
    index.ts              public exports for this component
  index.ts                public API: re-exports every component/index.ts
  test/                   setup, axe helper, SSR test
examples/next-app/        Next.js consumer used by `test:next`
```

### Tokens: three tiers

1. **Primitive** (`primitive` in tokens.ts → `--gds-color-indigo-600`, `--gds-blur-md`): raw values.
   Components never read these, except backdrops in stories.
2. **Semantic** (`semantic.light` / `semantic.dark` → `--gds-surface-glass`, `--gds-text-primary`): intent names.
   Components read only these.
3. **Component** (private custom properties inside a module, prefixed `--_`, e.g. `--_fill`, `--_height`):
   variants and sizes change these values, not the properties themselves.

Rules:
- Never hardcode a color, blur, radius, spacing, font size, duration or shadow in component CSS. Add a token.
- Each semantic token needs a value in both `light` and `dark`. Each glass fill needs an opaque `surface-solid*` partner.
- After editing tokens.ts, run `npm run tokens` and commit the regenerated CSS.
- Colors are stored as RGB triplets (`79 70 229`) so alpha is composed with `rgb(var(--x) / 0.5)`.

### Theming

Light by default. Dark via `prefers-color-scheme`, or forced with `data-theme="light|dark"` on `<html>`
or any subtree. This is compatible with `next-themes` (`attribute="data-theme"`). Don't add class-based
themes or a JS theme provider without a reason recorded here.

### CSS

- All library CSS lives inside `@layer gds.*`. Consumer CSS without a layer (and Tailwind utilities) wins.
  Never use `!important`.
- Component styles go in CSS Modules. Class names are deterministic (`gds-Button-root`), no hashes,
  so SSR output is stable and consumers can target them.
- Variants and states use **data attributes** (`data-variant`, `data-size`, `data-intensity`), not extra class props.
- The glass look comes from adding `GLASS_CLASS` (`.gds-glass`) and tuning `--_fill` / `--_blur` / `--_saturate`.
  Never write `backdrop-filter` in a component module. Never use CSS Modules `composes` across files (see GOTCHA).
- Every interactive element needs `:focus-visible` styles using `--gds-focus-ring`, plus handling for
  `prefers-reduced-motion` and `forced-colors` when it animates or relies on color.

## Component rules

- **Function components, React 19 `ref` as a prop.** No `forwardRef`. Props type is
  `ComponentPropsWithRef<'el'> & { …own props }`, and `...rest` is spread onto the root element.
- `className` is always merged with `cx(...)`, never replaced. `style` passes through.
- **Server-safe by default.** A component has no hooks, context or browser APIs unless it needs them.
  If it does, the file's first line is `'use client';`. Keep that boundary as small as possible
  (split a server shell from a client part).
- No `window`/`document`/`localStorage` at module top level or during render. Use effects.
- IDs come from `useId()`, never `Math.random()` or counters (hydration mismatch).
- **Compound components are flat named exports** (`Card`, `CardHeader`, `CardTitle`), never `Card.Header`.
  Dot properties don't survive the RSC client-reference boundary.
- Native elements first: a `<button>` for actions (default `type="button"`), `<a>` for navigation,
  `<label htmlFor>` for fields. ARIA only when there is no native equivalent.
- Headings take an `as` prop for level, so consumers keep a correct outline.
- Public API changes go through `components/<Name>/index.ts` and `src/index.ts`. Export the props types too.
- Don't add runtime dependencies without a strong reason (current: `clsx` only). Never add CSS-in-JS
  with runtime styles (it breaks RSC and costs bundle size).

### Adding a component (checklist)

1. Create `src/components/<Name>/` with `.tsx`, `.module.css`, `.stories.tsx`, `index.ts`, and `.test.tsx` if interactive.
2. Read only semantic tokens. Add new semantic tokens to both themes if needed.
3. Stories cover: default, every variant and size, disabled/error states, `OnPlainBackground`
   (fallback look), and a `play` test for interactions. Check light and dark in the toolbar.
4. Export from `src/index.ts`. Add the component to `src/test/ssr.test.tsx`.
5. Check the a11y panel in Storybook. axe marks contrast on glass as "incomplete" (see GOTCHA), so check it
   by hand on the vivid backdrop in both themes: ≥ 4.5:1 for text, ≥ 3:1 for UI and borders.
6. Run `npm run verify` and `npm run test:next`.

## Glassmorphism principles

- Glass is for **layered surfaces** (cards, nav bars, popovers, inputs on rich backgrounds). Body text and
  dense data go on strong or solid surfaces. Don't stack glass on glass more than 2 levels deep.
- Use few blur layers. Each `backdrop-filter` is a compositing layer and gets expensive on large,
  scrolling or animated areas, especially on mobile. Don't animate the blur radius.
- Legibility beats aesthetics: when in doubt, raise `intensity` (more opaque) rather than lowering text contrast.
- The primary call to action (`Button variant="solid"`) is opaque on purpose. Contrast must be guaranteed.
- Always design against a busy backdrop. The Storybook decorator provides one; glass on white tells you nothing.

## Design skills (Impeccable, UI UX Pro Max, Taste Skill)

When building or restyling any component or story, use the design skills, if they are installed, to
raise the visual quality:

- **Impeccable**: use it for building and refining components. After building, run its `critique`/`audit`,
  then `polish`. Use `typeset`, `layout`, `colorize` and `animate` for focused passes.
- **UI UX Pro Max**: use its style/palette/typography search for direction and its pre-delivery checklist
  (contrast, focus, reduced motion, responsive at 375/768/1024/1440).
- **Taste Skill** (`design-taste-frontend`): use it **only for marketing or landing pages** (e.g. a docs
  or showcase site), not for library components.

**Precedence: this file overrides every skill.** Skills give generic web advice. This repo is a glassmorphism
system with fixed architecture. In particular:
- Glass, `backdrop-filter`, translucency, inset highlights and soft shadows are the product here. Ignore any skill rule
  banning glass, blur, gradients, shadows, or indigo/violet palettes when working on this design system.
- Keep the stack: CSS Modules + tokens + layers. Ignore skill advice to use Tailwind classes, inline styles or another framework.
- Every value a skill suggests (color, size, motion) goes in as a **token** in tokens.ts, not a hardcoded value.
- Don't let a skill download images or assets, install packages, or enable hooks/telemetry in this repo
  without asking the user first.

## Definition of done

- `npm run verify` passes. `npm run test:next` passes if the change touched the build, exports, or a client boundary.
- Stories exist and look right in light, dark, and on the plain background.
- No hardcoded design values. No new `!important`. No `forwardRef`. No dot-notation compounds.
- GOTCHA.md updated if you learned something the hard way.
