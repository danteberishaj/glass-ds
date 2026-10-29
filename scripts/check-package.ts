/**
 * Consumer-side checks against the built package (run after `npm run build`):
 *   - types resolve under `moduleResolution: bundler` AND `node16` with TS 6 defaults
 *     (`noUncheckedSideEffectImports`), including `glass-ds/styles.css` and `glass-ds/tokens`
 *   - `import('glass-ds')` and `require('glass-ds')` both work in Node
 *   - `'use client'` survives in exactly the files that declare it in `src/`
 *   - no `.css` import in `dist/index.d.ts`, no stories/tests in `dist/`
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

if (!existsSync(join(DIST, 'index.js'))) {
  console.error('dist/ is missing: run `npm run build` first');
  process.exit(1);
}

// --- static checks on dist ---------------------------------------------------------------------
function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}
const srcFiles = walk(join(ROOT, 'src')).filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f));
const srcClient = srcFiles
  .filter((f) => /^(\s*(\/\*[\s\S]*?\*\/|\/\/[^\n]*)\s*)*(['"])use client\3/.test(readFileSync(f, 'utf8')))
  .map((f) => relative(join(ROOT, 'src'), f).replace(/\.tsx?$/, '.js'))
  .sort();
const distClient = walk(DIST)
  .filter((f) => f.endsWith('.js') && /^(['"])use client\1/.test(readFileSync(f, 'utf8')))
  .map((f) => relative(DIST, f))
  .sort();
if (JSON.stringify(srcClient) !== JSON.stringify(distClient)) {
  fail(`'use client' mismatch.\n  src:  ${srcClient.join(', ')}\n  dist: ${distClient.join(', ')}`);
}
const leaked = walk(DIST).filter((f) => /\.(stories|test)\./.test(f) || /\/test\//.test(f));
if (leaked.length) fail(`test/story files in dist: ${leaked.join(', ')}`);
if (/\.css['"]/.test(readFileSync(join(DIST, 'index.d.ts'), 'utf8'))) fail('dist/index.d.ts imports CSS');
if (walk(DIST).some((f) => f.endsWith('.js') && /from\s+['"][^'"]*\.css['"]/.test(readFileSync(f, 'utf8')))) {
  fail('a dist .js file imports CSS');
}

// --- consumer project -----------------------------------------------------------------------------
const dir = mkdtempSync(join(tmpdir(), 'glass-ds-consumer-'));
try {
  mkdirSync(join(dir, 'node_modules'));
  symlinkSync(ROOT, join(dir, 'node_modules', 'glass-ds'), 'dir');
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'consumer', type: 'module', private: true }));
  writeFileSync(
    join(dir, 'index.ts'),
    [
      "import 'glass-ds/styles.css';",
      "import 'glass-ds/tokens.css';",
      "import { Button, Dialog, cx, type ButtonProps, type DialogProps } from 'glass-ds';",
      "import { primitive, semantic } from 'glass-ds/tokens';",
      "const props: ButtonProps = { variant: 'solid', size: 'sm' };",
      "const dialog: DialogProps = { open: true, dismissible: false };",
      'export const ok = [typeof Button, typeof Dialog, cx(props.className), dialog, primitive.blur.md, semantic.light];',
      '',
    ].join('\n'),
  );
  const tsc = join(ROOT, 'node_modules', '.bin', 'tsc');
  const typeChecks: [string, string][] = [
    ['esnext', 'bundler'],
    ['node16', 'node16'],
  ];
  for (const [module, moduleResolution] of typeChecks) {
    writeFileSync(
      join(dir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: { strict: true, noEmit: true, module, moduleResolution, skipLibCheck: false, jsx: 'react-jsx', types: [] },
        files: ['index.ts'],
      }),
    );
    const r = spawnSync(tsc, ['-p', dir], { encoding: 'utf8' });
    if (r.status !== 0) fail(`tsc (${moduleResolution}) failed:\n${r.stdout}${r.stderr}`);
  }

  const runtimeChecks: [string, string][] = [
    ['module', "import('glass-ds').then(m => { if (typeof m.Button !== 'function') throw new Error('no Button') })"],
    ['commonjs', "const m = require('glass-ds'); if (typeof m.Button !== 'function') throw new Error('no Button')"],
  ];
  for (const [type, code] of runtimeChecks) {
    try {
      execFileSync(process.execPath, ['--input-type', type, '-e', code], { cwd: dir, stdio: 'pipe' });
    } catch (e) {
      fail(`node (${type}) failed: ${(e as { stderr?: Buffer }).stderr?.toString().trim()}`);
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`check-package: ${failures.length} failure(s)\n\n${failures.join('\n\n')}`);
  process.exit(1);
}
console.log('check-package: types (bundler + node16), import, require, use client, dist contents all OK');
