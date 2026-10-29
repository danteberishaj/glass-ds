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
| `npm run build-storybook` | Static Storybook build |
| `npm run test:package` | Consumer checks on `dist/`: types under `bundler` + `node16`, `import`/`require`, `'use client'` parity |
| `npm run verify` | Everything above except Storybook and Next. Run before calling work done |

Run `npm run test:next` whenever you touch the build config, `package.json` exports, a `'use client'`
boundary, or add a component.

## Architecture

```
src/
  tokens/tokens.ts        single source of truth for tokens (no imports; Node runs it directly)
  styles/
    index.css             global CSS entry, in order: layers → tokens → glass recipe → utilities
    layers.css            @layer gds.tokens, gds.base, gds.components;
    tokens.css            GENERATED, committed, checked in CI (`tokens:check`)
    glass.css             the one glass recipe (`.gds-glass`) and the sheen (`.gds-sheen`)
    utilities.css         `.gds-sr-only`
  utils/                  cx (clsx), GLASS_CLASS, GLASS_SHEEN_CLASS, SR_ONLY_CLASS
  internal/               shared, non-exported modules (positioning hook, field chassis, polymorphic types)
  components/<Name>/
    <Name>.tsx            implementation
    <Name>.module.css     styles (CSS Modules → stable class `gds-<Name>-<local>`)
    <Name>.stories.tsx    Storybook stories (required)
    <Name>.test.tsx       behaviour + axe test (required for interactive components)
    index.ts              public exports for this component
  index.ts                public API: re-exports every component/index.ts
  test/                   setup, axe helper, SSR test, stories test (renders every story + axe)
examples/next-app/        Next.js consumer used by `test:next`
scripts/                  tokens generator, dist post-processing, consumer package checks, test:next
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
  `<label htmlFor>` for fields, `<hr>` for separators. ARIA only when there is no native equivalent.
- **Form fields use the shared chassis** in `src/internal/field.tsx` (`useFieldIds`, `FieldLabel`, `FieldMessages`,
  `RequiredMark`) and `field.module.css`. Convention for every field: `className` and `style` go to the wrapper,
  `ref` and `...rest` go to the native control; `label` (or `hideLabel`), `hint`, `error` (announced via
  `aria-live`), `required` (native + hidden `*`), `size` where it applies.
- **Polymorphic `as`** uses `PolymorphicProps<T, Own>` from `src/internal/polymorphic.ts` so a component passed
  as `as` type-checks its own props (links: Breadcrumb, Navbar, Sidebar; surfaces: Glass, Card).
- **Shared `Tone` and `Size`** live in `src/types.ts`; components narrow them with `Extract<>`.
- Buttons support `loading` (`aria-busy` + `aria-disabled`, still focusable); never set `disabled` to mean loading.
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

## Component inventory

Tokens for control geometry live under `primitive.control` (`--gds-control-*`); `--gds-space-px` and
`--gds-space-0-5` cover 1–2px lifts and strokes. Only the 2px focus ring is a literal.

Benchmarked against the components shared by the most-starred React design systems (shadcn/ui, Ant Design, MUI, Chakra,
Mantine, HeroUI), rebuilt glass-native on platform primitives (`<dialog>`, `<details>`, native inputs, no headless-UI dependency).

| Group | Components | Client parts |
| --- | --- | --- |
| Layout & surfaces | Glass, Card (+Header/Title/Description/Content/Footer), Separator | — |
| Actions | Button | — |
| Forms | TextField, Textarea, Select (native), Checkbox, RadioGroup + Radio, Switch, Slider, Calendar, DatePicker | all form controls (`useId`) |
| Data display | Badge, Avatar + AvatarGroup, Kbd, Table (+Caption/Header/Body/Footer/Row/Head/Cell) | AvatarImage (internal) |
| Feedback | Alert, Progress, Spinner, Skeleton | — |
| Navigation | Tabs (+TabList/Tab/TabPanel), Breadcrumb (+Item/Link/Page/Separator/Ellipsis), Pagination | Tabs |
| App navigation | Navbar (+Brand/Nav/Item/Link/Actions/MenuButton), Sidebar (+Header/Content/Footer/Nav/Group/Item/Link/Separator/Toggle) | — |
| Layout patterns | AppShell (header + sidebar + main, skip link, mobile hand-off to Drawer) | — |
| Disclosure & overlays | Accordion (+Item/Trigger/Content), Dialog (+Header/Title/Description/Body/Footer/Close), Drawer (same parts) | DialogRoot (internal) |

### Floating layers (decided)

Popovers use the **native Popover API** (`popover="auto"`): top layer (no z-index fights, escapes `backdrop-filter`
containing blocks without a portal), light dismiss and Esc for free. Position them with the internal hook
`src/internal/useAnchoredPosition.ts` (pure `computePosition` + flip + viewport clamp). The trigger uses
`popovertarget`, never a JS `showPopover()` on click. No positioning dependency. Revisit CSS anchor positioning
when it is Baseline.

**Not built yet:** Tooltip, Popover, Menu/Dropdown, Combobox, Toast. Build them on `useAnchoredPosition` + the
Popover API, the same way DatePicker does.

## Motion

Demo and docs: Storybook **Foundations/Motion**.

| Use | Easing | Duration |
| --- | --- | --- |
| Entering / moving UI | `--gds-easing-spring-snappy` | `--gds-duration-spring-snappy` |
| Large surfaces (drawers, accordion height) | `--gds-easing-spring-gentle` | `--gds-duration-spring-gentle` |
| Playful confirmation (press release, check, dot) | `--gds-easing-spring-bounce` | `--gds-duration-spring-bounce` |
| Exiting | `--gds-easing-out` | `--gds-duration-fast` / `normal` |
| Loops (spinner, pulses) | `--gds-easing-in-out` | `--gds-duration-loop*` / `pulse` |

- Always pair a spring easing with its own duration token. The `linear()` curve is shaped for that settle time.
- Animate `transform` and `opacity` only (plus paint-only properties like outline). Never animate `backdrop-filter`,
  and never fade an ancestor of a glass element (see GOTCHA).
- Write `transition-*` **longhands**. The base selector owns the transition. State selectors (`:active`, `[open]`)
  only change private `--_t-*` / `--_press-*` variables, so reduced-motion overrides still win.
- Fast in, springy out for presses: `:active` uses `duration-fast` + `easing-out`, and the release springs back.
- `prefers-reduced-motion: reduce`: no movement. Opacity/colour crossfades stay, and loops become a slow pulse.
- Sheen: add `GLASS_SHEEN_CLASS` (or `data-sheen`). It uses the element's `::after` and clips its children.

### App navigation conventions

- Navbar, Sidebar and AppShell are server-safe. State such as `collapsed` or the menu's `open` is a prop the caller owns.
  Toggles (`SidebarToggle`, `NavbarMenuButton`) only reflect it (`aria-expanded`, name, icon).
- On small screens, hide the sidebar (AppShell `sidebarBreakpoint`) and render the same links in a `Drawer` opened by
  `NavbarMenuButton`. Inside the Drawer, use `<Sidebar surface="none">` so the glass isn't nested.
- Links accept `as` (e.g. `next/link`) and `active` (`aria-current="page"`). `as="button"` defaults `type="button"`.
- Default landmark labels are distinct: `NavbarNav` "Primary", `SidebarNav` "Sidebar navigation". The Sidebar root
  is a plain `div`; the `nav` inside is the landmark.
- Dialog/Drawer: `DialogTitle` is required; put an icon-only `<DialogClose />` last in the DOM; `onOpenChange`
  receives `{ reason }`; `closeOnEscape` / `closeOnBackdropClick` refine `dismissible`.
- Calendar/DatePicker read today, locale and week start from `useClientEnvironment()` after hydration. Pass
  `locale` when server-rendering (a dev warning fires otherwise).
- Storybook-only helpers (icons, demo compositions) live in `.storybook/`, never as named exports of a stories file.

## Packaging rules

- `src/index.ts` is the only place that imports global CSS. `scripts/finish-dist.ts` strips that import from
  `dist/index.d.ts` and adds `.js` extensions to relative imports in every `.d.ts` (tsc emits them extensionless,
  which breaks `moduleResolution: node16`). Never hand-edit `dist/`.
- Every `exports` subpath needs a `types` target; CSS subpaths point at an `export {}` stub so TS 6's
  `noUncheckedSideEffectImports` is satisfied.
- `engines` is what consumers need (Node ≥ 20); `devEngines` is what this repo needs (Node ≥ 22.18 for type stripping).
- `npm run test:package` must stay green; it is the regression test for all of the above.

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

- `npm run verify` passes (it includes rendering every story under jsdom with axe, and the consumer package checks).
  `npm run test:next` passes if the change touched the build, exports, or a client boundary.
- Stories exist and look right in light, dark, and on the plain background.
- No hardcoded design values. No new `!important`. No `forwardRef`. No dot-notation compounds.
- GOTCHA.md updated if you learned something the hard way.
