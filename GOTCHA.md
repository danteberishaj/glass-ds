# GOTCHA.md: mistakes we've made (or will)

Read this before changing anything. Add an entry the moment you lose time to something non-obvious.
Format: **symptom** → cause → fix. Newest entries go at the top of their section.

## Build & packaging

- **`npm run verify` passes but `npm run build` (and `test:next`) fails with "Cannot find name 'process'".** →
  The library type build (`tsconfig.build.json`) has no Node types on purpose; the main tsconfig does. → Use
  `isDev` from `src/internal/env.ts` (local `declare const process`). `npm run typecheck` runs both configs.
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
  `npm run test:package` compares the set of `'use client'` files in `src/` and `dist/`.
- **Consumers on `moduleResolution: node16` get "Module 'glass-ds' has no exported member".** → tsc emits
  `.d.ts` with extensionless relative imports (`from './components/Glass'`), which node16 can't resolve. →
  `scripts/finish-dist.ts` rewrites them to `./x.js` / `./x/index.js` after the type build.
- **TS 6 consumers get `TS2882 Cannot find module './styles/index.css'` from inside the package, or on
  `import 'glass-ds/styles.css'`.** → `noUncheckedSideEffectImports` is on by default in TS 6; side-effect imports
  survive in `.d.ts`, and exports subpaths without a `types` target are untyped. → `finish-dist.ts` strips CSS
  imports from `.d.ts`; `exports["./styles.css"]` has a `types` stub.
- **`require('glass-ds')` throws `ERR_PACKAGE_PATH_NOT_EXPORTED`.** → `exports["."]` had only `import`. → Add
  `default` (Node ≥ 22 can `require(esm)`; no CJS build needed).
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


- **A controlled `checked={false} indeterminate` checkbox loses its dash after a click.** → The click clears the DOM
  `indeterminate` property; React only re-applies `checked`. → Re-assert it in `onChange` and in an effect keyed on
  `[indeterminate, checked]`.
- **RadioGroup with `value={undefined}` warns "uncontrolled to controlled".** → `value !== undefined` was the
  controlled test. → Decide with `'value' in props` (keep the props object; destructure after).
- **A `loading` Button still lifts and presses on hover.** → `:not(:disabled)` guards don't see `aria-disabled`. →
  Every guard is `:not(:disabled, [aria-disabled='true'])`; forced-colors drops the opacity and uses `GrayText`.
- **A generic `as` component (`<T extends ElementType>`) fails JSX typing as `<Component />`.** → TS can't call a
  bare generic ElementType. → Widen at the call site: `const Component: ElementType = as ?? 'a'`. Spreading generic
  `rest` into a non-generic child needs one cast (`rest as GlassProps`).
- **The Calendar's initial month or week-start day differs between server and client.** → Both were computed
  from `new Date()` / `Intl` during render. → `useClientEnvironment()` (`useSyncExternalStore`, `null` on the
  server) supplies today, locale and weekStartsOn after hydration; pass `locale` when server-rendering.
- **Unmount cleanup for an open `<dialog>` sees `ref.current === null`.** → React detaches host refs before passive
  cleanups run. → Capture the element in a `useLayoutEffect` and close it in that cleanup.
- **A Tab put in the tab order by writing DOM `tabIndex` stays `0` after React re-renders.** → React only writes
  attributes whose prop changed. → `syncTabbable` writes every tab's tabIndex so the DOM mirrors what React would render.

- **`useId` or context used in a component meant for Server Components → RSC error.** → Hooks can't run on the
  server side of the boundary. → Split a server shell from a small `'use client'` part: Avatar (shell) +
  AvatarImage (client), Dialog/Drawer (shell) + DialogRoot (client). Accordion avoids context entirely: for
  "only one open", the consumer passes the same native `name` to every `AccordionItem`.
- **The Avatar image fails, but the initials never show after SSR.** → The `<img>` errors before hydration attaches
  `onError`. → A ref callback checks `node.complete && !node.naturalWidth` on attach. AvatarImage is keyed by `src`,
  so a new src resets its state.
