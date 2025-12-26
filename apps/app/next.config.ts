import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import { withBotId } from 'botid/next/config';
import type { NextConfig } from 'next';
import path from 'path';

import './src/env.mjs';

const isStandalone = process.env.NEXT_OUTPUT_STANDALONE === 'true';
const isDev = process.env.NODE_ENV !== 'production';
const isVm = process.env.IS_VM === 'true';

const config: NextConfig = {
  /**
   * ✅ REQUIRED: allow portal + app domains in DEV
   * Fixes:
   * - Blocked cross-origin request
   * - OTP / auth random failures
   * - _next/* resource blocking
   */
  allowedDevOrigins: [
    'https://app.tricompai.sl443.site',
    'https://portal.tricompai.sl443.site',
    'http://localhost:3000',
    'http://localhost:3002',
  ],

  /**
   * ⚠️ Turbopack ONLY for local dev (never on VM)
   */
  ...(isDev && !isVm
    ? {
        turbopack: {
          root: path.join(__dirname, '..', '..'),
          rules: {
            '*.md': {
              loaders: ['raw-loader'],
              as: '*.js',
            },
          },
        },
      }
    : {}),

  /**
   * Webpack config (Prisma + markdown support)
   */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // REQUIRED for Prisma in monorepo
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    return config;
  },

  /**
   * Static assets
   */
  assetPrefix:
    process.env.NODE_ENV === 'production' && process.env.STATIC_ASSETS_URL
      ? `${process.env.STATIC_ASSETS_URL}/app`
      : '',

  reactStrictMode: false,

  transpilePackages: ['@trycompai/db', '@prisma/client'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  /**
   * Experimental flags (keep as-is)
   */
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
      allowedOrigins:
        process.env.NODE_ENV === 'production'
          ? ([process.env.NEXT_PUBLIC_PORTAL_URL, 'https://app.trycomp.ai'].filter(
              Boolean,
            ) as string[])
          : undefined,
    },
    authInterrupts: true,
    optimizePackageImports: ['@trycompai/db', '@trycompai/ui'],
    webpackMemoryOptimizations: true,
  },

  /**
   * Monorepo tracing
   */
  outputFileTracingRoot: path.join(__dirname, '../../'),

  productionBrowserSourceMaps: false,

  ...(isStandalone
    ? {
        output: 'standalone' as const,
      }
    : {}),

  /**
   * PostHog proxy
   */
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },
};

export default withBotId(config);
