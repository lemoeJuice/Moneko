import { dateKeyToDate, toDateKey } from './date'

export interface PeriodRange {
  cycleStartKey: string
  cycleEndKey: string
}

export type PeriodEndpoint = 'start' | 'end'

function dateKeyAtNoon(date: Date): string {
  date.setHours(12, 0, 0, 0)
  return toDateKey(date.getTime())
}

function shiftDateKey(dateKey: string, days: number): string {
  const date = dateKeyToDate(dateKey)
  date.setDate(date.getDate() + days)
  return dateKeyAtNoon(date)
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function isPeriodRangeValid(startKey: string, endKey: string): boolean {
  if (startKey > endKey) return false

  const start = dateKeyToDate(startKey)
  const end = dateKeyToDate(endKey)
  const monthDistance = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  if (monthDistance > 1) return false

  return countPeriodDays(startKey, endKey) <= Math.max(daysInMonth(start), daysInMonth(end))
}

export function getMaxPeriodEnd(startKey: string): string {
  let endKey = startKey
  for (let index = 0; index < 62; index += 1) {
    const nextKey = shiftDateKey(endKey, 1)
    if (!isPeriodRangeValid(startKey, nextKey)) break
    endKey = nextKey
  }
  return endKey
}

export function getMinPeriodStart(endKey: string): string {
  let startKey = endKey
  for (let index = 0; index < 62; index += 1) {
    const previousKey = shiftDateKey(startKey, -1)
    if (!isPeriodRangeValid(previousKey, endKey)) break
    startKey = previousKey
  }
  return startKey
}

export function shiftPeriodEndpoint(dateKey: string, direction: -1 | 1, endpoint: PeriodEndpoint): string {
  const date = dateKeyToDate(dateKey)
  const targetYear = date.getFullYear()
  const targetMonth = date.getMonth() + direction
  const targetMonthLastDay = new Date(targetYear, targetMonth + 1, 0).getDate()
  const targetDay = date.getDate()

  if (targetDay <= targetMonthLastDay) {
    return dateKeyAtNoon(new Date(targetYear, targetMonth, targetDay))
  }

  if (endpoint === 'start') {
    return dateKeyAtNoon(new Date(targetYear, targetMonth + 1, 1))
  }

  return dateKeyAtNoon(new Date(targetYear, targetMonth, targetMonthLastDay))
}

export function getPeriodRangeFromStart(cycleStartKey: string): PeriodRange {
  const cycleStart = dateKeyToDate(cycleStartKey)
  const nextCycleStart = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, cycleStart.getDate())
  cycleStart.setHours(4, 0, 0, 0)
  nextCycleStart.setHours(4, 0, 0, 0)
  const cycleEnd = new Date(nextCycleStart)
  cycleEnd.setDate(cycleEnd.getDate() - 1)

  return {
    cycleStartKey,
    cycleEndKey: toDateKey(cycleEnd.getTime()),
  }
}

export function getDefaultPeriodRange(startDay: number, timestamp = Date.now()): PeriodRange {
  const now = dateKeyToDate(toDateKey(timestamp))
  const safeStartDay = Math.min(28, Math.max(1, Math.round(startDay)))
  let cycleStart = new Date(now.getFullYear(), now.getMonth(), safeStartDay)

  if (now.getTime() < cycleStart.getTime()) {
    cycleStart = new Date(now.getFullYear(), now.getMonth() - 1, safeStartDay)
  }

  return getPeriodRangeFromStart(toDateKey(cycleStart.getTime()))
}

export function countPeriodDays(startKey: string, endKey: string): number {
  const start = dateKeyToDate(startKey).getTime()
  const end = dateKeyToDate(endKey).getTime()
  return Math.max(1, Math.round((end - start) / 86400000) + 1)
}
