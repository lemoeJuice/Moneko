<script setup lang="ts">
import { ref } from 'vue'
import { categories } from '../constants/categories'
import { useExpenseStore } from '../stores/expenseStore'
import { formatDateTimeInput, timestampFromDateTimeInput } from '../utils/date'
import { parseAmountInput } from '../utils/currency'
import { forceResetViewport } from '../utils/viewport'
import UiIcon, { type IconName } from './UiIcon.vue'
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

function closeModal(): void {
  forceResetViewport()
  emit('close')
}

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
  closeModal()
}

async function remove(): Promise<void> {
  if (!window.confirm('确定删除这笔记录吗？删除后无法撤销。')) return
  await expenseStore.deleteExpense(props.expense.id)
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="closeModal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div class="modal-header">
          <h2 id="editor-title" class="modal-title">编辑这笔记录</h2>
          <button class="icon-button" type="button" aria-label="关闭" @click="closeModal">
            <UiIcon name="close" :size="17" :stroke-width="2.2" />
          </button>
        </div>

        <div class="form-field">
          <label class="form-label" for="edit-amount">金额</label>
          <div class="edit-amount-row">
            <input id="edit-amount" v-model="amount" class="form-input" inputmode="decimal" />
            <label class="one-off-pill-toggle edit-one-off-toggle" :class="{ active: isOneOff }">
              <input v-model="isOneOff" type="checkbox" class="sr-only" />
              <span class="pill-dot" aria-hidden="true">
                <UiIcon v-if="isOneOff" name="check" :size="10" :stroke-width="3" />
              </span>
              <span class="pill-label">一次性</span>
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
              :style="{
                '--cat-accent': category.color,
                '--cat-soft': category.softColor
              }"
              type="button"
              @click="categoryId = category.id"
            >
              <UiIcon :name="category.icon as IconName" :size="15" :stroke-width="2" />
              <span>{{ category.label }}</span>
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
            <button class="secondary-button" type="button" @click="closeModal">取消</button>
            <button class="primary-button" type="button" @click="save">保存</button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
