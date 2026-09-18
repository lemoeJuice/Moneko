<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import QuickEntry from '../components/QuickEntry.vue'
import ExpenseList from '../components/ExpenseList.vue'
import { useExpenseStore } from '../stores/expenseStore'
import { formatDateHeading, isToday, toDateKey } from '../utils/date'
import { formatMoney } from '../utils/currency'
import type { Expense } from '../types'

defineProps<{ isActive: boolean }>()
const emit = defineEmits<{ edit: [expense: Expense] }>()
const expenseStore = useExpenseStore()
const selectedDate = ref(toDateKey())
const toastVisible = ref(false)
const showQuickEntry = ref(false)
let toastTimer: number | undefined

const dayExpenses = computed(() => expenseStore.expenses.filter((expense) => toDateKey(expense.timestamp) === selectedDate.value))
const dayTotal = computed(() => dayExpenses.value.reduce((total, expense) => total + expense.amount, 0))
const regularTotal = computed(() => dayExpenses.value.filter((expense) => !expense.isOneOff).reduce((total, expense) => total + expense.amount, 0))
const oneOffTotal = computed(() => dayExpenses.value.filter((expense) => expense.isOneOff).reduce((total, expense) => total + expense.amount, 0))

function moveDate(offset: number): void {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + offset)
  selectedDate.value = toDateKey(date.getTime())
}

function showToast(): void {
  toastVisible.value = true
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastVisible.value = false }, 4200)
}

function handleAdded(): void {
  showQuickEntry.value = false
  showToast()
}

async function undo(): Promise<void> {
  await expenseStore.undoLastAdded()
  toastVisible.value = false
}

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div>
    <div class="date-nav">
      <div class="date-nav-main">
        <label class="date-picker-label">
          <span class="date-nav-title">{{ formatDateHeading(selectedDate) }}</span>
          <input v-model="selectedDate" class="date-picker-input" type="date" aria-label="选择查看日期" />
        </label>
        <span v-if="isToday(selectedDate)" class="today-pill">今天</span>
      </div>
      <div class="date-nav-actions">
        <button class="icon-button" type="button" aria-label="前一天" @click="moveDate(-1)">‹</button>
        <button class="icon-button" type="button" aria-label="后一天" @click="moveDate(1)">›</button>
      </div>
    </div>

    <section class="day-summary">
      <div class="day-summary-main">
        <p class="day-summary-label">{{ isToday(selectedDate) ? '今天' : '这一天' }}共支出</p>
        <p class="day-summary-total">{{ formatMoney(dayTotal, true) }}</p>
      </div>
      <p class="day-summary-split">
        <span>日常 <strong>{{ formatMoney(regularTotal) }}</strong></span>
        <span>一次性 <strong class="one-off-text">{{ formatMoney(oneOffTotal) }}</strong></span>
      </p>
    </section>

    <section class="section-block">
      <div class="section-header">
        <div>
          <h2 class="section-title">{{ isToday(selectedDate) ? '今天的记录' : '这一天的记录' }}</h2>
          <p class="section-subtitle">点击一笔记录可以编辑</p>
        </div>
        <span v-if="dayExpenses.length > 0" class="flow-total">{{ dayExpenses.length }} 笔</span>
      </div>
      <ExpenseList :expenses="dayExpenses" @edit="emit('edit', $event)" />
    </section>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast">
        <span>已记录，今天也照顾好自己</span>
        <button type="button" @click="undo">撤销</button>
      </div>
    </Transition>

    <Teleport to="body">
      <button v-if="isActive" class="floating-add" type="button" aria-label="新增支出" @click="showQuickEntry = true">
        <span aria-hidden="true">+</span>
      </button>

      <div v-if="showQuickEntry && isActive" class="modal-backdrop" @click.self="showQuickEntry = false">
        <section class="modal entry-modal" role="dialog" aria-modal="true" aria-labelledby="new-entry-title">
          <div class="modal-header">
            <h2 id="new-entry-title" class="modal-title">新记录</h2>
            <button class="icon-button" type="button" aria-label="关闭" @click="showQuickEntry = false">×</button>
          </div>
          <QuickEntry :selected-date="selectedDate" @added="handleAdded" />
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.date-picker-label { position: relative; display: inline-flex; align-items: center; gap: 0; cursor: pointer; }
.date-picker-label::after { content: '⌄'; margin-left: 6px; color: var(--faint); font-size: 15px; }
.date-picker-input { position: absolute; inset: 0; width: 100%; cursor: pointer; opacity: 0; }
.day-summary { display: flex; align-items: end; justify-content: space-between; gap: 16px; padding: 7px 2px 21px; }
.day-summary-main { min-width: 0; }
.day-summary-label { margin: 0 0 3px; color: var(--muted); font-size: 12px; font-weight: 700; }
.day-summary-total { margin: 0; color: var(--ink); font-size: 34px; font-weight: 850; letter-spacing: -.07em; }
.day-summary-split { display: grid; flex: 0 0 auto; gap: 4px; margin: 0 0 4px; color: var(--muted); font-size: 11px; line-height: 1.25; text-align: right; }
.day-summary-split strong { color: var(--blue-deep); }
.day-summary-split .one-off-text { color: #a37a31; }
.toast-enter-active, .toast-leave-active { transition: transform .2s ease, opacity .2s ease; }
.toast-enter-from, .toast-leave-to { transform: translateY(12px); opacity: 0; }
.validation-message { margin: 9px 3px 0; color: var(--danger); font-size: 11px; }
.entry-modal :deep(.quick-card) { padding: 0; border: 0; box-shadow: none; }
</style>
