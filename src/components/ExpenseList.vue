<script setup lang="ts">
import { ref } from 'vue'
import { getCategory } from '../constants/categories'
import { formatMoney } from '../utils/currency'
import { formatTime } from '../utils/date'
import UiIcon, { type IconName } from './UiIcon.vue'
import type { Expense } from '../types'

defineProps<{ expenses: Expense[] }>()
const emit = defineEmits<{ edit: [expense: Expense] }>()
const pressedExpenseId = ref<string | null>(null)

function editExpense(event: MouseEvent, expense: Expense): void {
  const button = event.currentTarget as HTMLButtonElement
  pressedExpenseId.value = null
  button.blur()
  window.requestAnimationFrame(() => emit('edit', expense))
}

function clearPressedExpense(): void {
  pressedExpenseId.value = null
}
</script>

<template>
  <div v-if="expenses.length > 0" class="card expense-list">
    <button
      v-for="expense in expenses"
      :key="expense.id"
      class="expense-row"
      :class="{ pressed: pressedExpenseId === expense.id }"
      type="button"
      @pointerdown="pressedExpenseId = expense.id"
      @pointercancel="clearPressedExpense"
      @click="editExpense($event, expense)"
    >
      <span
        class="expense-icon"
        :style="{
          backgroundColor: getCategory(expense.categoryId).softColor,
          color: getCategory(expense.categoryId).color
        }"
        aria-hidden="true"
      >
        <UiIcon :name="getCategory(expense.categoryId).icon as IconName" :size="19" :stroke-width="2" />
      </span>
      <span class="expense-info">
        <span class="expense-main">
          <span class="expense-label">{{ getCategory(expense.categoryId).label }}</span>
          <span v-if="expense.isOneOff" class="one-off-badge">一次性</span>
        </span>
        <span v-if="expense.note" class="expense-note">{{ expense.note }}</span>
      </span>
      <span class="expense-time">{{ formatTime(expense.timestamp) }}</span>
      <span class="expense-amount">{{ formatMoney(expense.amount) }}</span>
    </button>
  </div>
  <div v-else class="card empty-state">
    <div class="empty-graphic" aria-hidden="true">
      <UiIcon name="empty-sheet" :size="32" :stroke-width="1.6" />
    </div>
    <p>这一天还没有记录，记下第一笔吧</p>
  </div>
</template>
