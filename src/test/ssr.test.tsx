// @vitest-environment node
/**
 * Guards Next.js / SSR compatibility: the public entry must import without `window`/`document`,
 * and every component must render to a string on the server.
 */
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as gds from '../index';

describe('SSR', () => {
  it('imports the public entry without a DOM', () => {
    expect(typeof window).toBe('undefined');
    expect(Object.keys(gds).length).toBeGreaterThan(0);
  });

  it('renders every component on the server', () => {
    const html = renderToString(
      <gds.Card>
        <gds.CardHeader>
          <gds.CardTitle>Title</gds.CardTitle>
          <gds.CardDescription>Description</gds.CardDescription>
        </gds.CardHeader>
        <gds.CardContent>
          <gds.Glass>Glass</gds.Glass>
          <gds.TextField label="Email" hint="Hint" />
        </gds.CardContent>
        <gds.CardFooter>
          <gds.Button>Go</gds.Button>
        </gds.CardFooter>
      </gds.Card>,
    );
    expect(html).toContain('gds-glass');
    expect(html).toContain('<label');
  });
});
