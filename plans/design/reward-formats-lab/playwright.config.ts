import { defineConfig, devices } from '@playwright/test'

// Local art review only: no application server, storage or network service.
export default defineConfig({
  testDir: '../../../tests',
  testMatch: 'reward-formats-pilot.spec.ts',
  outputDir: '../../../test-results/reward-formats-pilot',
  workers: 1,
  timeout: 90_000,
  use: { ...devices['Pixel 7'], trace: 'retain-on-failure' },
})
