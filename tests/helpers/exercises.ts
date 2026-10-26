import type { Page } from '@playwright/test'
import type { HomeworkSession } from '@/lib/types'

export const appStateKey = 'homework-garden-state-v1'
export async function activeSession(page: Page): Promise<HomeworkSession> {
  return page.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key)!)
    const session = state.sessions.find((session: HomeworkSession) => session.status === 'active')
    if (!session) throw new Error('Aucune session active enregistrée')
    return session
  }, appStateKey)
}
export async function numericAnswer(page: Page, answer: number) {
  for (const digit of String(answer)) await page.getByRole('button', { name: digit, exact: true }).click()
  await page.getByRole('button', { name: '✓', exact: true }).click()
}
