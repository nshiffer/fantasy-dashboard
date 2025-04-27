/** @type {import('next').NextConfig} */
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/fantasy-dashboard' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/fantasy-dashboard/' : '',
  reactStrictMode: true,
  trailingSlash: true,
}

export default nextConfig;
