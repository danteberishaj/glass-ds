import type { ReactNode } from 'react';
// One global import in the root layout. The package's JS never imports CSS itself.
import 'glass-ds/styles.css';
import './globals.css';

export const metadata = { title: 'glass-ds × Next.js' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: a theme script (e.g. next-themes with attribute="data-theme") may set data-theme before hydration.
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
