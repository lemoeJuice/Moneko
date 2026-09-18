const dateFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
const shortDateFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' })

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toDateKey(timestamp = Date.now()): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function dateKeyToDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function dateKeyFromOffset(offset: number, endTimestamp = Date.now()): string {
  const date = dateKeyToDate(toDateKey(endTimestamp))
  date.setDate(date.getDate() + offset)
  return toDateKey(date.getTime())
}

export function formatDateHeading(dateKey: string): string {
  return dateFormatter.format(dateKeyToDate(dateKey)).replace('星期', ' · 星期')
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
  return `${toDateKey(timestamp)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function timestampFromDateTimeInput(value: string): number {
  const [datePart, timePart = '00:00'] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute).getTime()
}

export function timeInputFromTimestamp(timestamp = Date.now()): string {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey()
}
