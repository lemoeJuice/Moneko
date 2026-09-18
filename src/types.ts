export type CategoryId =
  | 'meal'
  | 'snack'
  | 'transport'
  | 'shopping'
  | 'daily'
  | 'entertainment'
  | 'other'

export interface Category {
  id: CategoryId
  label: string
  icon: string
  color: string
  softColor: string
}

export interface Expense {
  id: string
  amount: number
  categoryId: CategoryId
  isOneOff: boolean
  note?: string
  timestamp: number
  createdAt: number
  updatedAt: number
}

export interface BackupPayload {
  version: 1
  exportedAt: number
  expenses: Expense[]
}
