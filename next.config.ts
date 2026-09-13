/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: projectRoot,
  images: {
    unoptimized: true,
  },
  basePath: '',
  assetPrefix: '',
  reactStrictMode: true,
  trailingSlash: true,
}

export default nextConfig;
