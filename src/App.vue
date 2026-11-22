<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BottomNav from './components/BottomNav.vue'
import ExpenseEditorModal from './components/ExpenseEditorModal.vue'
import HomeView from './views/HomeView.vue'
import SettingsView from './views/SettingsView.vue'
import StatsView from './views/StatsView.vue'
import { useExpenseStore } from './stores/expenseStore'
import { forceResetViewport } from './utils/viewport'
import type { Expense } from './types'

type AppView = 'home' | 'stats' | 'settings'
type AxisLock = 'none' | 'horizontal' | 'vertical'

const viewOrder: AppView[] = ['home', 'stats', 'settings']
const viewPanels: AppView[] = viewOrder
const displayIndex = ref(0)
const touchOffsetX = ref(0)
const isDragging = ref(false)
const axisLock = ref<AxisLock>('none')
const panelRefs = ref<Array<HTMLElement | null>>([])
const editingExpense = ref<Expense | null>(null)
const expenseStore = useExpenseStore()

let startX = 0
let startY = 0
let startTime = 0

const activeView = computed<AppView>({
  get: () => viewOrder[displayIndex.value],
  set: (view) => goToView(view)
})

const trackStyle = computed(() => {
  const oneThird = 100 / 3
  const basePercent = -displayIndex.value * oneThird
  const dragPercent = isDragging.value && typeof window !== 'undefined' && window.innerWidth > 0
    ? (touchOffsetX.value / window.innerWidth) * oneThird
    : 0

  return {
    transform: `translate3d(${basePercent + dragPercent}%, 0, 0)`,
    transition: isDragging.value ? 'none' : 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)'
  }
})

function handleVisualViewportResize(): void {
  if (window.visualViewport && window.visualViewport.height >= window.innerHeight * 0.9) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
}

onMounted(() => {
  expenseStore.load()
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleVisualViewportResize)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleVisualViewportResize)
  }
  touchReset()
})

function openEditor(expense: Expense): void {
  editingExpense.value = expense
}

function setPanelRef(element: unknown, index: number): void {
  panelRefs.value[index] = element instanceof HTMLElement ? element : null
}

function goToView(view: AppView): void {
  forceResetViewport()
  const targetIndex = viewOrder.indexOf(view)
  if (targetIndex === -1) return
  displayIndex.value = targetIndex
}

function handleTouchStart(event: TouchEvent): void {
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  if (!touch) return
  startX = touch.clientX
  startY = touch.clientY
  startTime = Date.now()
  touchOffsetX.value = 0
  axisLock.value = 'none'
  isDragging.value = false
}

function handleTouchMove(event: TouchEvent): void {
  if (axisLock.value === 'vertical' || event.touches.length !== 1) return
  const touch = event.touches[0]
  if (!touch) return

  const deltaX = touch.clientX - startX
  const deltaY = touch.clientY - startY

  if (axisLock.value === 'none') {
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        axisLock.value = 'horizontal'
        isDragging.value = true
      } else {
        axisLock.value = 'vertical'
        return
      }
    }
  }

  if (axisLock.value === 'horizontal') {
    if (event.cancelable) {
      event.preventDefault()
    }
    const isAtFirst = displayIndex.value === 0 && deltaX > 0
    const isAtLast = displayIndex.value === viewOrder.length - 1 && deltaX < 0
    touchOffsetX.value = (isAtFirst || isAtLast) ? deltaX * 0.3 : deltaX
  }
}

function handleTouchEnd(): void {
  if (!isDragging.value || axisLock.value !== 'horizontal') {
    touchReset()
    return
  }

  const deltaX = touchOffsetX.value
  const duration = Math.max(1, Date.now() - startTime)
  const velocity = Math.abs(deltaX) / duration
  const threshold = (typeof window !== 'undefined' ? window.innerWidth : 360) * 0.22

  if (Math.abs(deltaX) > threshold || velocity > 0.28) {
    if (deltaX < 0 && displayIndex.value < viewOrder.length - 1) {
      displayIndex.value += 1
    } else if (deltaX > 0 && displayIndex.value > 0) {
      displayIndex.value -= 1
    }
  }

  touchReset()
}

function touchReset(): void {
  isDragging.value = false
  touchOffsetX.value = 0
  axisLock.value = 'none'
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand-name">Moneko</div>
      </div>
    </header>

    <div class="app-content">
      <main
        class="view-viewport"
        @touchstart.passive="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @touchcancel="touchReset"
      >
        <div class="view-track" :style="trackStyle">
          <section
            v-for="(view, index) in viewPanels"
            :key="`${view}-${index}`"
            :ref="(element) => setPanelRef(element, index)"
            class="view-panel"
            :class="{ 'scroll-locked': isDragging && axisLock === 'horizontal' }"
          >
            <HomeView v-if="view === 'home'" :is-active="activeView === 'home'" @edit="openEditor" />
            <StatsView v-else-if="view === 'stats'" @edit="openEditor" />
            <SettingsView v-else />
          </section>
        </div>
      </main>
    </div>

    <BottomNav v-model="activeView" />

    <ExpenseEditorModal
      v-if="editingExpense"
      :expense="editingExpense"
      @close="editingExpense = null"
    />
  </div>
</template>
