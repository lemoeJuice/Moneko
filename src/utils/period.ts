import type { Expense } from '../types'
import { dateKeyToDate, toDateKey } from './date'

export interface PeriodRange {
  startKey: string
  endKey: string
}

export function getDefaultPeriodRange(startDay: number, expenses: Expense[], timestamp = Date.now()): PeriodRange {
  const now = new Date(timestamp)
  const safeStartDay = Math.min(28, Math.max(1, Math.round(startDay)))
  let cycleStart = new Date(now.getFullYear(), now.getMonth(), safeStartDay)

  if (now.getTime() < cycleStart.getTime()) {
    cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, safeStartDay)
  }

  const nextCycleStart = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, safeStartDay)
  const cycleEnd = new Date(nextCycleStart)
  cycleEnd.setDate(cycleEnd.getDate() - 1)

  const firstRecordedExpense = expenses
    .filter((expense) => expense.timestamp >= cycleStart.getTime() && expense.timestamp < nextCycleStart.getTime())
    .sort((a, b) => a.timestamp - b.timestamp)[0]

  return {
    startKey: firstRecordedExpense ? toDateKey(firstRecordedExpense.timestamp) : toDateKey(cycleStart.getTime()),
    endKey: toDateKey(cycleEnd.getTime())
  }
}

export function countPeriodDays(startKey: string, endKey: string): number {
  const start = dateKeyToDate(startKey).getTime()
  const end = dateKeyToDate(endKey).getTime()
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}
