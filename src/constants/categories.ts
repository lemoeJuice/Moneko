import type { Category, CategoryId } from '../types'

export const categories: Category[] = [
  { id: 'meal', label: '正餐', icon: 'meal', color: '#569cd6', softColor: '#ebf4fc' },
  { id: 'snack', label: '零食', icon: 'snack', color: '#d99b38', softColor: '#fef7e7' },
  { id: 'transport', label: '交通', icon: 'transport', color: '#52a384', softColor: '#eaf7f1' },
  { id: 'shopping', label: '购物', icon: 'shopping', color: '#9472cb', softColor: '#f4edfc' },
  { id: 'daily', label: '日用', icon: 'daily', color: '#4aaab4', softColor: '#e8f7f8' },
  { id: 'entertainment', label: '娱乐', icon: 'entertainment', color: '#d4729a', softColor: '#fdf0f5' },
  { id: 'other', label: '其他', icon: 'other', color: '#889eb0', softColor: '#edf2f6' }
]

export const categoryMap = new Map<CategoryId, Category>(categories.map((category) => [category.id, category]))

export function getCategory(categoryId: CategoryId): Category {
  return categoryMap.get(categoryId) ?? categories[categories.length - 1]
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && categoryMap.has(value as CategoryId)
}
