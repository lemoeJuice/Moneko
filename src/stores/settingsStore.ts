import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'moneko-period-start-day'

function loadPeriodStartDay(): number {
  try {
    const saved = Number(globalThis.localStorage?.getItem(STORAGE_KEY))
    return Number.isInteger(saved) && saved >= 1 && saved <= 28 ? saved : 1
  } catch {
    return 1
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const periodStartDay = ref(loadPeriodStartDay())

  function setPeriodStartDay(day: number): void {
    const nextDay = Math.min(28, Math.max(1, Math.round(day)))
    periodStartDay.value = nextDay
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, String(nextDay))
    } catch {
      // Local storage can be unavailable in private browsing contexts.
    }
  }

  return { periodStartDay, setPeriodStartDay }
})
