<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { categories, getCategory } from '../constants/categories'
import { useExpenseStore } from '../stores/expenseStore'
import { useSettingsStore } from '../stores/settingsStore'
import { formatMoney } from '../utils/currency'
import { dateKeyFromOffset, dateKeyToDate, formatDateHeading, formatShortDate, toDateKey } from '../utils/date'
import { countPeriodDays, getDefaultPeriodRange, getPeriodRangeFromStart } from '../utils/period'
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
const settingsStore = useSettingsStore()
const initialRange = getDefaultPeriodRange(settingsStore.periodStartDay, expenseStore.expenses)
const defaultCycleStartKey = ref(initialRange.cycleStartKey)
const startDateKey = ref(initialRange.cycleStartKey)
const endDateKey = ref(initialRange.cycleEndKey)
const isCustomRange = ref(false)
const selectedDayKey = ref<string>()

const chartWidth = ref(360)
const chartWrap = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | undefined
const chartTop = 19
const chartBottom = 204
const chartLeft = 38
const chartRight = 10
const chartHeight = chartBottom - chartTop

const rangeIsInvalid = computed(() => startDateKey.value > endDateKey.value)
const effectiveStartKey = computed(() => rangeIsInvalid.value ? endDateKey.value : startDateKey.value)
const effectiveEndKey = computed(() => endDateKey.value)
const rangeDays = computed(() => countPeriodDays(effectiveStartKey.value, effectiveEndKey.value))
const todayKey = toDateKey()
const dataStartKey = computed(() => {
  if (isCustomRange.value || rangeIsInvalid.value) return effectiveStartKey.value
  return getPeriodRangeFromStart(defaultCycleStartKey.value, expenseStore.expenses).firstRecordKey ?? effectiveStartKey.value
})
const dataEndKey = computed(() => effectiveEndKey.value < todayKey ? effectiveEndKey.value : todayKey)
const averageEndKey = computed(() => dataEndKey.value >= todayKey ? dateKeyFromOffset(-1) : dataEndKey.value)
const averageDays = computed(() => {
  if (averageEndKey.value < dataStartKey.value) return 0
  return countPeriodDays(dataStartKey.value, averageEndKey.value)
})

const chartDays = computed<ChartDay[]>(() => {
  const result: ChartDay[] = []
  const startTimestamp = dateKeyToDate(effectiveStartKey.value).getTime()
  for (let index = 0; index < rangeDays.value; index += 1) {
    const key = dateKeyFromOffset(index, startTimestamp)
    const dailyExpenses = expenseStore.expenses.filter((expense) => !expense.isOneOff && key >= dataStartKey.value && key <= dataEndKey.value && toDateKey(expense.timestamp) === key)
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
const periodStartKey = dataStartKey
const periodEndKey = dataEndKey

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
  return { category, total, average: averageDays.value > 0 ? total / averageDays.value : 0 }
}))

function resetDefaultRange(): void {
  const range = getDefaultPeriodRange(settingsStore.periodStartDay, expenseStore.expenses)
  isCustomRange.value = false
  defaultCycleStartKey.value = range.cycleStartKey
  startDateKey.value = range.cycleStartKey
  endDateKey.value = range.cycleEndKey
  selectedDayKey.value = undefined
}

function markCustomRange(): void {
  isCustomRange.value = true
  selectedDayKey.value = undefined
}

function shiftCycle(direction: -1 | 1): void {
  const currentStart = dateKeyToDate(startDateKey.value)
  currentStart.setMonth(currentStart.getMonth() + direction)
  const range = getPeriodRangeFromStart(toDateKey(currentStart.getTime()), expenseStore.expenses)
  isCustomRange.value = false
  defaultCycleStartKey.value = range.cycleStartKey
  startDateKey.value = range.cycleStartKey
  endDateKey.value = range.cycleEndKey
  selectedDayKey.value = undefined
}

