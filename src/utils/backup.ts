import { getCategory, isCategoryId } from '../constants/categories'
import type { BackupPayload, Expense } from '../types'
import { toDateKey } from './date'

export const BACKUP_VERSION = 1 as const

export function createBackup(expenses: Expense[]): BackupPayload {
  return {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    expenses: [...expenses]
  }
}

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') return false
  const expense = value as Partial<Expense>
  return typeof expense.id === 'string'
    && expense.id.length > 0
    && typeof expense.amount === 'number'
    && Number.isSafeInteger(expense.amount)
    && expense.amount >= 0
    && isCategoryId(expense.categoryId)
    && typeof expense.isOneOff === 'boolean'
    && (expense.note === undefined || typeof expense.note === 'string')
    && typeof expense.timestamp === 'number'
    && Number.isFinite(expense.timestamp)
    && typeof expense.createdAt === 'number'
    && Number.isFinite(expense.createdAt)
    && typeof expense.updatedAt === 'number'
    && Number.isFinite(expense.updatedAt)
}

export function parseBackup(text: string): BackupPayload {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('文件不是有效的 JSON')
  }

  if (!value || typeof value !== 'object') throw new Error('备份格式不正确')
  const payload = value as Partial<BackupPayload>
  if (payload.version !== BACKUP_VERSION || !Array.isArray(payload.expenses)) {
    throw new Error('暂不支持这个备份版本')
  }
  if (!payload.expenses.every(isExpense)) throw new Error('备份中包含格式不正确的记录')
  const ids = new Set(payload.expenses.map((expense) => expense.id))
  if (ids.size !== payload.expenses.length) throw new Error('备份中存在重复记录')

  return {
    version: BACKUP_VERSION,
    exportedAt: typeof payload.exportedAt === 'number' ? payload.exportedAt : Date.now(),
    expenses: payload.expenses
  }
}

function csvCell(value: string | number): string {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function createCsv(expenses: Expense[]): string {
  const header = ['日期', '时间', '分类', '一次性支出', '备注', '金额']
  const rows = expenses.map((expense) => {
    const date = new Date(expense.timestamp)
    const dateText = toDateKey(expense.timestamp)
    const timeText = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    return [dateText, timeText, `${getCategory(expense.categoryId).icon} ${getCategory(expense.categoryId).label}`, expense.isOneOff ? '是' : '否', expense.note ?? '', (expense.amount / 100).toFixed(2)]
  })
  return `\ufeff${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}`
}
