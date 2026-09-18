import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { expenseRepository } from '../data/expenseRepository'
import type { Expense } from '../types'

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function sortExpenses(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.timestamp - a.timestamp)
}

export const useExpenseStore = defineStore('expenses', () => {
  const expenses = ref<Expense[]>([])
  const isLoading = ref(true)
  const lastAddedId = ref<string | null>(null)
  const isLoaded = ref(false)

  const expenseCount = computed(() => expenses.value.length)

  async function load(): Promise<void> {
    if (isLoaded.value) return
    isLoading.value = true
    expenses.value = sortExpenses(await expenseRepository.list())
    isLoaded.value = true
    isLoading.value = false
  }

  async function addExpense(input: Pick<Expense, 'amount' | 'categoryId' | 'isOneOff' | 'timestamp'> & { note?: string }): Promise<Expense> {
    const now = Date.now()
    const expense: Expense = {
      id: createId(),
      amount: input.amount,
      categoryId: input.categoryId,
      isOneOff: input.isOneOff,
      note: input.note?.trim() || undefined,
      timestamp: input.timestamp,
      createdAt: now,
      updatedAt: now
    }
    await expenseRepository.put(expense)
    expenses.value = sortExpenses([expense, ...expenses.value])
    lastAddedId.value = expense.id
    return expense
  }

  async function updateExpense(id: string, patch: Pick<Expense, 'amount' | 'categoryId' | 'isOneOff' | 'timestamp'> & { note?: string }): Promise<void> {
    const current = expenses.value.find((expense) => expense.id === id)
    if (!current) return
    const updated: Expense = {
      ...current,
      ...patch,
      note: patch.note?.trim() || undefined,
      updatedAt: Date.now()
    }
    await expenseRepository.put(updated)
    expenses.value = sortExpenses(expenses.value.map((expense) => expense.id === id ? updated : expense))
  }

  async function deleteExpense(id: string): Promise<void> {
    await expenseRepository.remove(id)
    expenses.value = expenses.value.filter((expense) => expense.id !== id)
    if (lastAddedId.value === id) lastAddedId.value = null
  }

  async function undoLastAdded(): Promise<boolean> {
    if (!lastAddedId.value) return false
    const id = lastAddedId.value
    await deleteExpense(id)
    return true
  }

  async function replaceExpenses(nextExpenses: Expense[]): Promise<void> {
    await expenseRepository.replaceAll(nextExpenses)
    expenses.value = sortExpenses(nextExpenses)
    lastAddedId.value = null
  }

  function getExpense(id: string): Expense | undefined {
    return expenses.value.find((expense) => expense.id === id)
  }

  return {
    expenses,
    expenseCount,
    isLoading,
    load,
    addExpense,
    updateExpense,
    deleteExpense,
    undoLastAdded,
    replaceExpenses,
    getExpense
  }
})
