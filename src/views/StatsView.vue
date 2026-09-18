<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { categories, getCategory } from '../constants/categories'
import { useExpenseStore } from '../stores/expenseStore'
import { formatMoney } from '../utils/currency'
import { dateKeyFromOffset, formatDateHeading, formatShortDate, toDateKey } from '../utils/date'
import type { CategoryId, Expense } from '../types'

interface ChartSegment {
  categoryId: CategoryId
  amount: number
}

interface ChartDay {
  key: string
  total: number
  segments: ChartSegment[]
}

const emit = defineEmits<{ edit: [expense: Expense] }>()
const expenseStore = useExpenseStore()
const rangeDays = ref<7 | 30 | 90>(30)
const selectedDayKey = ref<string>()
const rangeOptions = [7, 30, 90] as const

const chartWidth = 720
const chartTop = 19
const chartBottom = 204
const chartLeft = 38
const chartRight = 10
const chartHeight = chartBottom - chartTop

const chartDays = computed<ChartDay[]>(() => {
  const result: ChartDay[] = []
  for (let index = rangeDays.value - 1; index >= 0; index -= 1) {
    const key = dateKeyFromOffset(-index)
    const dailyExpenses = expenseStore.expenses.filter((expense) => !expense.isOneOff && toDateKey(expense.timestamp) === key)
    const segments = categories
      .map((category) => ({
        categoryId: category.id,
        amount: dailyExpenses.filter((expense) => expense.categoryId === category.id).reduce((sum, expense) => sum + expense.amount, 0)
      }))
      .filter((segment) => segment.amount > 0)
    result.push({ key, total: segments.reduce((sum, segment) => sum + segment.amount, 0), segments })
  }
  return result
})

const maxDaily = computed(() => Math.max(1, ...chartDays.value.map((day) => day.total)))
const periodTotal = computed(() => chartDays.value.reduce((sum, day) => sum + day.total, 0))
const selectedDay = computed(() => chartDays.value.find((day) => day.key === selectedDayKey.value) ?? chartDays.value[chartDays.value.length - 1])
const periodStartKey = computed(() => chartDays.value[0]?.key ?? dateKeyFromOffset(-rangeDays.value + 1))
const periodEndKey = computed(() => chartDays.value[chartDays.value.length - 1]?.key ?? toDateKey())

const periodOneOffs = computed(() => expenseStore.expenses
  .filter((expense) => expense.isOneOff)
  .filter((expense) => {
    const key = toDateKey(expense.timestamp)
    return key >= periodStartKey.value && key <= periodEndKey.value
  })
  .sort((a, b) => b.timestamp - a.timestamp))
const oneOffTotal = computed(() => periodOneOffs.value.reduce((sum, expense) => sum + expense.amount, 0))

const categoryStats = computed(() => categories.map((category) => {
  const total = chartDays.value.reduce((sum, day) => sum + (day.segments.find((segment) => segment.categoryId === category.id)?.amount ?? 0), 0)
  return { category, total, average: total / rangeDays.value }
}))

watch(rangeDays, () => { selectedDayKey.value = undefined })

function barSlot(): number {
  return (chartWidth - chartLeft - chartRight) / rangeDays.value
}

function barX(index: number): number {
  const slot = barSlot()
  const width = Math.max(4, Math.min(21, slot * .68))
  return chartLeft + index * slot + (slot - width) / 2
}

function barWidth(): number {
  const slot = barSlot()
  return Math.max(4, Math.min(21, slot * .68))
}

function segmentY(day: ChartDay, segment: ChartSegment): number {
  let consumed = 0
  for (const current of day.segments) {
    if (current.categoryId === segment.categoryId) break
    consumed += current.amount
  }
  return chartBottom - ((consumed + segment.amount) / maxDaily.value) * chartHeight
}

function segmentHeight(segment: ChartSegment): number {
  return (segment.amount / maxDaily.value) * chartHeight
}

function shouldShowDateLabel(index: number): boolean {
  if (rangeDays.value === 7) return true
  if (rangeDays.value === 30) return index % 5 === 0 || index === rangeDays.value - 1
  return index % 15 === 0 || index === rangeDays.value - 1
}

function chartTick(ratio: number): string {
  return formatMoney(Math.round(maxDaily.value * ratio))
}

</script>