- **eslint `react-hooks/immutability` flags a merge-refs helper (`ref.current = node`).** → The React Compiler rules
  forbid mutating props and hook return values. → Don't merge refs. Pass the caller's `ref` through `...rest` and
  keep a private `useRef` on the component's own root (Checkbox finds its input via `querySelector` in the effect).
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

- **`position: fixed` elements inside AppShell scroll with the page.** → `container-type: inline-size` adds layout
  containment, which makes the element the containing block for fixed descendants. → AppShell uses viewport media
  queries. Navbar does use a container query (it must adapt to its slot), so don't put `position: fixed` children in a
  Navbar. Use the top layer (popover/dialog) instead.
- **A nested glass panel (Sidebar in a Drawer, Calendar in a popover) renders as a flat milky box.** → The parent's
  `backdrop-filter` is the child's backdrop root, so the child only blurs the panel. → Components that get embedded take
  `surface="none"` (Sidebar, Calendar).
- **Icon-only buttons render empty.** → Inline SVGs without width/height collapse to 0×0 in a flex row. → Button sizes
  direct `svg` children to `1.25em`, and SidebarLink sizes its icon slot. Do the same in any component with an icon slot.
- **An SVG gradient or mask renders blank in one copy of a component.** → Duplicate `id`s: `url(#id)` resolves to the
  first match, and if that copy is inside `display: none` (a hidden desktop sidebar) it paints nothing. → Generate SVG
  ids with `useId()`.

- **Tinted glass (Alert, Badge) loses the tint in the fallback, or text becomes unreadable.** → Setting `--_fill` to
  an 18% `*-glass` tint *replaces* the surface instead of layering on it. → Keep `--_fill` and paint the tint as
  `background-image: linear-gradient(var(--_tint), var(--_tint))`, so it layers over both glass and the opaque
  fallback. Set `background-image: none` under forced-colors.
- **The active tab pill looked pressed in (darker than its track) in dark mode.** → Dark `surface-glass-strong` is
  *more slate*, not lighter. → Selected states use `--gds-surface-selected`.
- **A form full of checkboxes/radios/switches is slow.** → Every `backdrop-filter` is a compositing layer. → Small
  controls use translucent token fills without `GLASS_CLASS`. Only field-sized surfaces (TextField, Textarea, Select) blur.
- **Slider fill doesn't line up with the thumb in Chrome/Safari.** → The thumb centre travels from thumb/2 to
  width − thumb/2, not 0–100%. → The gradient stop is `calc(var(--_thumb)/2 + (100% - var(--_thumb)) * var(--_progress))`.
  Firefox uses `::-moz-range-progress`.
- **Select options are unreadable in dark mode on Windows/Linux.** → Options inherit the translucent select background.
  → `color-scheme` (set in tokens.css) plus explicit `option`/`optgroup` token colours.
- **Sticky table header loses its bottom divider.** → With `border-collapse: collapse`, borders don't move with sticky
  cells. → `border-collapse: separate; border-spacing: 0` and draw dividers on the cells. Sticky cells use opaque
  `surface-solid` because rows scroll underneath.
- **Dialog/Drawer `transition` with `allow-discrete` does nothing in older browsers.** → An unknown keyword invalidates
  the whole shorthand. → Write the `transition-*` longhands and a separate `transition-behavior: allow-discrete`.
