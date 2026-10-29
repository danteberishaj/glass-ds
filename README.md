# glass-ds

A glassmorphism design system for React 19. Zero-runtime CSS, works in Next.js App Router (Server Components),
Vite and any SSR setup. Accessible fallbacks for reduced transparency, high contrast and forced colors.

## Use it

```bash
npm install glass-ds
```

Requires React 19 (`react` and `react-dom` are peer dependencies). The package is ESM; `require('glass-ds')`
also works on Node 22+ via `require(esm)`.

Import the stylesheet once (Next.js: in `app/layout.tsx`):

```tsx
import 'glass-ds/styles.css';
```

```tsx
import { Card, CardHeader, CardTitle, CardContent, Button, TextField } from 'glass-ds';

export default function Page() {
  return (
    <Card>
      <CardHeader><CardTitle>Hello</CardTitle></CardHeader>
      <CardContent><TextField label="Email" /></CardContent>
      <Button variant="solid">Continue</Button>
    </Card>
  );
}
```

### Entry points

| Import | What you get |
| --- | --- |
| `glass-ds` | Every component, `cx` (clsx) and `getPaginationRange` |
| `glass-ds/styles.css` | All styles, one file (tokens, the glass recipe, every component) |
| `glass-ds/tokens.css` | Just the `--gds-*` custom properties, for apps that only want the tokens |
| `glass-ds/tokens` | The token objects (`primitive`, `semantic`) in JavaScript |

JavaScript is tree-shaken per component (one file per component, no side effects). CSS is deliberately
**one stylesheet, always**: it is small (about 15 kB gzipped) and splitting it would break the cascade-layer
order that lets your CSS override it.

### Theming and overrides

- **Theme:** follows the OS by default. Force a theme with `<html data-theme="dark">`. Works with
  `next-themes` (`attribute="data-theme"`).
- **Overrides:** all library CSS is in `@layer gds.*`, so your own CSS (and Tailwind) wins without `!important`.
  Class names are stable (`gds-Button-root`), and every token is a `--gds-*` custom property.
- Because class names are deterministic, don't load two versions of glass-ds on one page.

### Next.js notes

- Components are Server Component safe. The ones that need state (form controls, Tabs, DatePicker…) carry
  `'use client'` themselves; you only need your own `'use client'` to pass event handlers.
- Compound parts are flat named exports (`CardHeader`, not `Card.Header`).
- Pass `locale` to `Calendar`/`DatePicker` when server-rendering, so server and client format dates the same way.

## Develop

```bash
npm install
npm run storybook
```

`npm run verify` runs tokens check, typecheck, lint, tests (unit, every story + axe, SSR), the library build and
consumer package checks (types under `bundler` and `node16`, `import`/`require`). `npm run test:next` builds
the packed tarball into a real Next.js app.

See [CLAUDE.md](CLAUDE.md) for architecture and rules, and [GOTCHA.md](GOTCHA.md) for known pitfalls.
