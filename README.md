# glass-ds

A glassmorphism design system for React 19. Zero-runtime CSS, works in Next.js App Router (Server Components),
Vite and any SSR setup. Accessible fallbacks for reduced transparency, high contrast and forced colors.

## Use it

```bash
npm install glass-ds
```

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

- **Theme:** follows the OS by default. Force a theme with `<html data-theme="dark">`. Works with
  `next-themes` (`attribute="data-theme"`).
- **Overrides:** all library CSS is in `@layer gds.*`, so your own CSS (and Tailwind) wins without `!important`.
  Class names are stable (`gds-Button-root`), and every token is a `--gds-*` custom property.

## Develop

```bash
npm install
npm run storybook
```

See [CLAUDE.md](CLAUDE.md) for architecture and rules, and [GOTCHA.md](GOTCHA.md) for known pitfalls.
