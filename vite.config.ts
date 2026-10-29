import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

// Every dependency and peer stays external, including subpaths like react/jsx-runtime.
const externals = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];
const isExternal = (id: string) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`));

/**
 * Bundlers drop module-level directives. Next.js needs `'use client'` at the top
 * of each emitted file that came from a client component, so we put it back.
 */
function preserveUseClient(): Plugin {
  const clientModules = new Set<string>();
  return {
    name: 'gds:preserve-use-client',
    apply: 'build',
    transform(code, id) {
      if (/^\s*(['"])use client\1/.test(code)) clientModules.add(id);
      return null;
    },
    renderChunk(code, chunk) {
      // Rolldown keeps the directive with preserveModules; this is the safety net if it ever stops.
      if (/^\s*(['"])use client\1/.test(code)) return null;
      if (chunk.moduleIds.some((id) => clientModules.has(id))) {
        return { code: `'use client';\n${code}`, map: null };
      }
      return null;
    },
    onLog(_level, log) {
      // We handle the directive ourselves; silence the "directive was ignored" warning.
      if (log.code === 'MODULE_LEVEL_DIRECTIVE') return false;
    },
  };
}

/** `src/components/Button/Button.module.css` + `.root` → `gds-Button-root` */
function scopedName(local: string, filename: string) {
  const file = basename(filename).replace(/\.module\.css(\?.*)?$/, '');
  const component = file === 'index' ? basename(dirname(filename)) : file;
  return `gds-${component}-${local}`;
}

export default defineConfig({
  plugins: [react(), preserveUseClient()],
  css: {
    modules: {
      generateScopedName: scopedName,
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    cssCodeSplit: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      cssFileName: 'glass-ds',
    },
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
