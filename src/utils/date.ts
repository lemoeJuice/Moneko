const shortDateFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' })
export const BUSINESS_DAY_START_HOUR = 4

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function calendarDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toDateKey(timestamp = Date.now()): string {
  const date = new Date(timestamp)
  if (date.getHours() < BUSINESS_DAY_START_HOUR) date.setDate(date.getDate() - 1)
  return calendarDateKey(date)
}

export function dateKeyToDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function dateKeyFromOffset(offset: number, endTimestamp = Date.now()): string {
  const date = dateKeyToDate(toDateKey(endTimestamp))
  date.setDate(date.getDate() + offset)
  return calendarDateKey(date)
}

export function formatDateHeading(dateKey: string): string {
  const date = dateKeyToDate(dateKey)
  return `${date.getMonth() + 1}月${date.getDate()}日 · ${weekdayFormatter.format(date)}`
}

export function formatShortDate(dateKey: string): string {
  return shortDateFormatter.format(dateKeyToDate(dateKey))
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatDateTimeInput(timestamp: number): string {
  const date = new Date(timestamp)
  return `${calendarDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function timestampFromDateTimeInput(value: string): number {
  const [datePart, timePart = '00:00'] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute).getTime()
}

export function timestampFromBusinessDateTimeInput(value: string): number {
  const timestamp = timestampFromDateTimeInput(value)
  const date = new Date(timestamp)
  if (date.getHours() < BUSINESS_DAY_START_HOUR) date.setDate(date.getDate() + 1)
  return date.getTime()
}

export function timeInputFromTimestamp(timestamp = Date.now()): string {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey()
}
