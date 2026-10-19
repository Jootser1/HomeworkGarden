import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  reloadOnOnline: false,
  additionalPrecacheEntries: [
    { url: '/offline', revision: randomUUID() },
    ...['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'].map((url) => ({
      url,
      revision: createHash('sha256').update(readFileSync(`public${url}`)).digest('hex'),
    })),
  ],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
        { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      ],
    }]
  },
}

export default withSerwist(nextConfig)