watch([startDateKey, endDateKey], () => { selectedDayKey.value = undefined })
watch([() => settingsStore.periodStartDay, () => expenseStore.expenses.length], () => {
  if (!isCustomRange.value) resetDefaultRange()
})

onMounted(() => {
  if (!chartWrap.value) return
  resizeObserver = new ResizeObserver(([entry]) => {
    const width = entry?.contentRect.width
    if (width) chartWidth.value = width
  })
  resizeObserver.observe(chartWrap.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

function barSlot(): number {
  return (chartWidth.value - chartLeft - chartRight) / rangeDays.value
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
  if (rangeDays.value <= 10) return true
  const interval = rangeDays.value <= 31 ? 5 : Math.ceil(rangeDays.value / 6)
  return index % interval === 0 || index === rangeDays.value - 1
}

function chartTick(ratio: number): string {
  return formatMoney(Math.round(maxDaily.value * ratio))
}

</script>

<template>
  <div>
      <div class="stats-date-range" aria-label="统计时间范围">
      <label class="range-field">
        <input v-model="startDateKey" type="date" aria-label="开始日期" @change="markCustomRange" />
      </label>
      <span class="range-separator">至</span>
      <label class="range-field">
        <input v-model="endDateKey" type="date" aria-label="结束日期" @change="markCustomRange" />
      </label>
    </div>
    <p v-if="rangeIsInvalid" class="range-error">结束日期需要晚于开始日期</p>

    <section class="card chart-card">
      <div class="chart-heading">
        <div>
          <div class="chart-metrics">
            <div class="chart-metric">
              <span class="chart-metric-label">日常支出</span>
              <strong class="chart-total">{{ formatMoney(periodTotal) }}</strong>
            </div>
            <div class="chart-metric one-off-metric">
              <span class="chart-metric-label">一次性</span>
              <strong>{{ formatMoney(oneOffTotal) }}</strong>
            </div>
            <span class="period-cycle-actions" aria-label="切换统计周期">
              <button class="icon-button" type="button" aria-label="上一个周期" @click="shiftCycle(-1)">‹</button>
              <button class="icon-button" type="button" aria-label="下一个周期" @click="shiftCycle(1)">›</button>
            </span>
          </div>
          <p class="section-subtitle">按天、按分类堆叠</p>
        </div>
      </div>

      <div ref="chartWrap" class="chart-wrap">
        <svg class="chart-svg" :viewBox="`0 0 ${chartWidth} 240`" preserveAspectRatio="none" role="img" aria-label="日常支出分类堆叠柱状图">
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
            <rect class="chart-hit-area" :x="barX(index)" :y="chartTop" :width="barWidth()" :height="chartBottom - chartTop" fill="transparent" />
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
    </section>

    <section class="card summary-card section-block">
      <div class="average-hero">
        <div>
          <div class="average-label">平均每日生活成本</div>
          <div class="average-value">{{ formatMoney(averageDays > 0 ? Math.round(periodTotal / averageDays) : 0, true) }}<span class="average-unit">/ 天</span></div>
        </div>
        <div class="summary-caption">按 {{ averageDays }} 个自然日计算<br />不含一次性支出</div>
      </div>
      <div class="summary-table">
        <div class="summary-row header"><span>分类</span><span class="summary-amount">日均</span><span class="summary-amount">周期累计</span></div>
        <template v-for="stat in categoryStats" :key="stat.category.id">
          <div v-if="stat.total > 0" class="summary-row">
            <span class="summary-category"><i class="color-dot" :style="{ backgroundColor: stat.category.color }"></i>{{ stat.category.icon }} {{ stat.category.label }}</span>
            <span class="summary-amount">{{ formatMoney(Math.round(stat.average)) }}</span>
            <span class="summary-amount">{{ formatMoney(stat.total) }}</span>
          </div>
        </template>
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
          <span v-if="expense.note">{{ expense.note }}</span>
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
