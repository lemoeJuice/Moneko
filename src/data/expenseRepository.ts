import Dexie, { type Table } from 'dexie'
import type { Expense } from '../types'

class MonekoDatabase extends Dexie {
  expenses!: Table<Expense, string>

  constructor() {
    super('moneko-local')
    this.version(1).stores({
      expenses: 'id, timestamp, categoryId, isOneOff, createdAt'
    })
  }
}

class ExpenseRepository {
  private readonly database = new MonekoDatabase()

  async list(): Promise<Expense[]> {
    return this.database.expenses.orderBy('timestamp').reverse().toArray()
  }

  async put(expense: Expense): Promise<void> {
    await this.database.expenses.put(expense)
  }

  async remove(id: string): Promise<void> {
    await this.database.expenses.delete(id)
  }

  async replaceAll(expenses: Expense[]): Promise<void> {
    await this.database.transaction('rw', this.database.expenses, async () => {
      await this.database.expenses.clear()
      if (expenses.length > 0) await this.database.expenses.bulkPut(expenses)
    })
  }
}

export const expenseRepository = new ExpenseRepository()
