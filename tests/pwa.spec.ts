import { expect, test } from '@playwright/test'

// Run against a production build: the worker is deliberately disabled in dev.
test('manifest, icons, registration and Apple metadata', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const manifest = await (await page.request.get('/manifest.webmanifest')).json()
  expect(manifest.display).toBe('standalone')
  expect(manifest.scope).toBe('/')
  expect(manifest.icons).toHaveLength(3)
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src)
    expect(response.ok()).toBeTruthy()
    expect(response.headers()['content-type']).toContain('image/png')
  }
  const appleIcon = page.locator('link[rel="apple-touch-icon"]')
  await expect(appleIcon).toHaveAttribute('href', '/icons/apple-touch-icon.png')
  const swResponse = await page.request.get('/sw.js')
  expect(swResponse.headers()['cache-control']).toContain('no-store')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  expect(errors).toEqual([])
})

test('create, resume and finish a new session offline, then visit its garden', async ({ page, context }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  // No pages except home have been visited: all offline chunks must be precached.
  await context.setOffline(true)
  await page.goto('/offline')
  await page.getByRole('button', { name: 'Créer une session', exact: true }).click()
  await page.getByRole('combobox').first().selectOption('manual')
  await page.getByRole('textbox').fill('115 + 9\n127 + 8')
  await page.getByRole('button', { name: 'Lancer avec 2 additions' }).click()
  await expect(page.locator('.exercise-prompt')).toHaveText('115 + 9')
  await expect(page).toHaveURL(/#\/play\//)
  const sessionURL = page.url()

  // Header navigation must work without network and preserve the active session.
  await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Jardin' }).click()
  await expect(page.locator('.garden-camera')).toBeVisible()
  await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Calcul' }).click()
  await expect(page.locator('.exercise-prompt')).toHaveText('115 + 9')

  await page.reload()
  await expect(page.locator('.exercise-prompt')).toHaveText('115 + 9')
  for (const digit of '124') await page.getByRole('button', { name: digit, exact: true }).click()
  await page.getByRole('button', { name: '✓', exact: true }).click()
  await expect(page.locator('.exercise-prompt')).toHaveText('127 + 8')

  // A previously unseen direct /play URL must also fall back to the local shell.
  const sessionId = sessionURL.split('/play/')[1]
  await page.goto(`/play/${sessionId}`)
  await expect(page.locator('.exercise-prompt')).toHaveText('127 + 8')
  for (const digit of '135') await page.getByRole('button', { name: digit, exact: true }).click()
  await page.getByRole('button', { name: '✓', exact: true }).click()
  await page.getByRole('button', { name: 'Utiliser la baguette magique' }).click()
  await expect(page.locator('.garden-creature')).toHaveCount(1)
  expect(errors).toEqual([])
})

test('offline links and local mode do not call the paid generation API', async ({ page, context }) => {
  const apiCalls: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/creatures/')) apiCalls.push(request.url())
  })
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined))
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  await context.setOffline(true)
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false)
  await page.getByRole('link', { name: 'Créer une session', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Créer une session' })).toBeVisible()
  await page.getByRole('button', { name: /Lancer avec/ }).click()
  await expect(page.locator('.exercise-prompt')).toBeVisible()
  expect(apiCalls).toEqual([])
})

test('Safari gets manual install instructions, without promising a native prompt', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  })
  const page = await context.newPage()
  await page.goto('http://localhost:3100/')
  await page.getByRole('button', { name: 'Installer l’app' }).click()
  await expect(page.locator('#install-help')).toContainText('Dans Safari : Partager')
  await context.close()
})
