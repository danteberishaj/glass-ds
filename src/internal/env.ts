/**
 * Dev-mode flag for one-off warnings. Consumers' bundlers (Next.js, Vite, webpack) replace
 * `process.env.NODE_ENV` in dependencies; the `typeof` guard covers runtimes without `process`.
 * The local `declare` keeps the library's type build free of Node types.
 */
declare const process: { env?: { NODE_ENV?: string } } | undefined;

export const isDev = typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';