- **The `::backdrop` scrim is transparent in older browsers (Chrome < 122, Safari < 17.4).** → `::backdrop` didn't
  inherit custom properties there. → Accepted as progressive enhancement. `::backdrop` is also the one place a module
  may write `backdrop-filter` (it can't take a class).
- **Dialog page-scroll lock adds a scrollbar gutter on non-scrolling pages.** → `html:has(dialog:modal) { overflow:
  hidden; scrollbar-gutter: stable }`. → Known trade-off. It prevents layout shift on scrolling pages.
- **Glass looks like flat white/grey.** → No backdrop: nothing behind it to blur. → Always preview on the
  Storybook vivid backdrop. `OnPlainBackground` stories show the intended fallback.
- **Nested glass doesn't blur the page behind it.** → An element with `backdrop-filter` becomes the
  *backdrop root* for its descendants. A glass child only sees its glass parent's content. → Avoid glass-in-glass.
  For an inner surface, use a higher `intensity` fill without relying on more blur.
- **`position: fixed` child (tooltip, menu) is positioned relative to a glass card instead of the viewport,
  or gets clipped.** → `backdrop-filter` (like `transform`/`filter`) creates a containing block for fixed
  descendants. → Put floating layers in the top layer (`popover="auto"` or `<dialog>`). The top layer escapes
  containing blocks, so no portal is needed.
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
- **A component override in a CSS Module doesn't apply over `.gds-glass`.** → Same specificity; in the extracted
  stylesheet order is deterministic (glass.css first, then modules in `src/index.ts` import order) so modules do win
  there, but in Storybook/Vite dev the injection order can differ. → Don't rely on order: tune via the
  `--_fill`/`--_blur` custom properties, or use the attribute/state selector you need anyway (`[data-…]`, `:hover`).

## Accessibility


- **Opening a Dialog announces "Close" before the title.** → `showModal()` focuses the first focusable element,
  and the corner `<DialogClose />` was first in the DOM. → The panel takes initial focus (`tabIndex={-1}`); place the
  icon-only close button last in the DOM anyway.
- **A `<dialog>` has no accessible name in the server HTML.** → `aria-labelledby` was set from state after a child
  effect ran. → Always render `aria-labelledby={titleId}`; `DialogTitle` is required (dev warning if missing).
- **Two `navigation` landmarks named "Main" (Navbar + Sidebar).** → Same default `aria-label`. → Navbar defaults to
  "Primary", Sidebar to "Sidebar navigation". The Sidebar root is a plain `div`, not an `<aside>`.
- **`getByLabelText('Country')` fails on a `required` field.** → The aria-hidden `*` is in the label's text
  content, which Testing Library matches literally. → Query with `getByRole('textbox', { name })`.
- **Field error text failed contrast on glass.** → `--gds-danger` is tuned for borders/fills. → Text uses
  `--gds-danger-text` (`danger-text`/`warning-text` exist for every status tone that needs text).

- **Esc closes a non-dismissible Dialog on the second press in Chrome.** → Chrome ignores `preventDefault()` on a
  repeated `cancel` without user activation in between, and synthetic Escape never fires `cancel`. → Handle Escape in
  `keydown` (preventDefault there), always prevent `cancel`, and set `closedby="none"` when not dismissible.
- **A drag-select that ends outside the Dialog panel closes it.** → The `click` target becomes the `<dialog>`, which
  looks like a backdrop click. → Close only if `pointerdown` also landed on the dialog element.
- **Color-only selection (active tab, current page, checked box) disappears in Windows High Contrast.** → forced-colors
  overrides the fills. → Use `forced-color-adjust: none` + `Highlight`/`HighlightText`, or draw with borders
  (Separator, Skeleton), which forced-colors keeps.
- **Breadcrumb separators inflated the item count for screen readers.** → Each separator is an `<li>` in the `<ol>`. →
  `<li aria-hidden="true">`.
- **`aria-controls` broke when a tab value contained spaces.** → ID reference attributes are space-separated lists. →
  Tabs strips whitespace from the value when building ids.
- **Slider's `<output>` announced every value twice.** → `<output>` is a live region, and the range input announces
  itself too. → The output is `aria-hidden`. `formatValue` feeds `aria-valuetext`.
- **`aria-invalid` on a RadioGroup fails axe.** → ARIA doesn't allow it on a fieldset or radios. → The error links via
  `aria-describedby` on the fieldset, and the radios get a red border.
- **Storybook a11y flags `aria-label` on a plain `div`.** → It's prohibited on role=generic. → Add `role="group"` (or a real
  landmark) alongside the label.
- **Unchecked checkbox/radio/switch edges vanish on glass.** → `border-glass` is far below the 3:1 non-text contrast
  requirement. → Control edges use `border-strong`, and the unchecked switch thumb uses `text-secondary`.
