import type { Category, CategoryId } from '../types'

export const categories: Category[] = [
  { id: 'meal', label: '正餐', icon: '🍚', color: '#6ea9d9', softColor: '#e8f3fb' },
  { id: 'snack', label: '零食', icon: '🍪', color: '#e6b85c', softColor: '#fff6dc' },
  { id: 'transport', label: '交通', icon: '🚇', color: '#70b79b', softColor: '#e8f7f0' },
  { id: 'shopping', label: '购物', icon: '🛍', color: '#a78bd0', softColor: '#f2ecfb' },
  { id: 'daily', label: '日用', icon: '🏠', color: '#62b9c1', softColor: '#e7f7f8' },
  { id: 'entertainment', label: '娱乐', icon: '🎮', color: '#df8daf', softColor: '#fcedf3' },
  { id: 'other', label: '其他', icon: '📦', color: '#9caeba', softColor: '#eef2f4' }
]

export const categoryMap = new Map<CategoryId, Category>(categories.map((category) => [category.id, category]))

export function getCategory(categoryId: CategoryId): Category {
  return categoryMap.get(categoryId) ?? categories[categories.length - 1]
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && categoryMap.has(value as CategoryId)
}
