export const currencyConfig = {
  code: 'CNY',
  locale: 'zh-CN'
} as const

export const currencySymbol = new Intl.NumberFormat(currencyConfig.locale, {
  style: 'currency',
  currency: currencyConfig.code
}).formatToParts(0).find((part) => part.type === 'currency')?.value ?? currencyConfig.code

const compactFormatter = new Intl.NumberFormat(currencyConfig.locale, {
  style: 'currency',
  currency: currencyConfig.code,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})

const preciseFormatter = new Intl.NumberFormat(currencyConfig.locale, {
  style: 'currency',
  currency: currencyConfig.code,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export function formatMoney(cents: number, precise = false): string {
  return (precise ? preciseFormatter : compactFormatter).format(cents / 100)
}

export function formatNumber(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function parseAmountInput(value: string): number | null {
  const normalized = value.trim()
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(normalized)
  if (!match) return null

  const whole = Number(match[1])
  const decimals = (match[2] ?? '').padEnd(2, '0')
  const cents = whole * 100 + Number(decimals || 0)
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null
}