- **axe reports color-contrast as "incomplete" (not pass) on every glass story.** → axe can't compute contrast
  over translucent fills on gradient backgrounds. → Check contrast by hand (DevTools picker on the rendered
  pixels) in both themes on the vivid backdrop. Unit tests disable `color-contrast` (jsdom can't do layout).
- **White text on the dark-theme accent fails contrast (~2.9:1).** → indigo-400 is light. → Dark
  `text-on-accent` is slate-950. Recheck both themes when changing `accent`.
- **Buttons submit forms unexpectedly.** → `<button>` defaults to `type="submit"`. → `Button` defaults to `type="button"`.
- **Placeholder used as label.** → It disappears on input and is low contrast. → `TextField` requires `label`.

## Motion

- **Glass inside a fading parent (e.g. a tab panel) loses its blur, then snaps back when the fade ends.** → `opacity < 1`
  on an ancestor makes that ancestor the backdrop root. → Never fade ancestors of glass: move them only
  (`.panel:has(.gds-glass)` keeps opacity 1 in `@starting-style`).
- **A transition stops working entirely in browsers without `linear()`.** → A spring token inside the `transition`
  *shorthand* makes the whole declaration invalid at computed-value time, so it falls back to `0s`. → Use longhands. An invalid
  `transition-timing-function` only falls back to `ease`.
- **Reduced-motion `transition: none` is ignored on `:active` / `[open]`.** → The state selector sets `transition-*`
  longhands with higher specificity. → State selectors only change `--_t-*` / `--_press-*` variables, and the base
  selector owns the `transition`.
- **The tab indicator slides in from the top-left on first paint.** → It transitions from its initial value. → Keep it
  `display: none` until measured (`data-indicator-ready`). An element coming out of `display: none` doesn't transition.
- **Keyframe "pops" (Pagination current page, Accordion content) and `@starting-style` entrances (Alert, tab panel)
  also play on page load.** → They run whenever the element first renders or the selector first matches. → For pops
  that should only happen on interaction, use a press-and-release transition (Checkbox, Radio) or a `data-pop` flag set
  on user action (Calendar).
- **Unfocused fields show an outline in Windows High Contrast.** → forced-colors repaints `outline-color: transparent`.
  → Keep the resting outline at `outline-width: 0` and animate the width in.
- **`@media not all and (forced-colors: active)` rules are skipped in browsers that don't know the feature.** → An
  unknown media feature makes the whole query false. → Write the rules unconditionally and override them inside
  `(forced-colors: active)`.
- **Animating a glass element (Card lift, Dialog entry) costs a re-blur on every frame.** → Accepted for short, small
  moves. Never run long or looping animations on blurred surfaces.

## Dates & popovers

- **The calendar shows a day twice or skips one around DST.** → Millisecond arithmetic, or a local midnight that doesn't
  exist (São Paulo 2018-11-04). → Pin calendar days to local noon: `new Date(y, m, d + n, 12)` (`date-utils.ts`).
  Never parse date strings with `Date`.
- **"Today" (`aria-current="date"`) causes a hydration mismatch.** → Server and client clocks and time zones differ. → Read
  today through `useSyncExternalStore` with a `null` server snapshot. Pass `locale` when server-rendering, or text can
  differ too.
- **A `popover` element opens centred on screen for a frame, or stays centred.** → The UA sheet gives `[popover]`
  `inset: 0; margin: auto`. → Set `inset: auto; margin: 0` and position it in a layout effect (`useAnchoredPosition`).
- **Clicking the trigger of an open popover closes it, then reopens it at once.** → A JS `showPopover()` on click:
  pointerdown light-dismisses it, then the click reopens it. → Use `popovertarget` on the trigger. The browser exempts the
  invoker from light dismiss.
- **Esc in a DatePicker inside a Dialog also closes the Dialog.** → The popover is in the top layer but is still a DOM
  child of the `<dialog>`, so keydown bubbles up. → The popover handles Escape itself (`preventDefault` +
  `stopPropagation`, then `hidePopover`).
- **Focus is stolen back to the trigger after a light-dismiss click elsewhere.** → `toggle` fires asynchronously. →
  Record `popover.contains(activeElement)` in `beforetoggle` and restore focus only if focus was inside.
- **`renderToString` emits `popoverTarget="…"` in camelCase.** → React passes the name through unchanged. Harmless
  (HTML lowercases it), but SSR assertions must be case-insensitive.
- **jsdom has no Popover API, and its UA sheet hides `[popover]`.** → `DatePicker.test.tsx` installs a stand-in that
  sets inline `display: block` while open. It stays in that file because the test also removes it to cover the
  no-Popover-API fallback.

## Testing


- **`userEvent.type(button, '{Escape}')` closes a dialog with reason `close` instead of `escape`.** → `type()`
  clicks the element first. → Use `userEvent.keyboard('{Escape}')`.
- **`document.body.innerHTML = ''` between renders leaks React roots.** → RTL cleanup never runs for the wiped
  tree. → Use the `unmount()` returned by `render()`.
- **Shared chassis class + component class on the same element fought over `gap`/`font-size`.** → Same
  specificity across two modules. → The shared module reads `var(--_field-gap, …)`; component modules only set
  those variables and non-overlapping properties.
- **Storybook play tests: a synthetic ArrowRight never steps a range input; `toBeVisible()` fails on something
  fading in.** → Browsers only step native controls on trusted key events; jest-dom treats `opacity: 0` as
  invisible. → Drive ranges with `fireEvent.input`; wrap visibility assertions on animated elements in `waitFor`.
- **axe reports `region` ("content not contained by landmarks") on every component.** → Page-level rule. →
  Disabled in `src/test/axe.ts`, as Storybook's addon does.
- **A story passes `npm test` but its play function fails in Storybook.** → `src/test/stories.test.tsx` only renders
  + runs axe under jsdom; play functions need a real browser (no Popover API, exclusive `<details>`, range stepping
  or container queries in jsdom). → Run them in Storybook (or drive `iframe.html` through the Storybook channel).
- **axe reports a contrast failure on a solid Button (e.g. white on indigo-400) in light mode.** → With a dark OS,
  Storybook first paints dark and then sets `data-theme="light"`, so colour transitions start from the dark values. In a
  background tab the animation clock is frozen at frame 0. → Call `document.getAnimations().forEach(a => a.finish())`
  before running axe from a script.
- **A helper exported from a `*.stories.tsx` file shows up as a broken story.** → CSF treats every named export as a
  story. → Put shared demo components in `.storybook/` (e.g. `.storybook/demo-sidebar.tsx`).
- **TS error "ToggleEventHandler is not assignable" on a custom `onToggle` prop.** → `onToggle` is a built-in DOM event
  prop on every element's props type. → Name callbacks after state instead (`onCollapsedChange`, `onOpenChange`).
- **jsdom has `HTMLDialogElement` but no `show`/`showModal`/`close`.** → Minimal stand-ins live in `src/test/setup.ts`.
- **`toHaveAccessibleName` is empty on a closed `<dialog>`.** → Closed dialogs are hidden, so no name is computed. → Assert
  `aria-labelledby` while closed and the accessible name only when open.
- **Range input arrow keys do nothing in jsdom.** → jsdom doesn't implement keyboard stepping. → `fireEvent.change` in
  Vitest; test keys in a Storybook `play` function in a real browser.
- **Class assertions like `toHaveClass('gds-Badge-root')` fail in unit tests.** → Vitest uses `classNameStrategy:
  'non-scoped'`, so the class is just `root`. → Assert on the local name or on `gds-glass`. Module class names must be
  camelCase (`localsConvention: 'camelCaseOnly'`).
- **`noUncheckedIndexedAccess` errors on `words[0][0]` or destructured `getAllBy*` results.** → Use `?.`, `.at()`, or
  specific `getBy*` queries.
- **TS errors in stories when props are a union (`{label} | {aria-label}`).** → `StoryObj<typeof meta>` can't subtract
  meta args from a union. → Keep `label` required, or run tsc on stories after adding union props. Share story markup
  through a small component instead of calling `meta.render(args, ctx)`.

## Design skills

- **Taste Skill says "no glass, no backdrop blur, no gradients, no shadows, no indigo/violet".** → It's a
  generic anti-slop skill for landing pages. → CLAUDE.md overrides it in this repo. Use it only for marketing pages.
- **A skill suggests Tailwind classes or inline hex values.** → Generic web defaults. → Convert the idea into
  tokens + CSS Modules. Never paste raw values into components.
