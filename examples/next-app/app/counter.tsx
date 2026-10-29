'use client';

import { useState } from 'react';
import { Button } from 'glass-ds';

// Event handlers need a Client Component; the design system's Button itself stays server-safe.
export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <Button variant="solid" onClick={() => setCount((c) => c + 1)}>
      Clicked {count}
    </Button>
  );
}
