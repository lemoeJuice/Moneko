<script setup lang="ts">
import { getCategory } from '../constants/categories'
import { formatMoney } from '../utils/currency'
import { formatTime } from '../utils/date'
import type { Expense } from '../types'

defineProps<{ expenses: Expense[] }>()
defineEmits<{ edit: [expense: Expense] }>()
</script>

<template>
  <div v-if="expenses.length > 0" class="card expense-list">
    <button v-for="expense in expenses" :key="expense.id" class="expense-row" type="button" @click="$emit('edit', expense)">
      <span class="expense-icon" :style="{ backgroundColor: getCategory(expense.categoryId).softColor }" aria-hidden="true">
        {{ getCategory(expense.categoryId).icon }}
      </span>
      <span class="expense-info">
        <span class="expense-main">
          <span>{{ getCategory(expense.categoryId).label }}</span>
          <span v-if="expense.isOneOff" class="one-off-badge">一次性</span>
        </span>
        <span class="expense-note">{{ expense.note || '无备注' }}</span>
      </span>
      <span class="expense-time">{{ formatTime(expense.timestamp) }}</span>
      <span class="expense-amount">{{ formatMoney(expense.amount) }}</span>
    </button>
  </div>
  <div v-else class="card empty-state">
    <div class="empty-emoji" aria-hidden="true">🌱</div>
    <p>这一天还没有记录，记下第一笔吧</p>
  </div>
</template>
