<script setup lang="ts">
import { ref, watch } from 'vue'
import { categories } from '../constants/categories'
import { useExpenseStore } from '../stores/expenseStore'
import { currencySymbol, parseAmountInput } from '../utils/currency'
import { timeInputFromTimestamp, timestampFromBusinessDateTimeInput } from '../utils/date'
import { forceResetViewport } from '../utils/viewport'
import UiIcon, { type IconName } from './UiIcon.vue'
import type { Expense } from '../types'

const props = defineProps<{ selectedDate: string }>()
const emit = defineEmits<{ added: [expense: Expense] }>()
const expenseStore = useExpenseStore()

const amount = ref('')
const note = ref('')
const isOneOff = ref(false)
const showSchedule = ref(false)
const entryDate = ref(props.selectedDate)
const entryTime = ref(timeInputFromTimestamp())
const validationMessage = ref('')

watch(() => props.selectedDate, (date) => {
  entryDate.value = date
})

function setScheduleVisibility(): void {
  showSchedule.value = !showSchedule.value
  validationMessage.value = ''
}

async function save(categoryId: Expense['categoryId']): Promise<void> {
  const cents = parseAmountInput(amount.value)
  if (cents === null) {
    validationMessage.value = '先输入一个有效金额'
    return
  }

  const expense = await expenseStore.addExpense({
    amount: cents,
    categoryId,
    isOneOff: isOneOff.value,
    note: note.value,
    timestamp: timestampFromBusinessDateTimeInput(`${entryDate.value}T${entryTime.value}`)
  })

  amount.value = ''
  note.value = ''
  isOneOff.value = false
  validationMessage.value = ''
  forceResetViewport()
  emit('added', expense)
}
</script>

<template>
  <section class="card quick-card" aria-labelledby="quick-entry-title">
    <div class="amount-entry-row">
      <div class="amount-wrap">
        <span class="currency-prefix">{{ currencySymbol }}</span>
        <input
          id="quick-entry-title"
          v-model="amount"
          class="amount-input"
          inputmode="decimal"
          autocomplete="off"
          autofocus
          placeholder="0.00"
          aria-label="支出金额"
          @input="validationMessage = ''"
        />
      </div>
      <label class="one-off-pill-toggle" :class="{ active: isOneOff }">
        <input v-model="isOneOff" type="checkbox" class="sr-only" />
        <span class="pill-dot" aria-hidden="true">
          <UiIcon v-if="isOneOff" name="check" :size="10" :stroke-width="3" />
        </span>
        <span class="pill-label">一次性</span>
      </label>
    </div>
    <p class="amount-hint">输入金额后，点一下分类就记好了</p>

    <div class="category-grid">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-button"
        type="button"
        :style="{ '--cat-accent': category.color, '--cat-soft': category.softColor }"
        @click="save(category.id)"
      >
        <span class="category-icon-plate" aria-hidden="true">
          <UiIcon :name="category.icon as IconName" :size="21" :stroke-width="1.9" />
        </span>
        <span class="category-label">{{ category.label }}</span>
      </button>
    </div>

    <div class="quick-options">
      <input v-model="note" class="note-input" type="text" maxlength="80" placeholder="备注（可选）" />
    </div>

    <div class="schedule-row">
      <button class="schedule-toggle" type="button" @click="setScheduleVisibility">
        <span>{{ showSchedule ? '收起时间设置' : '调整日期 / 时间' }}</span>
        <UiIcon :name="showSchedule ? 'close' : 'chevron-down'" :size="12" :stroke-width="2.2" />
      </button>
      <div v-if="showSchedule" class="schedule-controls">
        <input v-model="entryDate" class="compact-input" type="date" aria-label="支出日期" />
        <input v-model="entryTime" class="compact-input" type="time" aria-label="支出时间" />
      </div>
    </div>
    <p v-if="validationMessage" class="validation-message">{{ validationMessage }}</p>
  </section>
</template>
