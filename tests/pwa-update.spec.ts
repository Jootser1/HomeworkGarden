import { expect, test } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'

// Only changes the generated build artifact, restored even if the test fails.
test('an update waits for confirmation and preserves local data', async ({ page }) => {
  const workerPath = 'public/sw.js'
  const originalWorker = await readFile(workerPath, 'utf8')
  try {
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
    await page.evaluate(() => localStorage.setItem('pwa-test-saved-game', 'kept'))

    const updatedWorker = `${originalWorker}\n// Test update ${Date.now()}\n`
    await writeFile(workerPath, updatedWorker)
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      await registration?.update()
    })
    await expect(page.getByRole('button', { name: 'Mettre à jour', exact: true })).toBeVisible({ timeout: 20_000 })
    expect(await page.evaluate(() => localStorage.getItem('pwa-test-saved-game'))).toBe('kept')
    await Promise.all([
      page.waitForEvent('framenavigated', { predicate: (frame) => frame === page.mainFrame() }),
      page.getByRole('button', { name: 'Mettre à jour', exact: true }).click(),
    ])
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('pwa-test-saved-game'))).toBe('kept')
  } finally {
    await writeFile(workerPath, originalWorker)
  }
})
