import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This app sits inside the library repo; keep Turbopack from picking the parent lockfile as root.
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
};

export default nextConfig;
