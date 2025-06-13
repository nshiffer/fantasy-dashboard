/** @type {import('next').NextConfig} */
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  basePath: '',
  assetPrefix: '',
  reactStrictMode: true,
  trailingSlash: true,
}

export default nextConfig;
