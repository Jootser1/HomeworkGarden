import { defineConfig, devices } from '@playwright/test'

// Laboratoire autonome : pas de build Next.js, serveur ni appel réseau.
export default defineConfig({
  testDir: '../../../tests',
  testMatch: ['creature-lab.spec.ts', 'creature-complex.spec.ts'],
  outputDir: '../../../test-results/creature-lab',
  workers: 1,
  timeout: 90_000,
  use: { ...devices['Pixel 7'], trace: 'retain-on-failure' },
})
