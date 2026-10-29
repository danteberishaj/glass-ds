// Server Component: uses hook-free components directly and the 'use client' TextField across the boundary.
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, TextField } from 'glass-ds';
import { Counter } from './counter';

export default function Page() {
  return (
    <Card style={{ width: 380 }}>
      <CardHeader>
        <CardTitle as="h1">glass-ds in Next.js</CardTitle>
        <CardDescription>Rendered by a Server Component.</CardDescription>
      </CardHeader>
      <CardContent>
        <TextField label="Email" hint="Client component, ids from useId" />
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Server button</Button>
        <Counter />
      </CardFooter>
    </Card>
  );
}
