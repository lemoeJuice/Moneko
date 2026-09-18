<script setup lang="ts">
import { ref, watch } from 'vue'
import { categories } from '../constants/categories'
import { useExpenseStore } from '../stores/expenseStore'
import { currencySymbol, parseAmountInput } from '../utils/currency'
import { timeInputFromTimestamp, timestampFromDateTimeInput } from '../utils/date'
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
    timestamp: timestampFromDateTimeInput(`${entryDate.value}T${entryTime.value}`)
  })

  amount.value = ''
  note.value = ''
  isOneOff.value = false
  validationMessage.value = ''
  emit('added', expense)
}
</script>

<template>
  <section class="card quick-card" aria-labelledby="quick-entry-title">
    <div class="amount-wrap">
      <span class="currency-prefix">{{ currencySymbol }}</span>
      <input
        id="quick-entry-title"
        v-model="amount"
        class="amount-input"
        inputmode="decimal"
        autocomplete="off"
        placeholder="0.00"
        aria-label="支出金额"
        @input="validationMessage = ''"
      />
    </div>
    <p class="amount-hint">输入金额后，点一下分类就记好了</p>

    <div class="category-grid">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-button"
        type="button"
        :style="{ backgroundColor: category.softColor }"
        @click="save(category.id)"
      >
        <span class="category-icon" aria-hidden="true">{{ category.icon }}</span>
        <span class="category-label">{{ category.label }}</span>
      </button>
    </div>

    <div class="quick-options">
      <input v-model="note" class="note-input" type="text" maxlength="80" placeholder="备注（可选）" />
      <label class="one-off-toggle">
        <input v-model="isOneOff" type="checkbox" />
        <span>一次性支出</span>
      </label>
    </div>

    <div class="schedule-row">
      <button class="schedule-toggle" type="button" @click="setScheduleVisibility">
        {{ showSchedule ? '收起时间设置' : '调整日期 / 时间' }}
      </button>
      <div v-if="showSchedule" class="schedule-controls">
        <input v-model="entryDate" class="compact-input" type="date" aria-label="支出日期" />
        <input v-model="entryTime" class="compact-input" type="time" aria-label="支出时间" />
      </div>
    </div>
    <p v-if="validationMessage" class="validation-message">{{ validationMessage }}</p>
  </section>
</template>
