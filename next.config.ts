import type { NextConfig } from 'next';
const exporting = process.env.STATIC_EXPORT === '1';
const config: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  poweredByHeader: false,
  ...(exporting ? { output: 'export' as const, trailingSlash: true, distDir: '.next-export' } : {}),
};
export default config;
