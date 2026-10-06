export type AppSettings = {
  aiCreatureGeneration: boolean
}

const SETTINGS_KEY = 'homework-garden-settings-v1'

export const defaultSettings: AppSettings = {
  aiCreatureGeneration: false,
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('homework-garden-settings-change'))
}
