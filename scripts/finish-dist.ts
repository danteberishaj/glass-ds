/**
 * Post-processes `dist/` after `vite build` + `tsc -p tsconfig.build.json`:
 *   1. Adds explicit `.js` extensions to relative imports in every `.d.ts`, so the types resolve
 *      under `moduleResolution: node16/nodenext` (tsc emits them extensionless, like the source).
 *   2. Strips side-effect CSS imports from `.d.ts` (the CSS is extracted to glass-ds.css; TS 6's
 *      `noUncheckedSideEffectImports` would otherwise error inside the package).
 *   3. Copies tokens.css and writes the type stubs that `exports["./styles.css"]` and
 *      `exports["./tokens.css"]` point at, so `import 'glass-ds/styles.css'` type-checks.
 * Verified by `npm run test:package`.
 */
import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (path.endsWith('.d.ts')) out.push(path);
  }
  return out;
}

// Matches the specifier of `import … from './x'`, `export … from './x'` and `import './x'`.
const SPECIFIER = /((?:import|export)\b[^'"]*?\bfrom\s*|import\s*)(['"])(\.{1,2}\/[^'"]+)\2/g;

function rewrite(file: string) {
  const src = readFileSync(file, 'utf8');
  const out = src
    .split('\n')
    .filter((line) => !/^\s*import\s+['"][^'"]+\.css['"];?\s*$/.test(line))
    .join('\n')
    .replace(SPECIFIER, (match, head: string, quote: string, spec: string) => {
      if (/\.(js|mjs|cjs|json|css)$/.test(spec)) return match;
      const base = resolve(dirname(file), spec);
      if (existsSync(`${base}.d.ts`)) return `${head}${quote}${spec}.js${quote}`;
      if (existsSync(join(base, 'index.d.ts'))) return `${head}${quote}${spec}/index.js${quote}`;
      return match;
    });
  if (out !== src) writeFileSync(file, out);
}

const files = walk(DIST);
for (const file of files) rewrite(file);

copyFileSync(join(ROOT, 'src/styles/tokens.css'), join(DIST, 'tokens.css'));
writeFileSync(join(DIST, 'styles.d.ts'), 'export {};\n');
writeFileSync(join(DIST, 'tokens-css.d.ts'), 'export {};\n');

const index = readFileSync(join(DIST, 'index.d.ts'), 'utf8');
if (/\.css['"]/.test(index)) throw new Error('dist/index.d.ts still imports CSS');
console.log(`finish-dist: rewrote ${files.length} declaration files`);
