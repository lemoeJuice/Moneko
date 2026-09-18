<script setup lang="ts">
import { ref } from 'vue'
import { categories } from '../constants/categories'
import { useExpenseStore } from '../stores/expenseStore'
import { formatDateTimeInput, timestampFromDateTimeInput } from '../utils/date'
import { parseAmountInput } from '../utils/currency'
import type { Expense } from '../types'

const props = defineProps<{ expense: Expense }>()
const emit = defineEmits<{ close: [] }>()
const expenseStore = useExpenseStore()

const amount = ref((props.expense.amount / 100).toFixed(2))
const categoryId = ref(props.expense.categoryId)
const isOneOff = ref(props.expense.isOneOff)
const note = ref(props.expense.note ?? '')
const dateTime = ref(formatDateTimeInput(props.expense.timestamp))
const errorMessage = ref('')

async function save(): Promise<void> {
  const cents = parseAmountInput(amount.value)
  if (cents === null) {
    errorMessage.value = '请输入有效金额'
    return
  }

  await expenseStore.updateExpense(props.expense.id, {
    amount: cents,
    categoryId: categoryId.value,
    isOneOff: isOneOff.value,
    note: note.value,
    timestamp: timestampFromDateTimeInput(dateTime.value)
  })
  emit('close')
}

async function remove(): Promise<void> {
  if (!window.confirm('确定删除这笔记录吗？删除后无法撤销。')) return
  await expenseStore.deleteExpense(props.expense.id)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div class="modal-header">
          <h2 id="editor-title" class="modal-title">编辑这笔记录</h2>
          <button class="icon-button" type="button" aria-label="关闭" @click="emit('close')">×</button>
        </div>

        <div class="form-field">
          <label class="form-label" for="edit-amount">金额</label>
          <div class="edit-amount-row">
            <input id="edit-amount" v-model="amount" class="form-input" inputmode="decimal" />
            <label class="one-off-toggle edit-one-off-toggle">
              <input v-model="isOneOff" type="checkbox" />
              <span>一次性</span>
            </label>
          </div>
        </div>

        <div class="form-field">
          <span class="form-label">分类</span>
          <div class="modal-category-grid">
            <button
              v-for="category in categories"
              :key="category.id"
              class="modal-category-button"
              :class="{ selected: categoryId === category.id }"
              type="button"
              @click="categoryId = category.id"
            >
              {{ category.icon }} {{ category.label }}
            </button>
          </div>
        </div>

        <div class="form-field">
          <label class="form-label" for="edit-datetime">日期 / 时间</label>
          <input id="edit-datetime" v-model="dateTime" class="form-input" type="datetime-local" />
        </div>

        <div class="form-field">
          <label class="form-label" for="edit-note">备注</label>
          <input id="edit-note" v-model="note" class="form-input" maxlength="80" placeholder="可选" />
        </div>

        <p v-if="errorMessage" class="validation-message">{{ errorMessage }}</p>
        <div class="modal-actions">
          <button class="danger-button" type="button" @click="remove">删除</button>
          <div class="modal-actions-right">
            <button class="secondary-button" type="button" @click="emit('close')">取消</button>
            <button class="primary-button" type="button" @click="save">保存修改</button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.edit-amount-row { display: flex; align-items: center; gap: 8px; }
.edit-amount-row .form-input { min-width: 0; }
.edit-one-off-toggle { flex: 0 0 auto; }
.validation-message { margin: 8px 0 0; color: var(--danger); font-size: 11px; }
</style>