<template>
  <div>
    <div class="stats-toolbar" role="tablist" aria-label="统计时间范围">
      <button v-for="days in rangeOptions" :key="days" class="range-button" :class="{ active: rangeDays === days }" type="button" @click="rangeDays = days">
        最近 {{ days }} 天
      </button>
    </div>

    <section class="card chart-card">
      <div class="chart-heading">
        <div>
          <h2 class="section-title">日常支出</h2>
          <p class="section-subtitle">按天、按分类堆叠</p>
        </div>
        <span class="chart-total">{{ formatMoney(periodTotal) }}</span>
      </div>

      <div class="chart-wrap">
        <svg class="chart-svg" :viewBox="`0 0 ${chartWidth} 240`" role="img" aria-label="日常支出分类堆叠柱状图">
          <g v-for="ratio in [0, .5, 1]" :key="ratio">
            <line class="chart-grid-line" :x1="chartLeft" :x2="chartWidth - chartRight" :y1="chartBottom - ratio * chartHeight" :y2="chartBottom - ratio * chartHeight" />
            <text class="chart-axis-label" x="2" :y="chartBottom - ratio * chartHeight + 4">{{ chartTick(ratio) }}</text>
          </g>
          <g
            v-for="(day, index) in chartDays"
            :key="day.key"
            class="chart-bar"
            :class="{ selected: selectedDay?.key === day.key }"
            role="button"
            tabindex="0"
            @click="selectedDayKey = day.key"
            @keydown.enter="selectedDayKey = day.key"
          >
            <rect :x="barX(index)" :y="chartTop" :width="barWidth()" :height="chartBottom - chartTop" fill="transparent" />
            <rect
              v-for="segment in day.segments"
              :key="segment.categoryId"
              :x="barX(index)"
              :y="segmentY(day, segment)"
              :width="barWidth()"
              :height="segmentHeight(segment)"
              :fill="getCategory(segment.categoryId).color"
              rx="1.5"
            />
            <text v-if="shouldShowDateLabel(index)" class="chart-date-label" :x="barX(index) + barWidth() / 2" y="225" text-anchor="middle">{{ formatShortDate(day.key) }}</text>
          </g>
        </svg>
      </div>

      <div v-if="selectedDay" class="chart-tip">
        <div class="chart-tip-head">
          <span>{{ formatDateHeading(selectedDay.key) }}</span>
          <span class="chart-tip-total">{{ formatMoney(selectedDay.total) }}</span>
        </div>
        <div v-if="selectedDay.segments.length > 0" class="chart-tip-categories">
          <span v-for="segment in selectedDay.segments" :key="segment.categoryId" class="chart-tip-category">
            {{ getCategory(segment.categoryId).icon }} {{ getCategory(segment.categoryId).label }} <b>{{ formatMoney(segment.amount) }}</b>
          </span>
        </div>
        <span v-else class="chart-tip-category">这一天没有日常支出</span>
      </div>
      <p class="chart-footnote">柱状图已排除一次性支出 <strong>{{ formatMoney(oneOffTotal) }}</strong></p>
    </section>

    <section class="card summary-card section-block">
      <div class="average-hero">
        <div>
          <div class="average-label">平均每日生活成本</div>
          <div class="average-value">{{ formatMoney(Math.round(periodTotal / rangeDays), true) }}<span class="average-unit">/ 天</span></div>
        </div>
        <div class="summary-caption">按 {{ rangeDays }} 个自然日计算<br />不含一次性支出</div>
      </div>
      <div class="summary-table">
        <div class="summary-row header"><span>分类</span><span class="summary-amount">日均</span><span class="summary-amount">周期累计</span></div>
        <div v-for="stat in categoryStats" :key="stat.category.id" class="summary-row">
          <span class="summary-category"><i class="color-dot" :style="{ backgroundColor: stat.category.color }"></i>{{ stat.category.icon }} {{ stat.category.label }}</span>
          <span class="summary-amount">{{ formatMoney(Math.round(stat.average)) }}</span>
          <span class="summary-amount">{{ formatMoney(stat.total) }}</span>
        </div>
      </div>
    </section>

    <section class="card one-off-card section-block">
      <div class="section-header">
        <div>
          <h2 class="section-title">一次性支出</h2>
          <p class="section-subtitle">不参与日常生活成本计算</p>
        </div>
      </div>
      <div class="one-off-total">{{ formatMoney(oneOffTotal, true) }}</div>
      <button v-for="expense in periodOneOffs" :key="expense.id" class="one-off-row" type="button" @click="emit('edit', expense)">
        <span class="one-off-date">{{ formatShortDate(toDateKey(expense.timestamp)) }}</span>
        <span class="one-off-description">
          <strong>{{ getCategory(expense.categoryId).icon }} {{ getCategory(expense.categoryId).label }}</strong>
          <span>{{ expense.note || '无备注' }}</span>
        </span>
        <span class="one-off-amount">{{ formatMoney(expense.amount) }}</span>
      </button>
      <div v-if="periodOneOffs.length === 0" class="empty-state">这个周期还没有一次性支出</div>
    </section>
  </div>
</template>

<style scoped>
.one-off-row { width: 100%; border: 0; background: transparent; text-align: left; }
.one-off-row:hover { background: #fffdf7; }
</style>
