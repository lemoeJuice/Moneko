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
const trackRef = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)
const editingExpense = ref<Expense | null>(null)
const expenseStore = useExpenseStore()

let startX = 0
let startY = 0
let startTime = 0
let currentOffsetX = 0
let isDragging = false
let axisLock: AxisLock = 'none'
let rafId: number | null = null

const activeView = computed<AppView>({
  get: () => viewOrder[displayIndex.value],
  set: (view) => goToView(view)
})

function applyTrackPosition(offset = 0, withTransition = false): void {
  const el = trackRef.value
  if (!el) return
  const oneThird = 100 / 3
  const basePercent = -displayIndex.value * oneThird
  const width = window.innerWidth > 0 ? window.innerWidth : 360
  const dragPercent = (offset / width) * oneThird
  el.style.transition = withTransition ? 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
  el.style.transform = `translate3d(${basePercent + dragPercent}%, 0, 0)`
}

function setViewportTouchAction(action: string): void {
  if (viewportRef.value) viewportRef.value.style.touchAction = action
}

function handleVisualViewportResize(): void {
  if (window.visualViewport && window.visualViewport.height >= window.innerHeight * 0.9) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
}

onMounted(() => {
  expenseStore.load()
  applyTrackPosition(0, false)
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleVisualViewportResize)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleVisualViewportResize)
  }
  if (rafId) cancelAnimationFrame(rafId)
})

function openEditor(expense: Expense): void {
  editingExpense.value = expense
}

function goToView(view: AppView): void {
  forceResetViewport()
  const targetIndex = viewOrder.indexOf(view)
  if (targetIndex === -1) return
  displayIndex.value = targetIndex
  applyTrackPosition(0, true)
}

function handleTouchStart(event: TouchEvent): void {
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  if (!touch) return

  startX = touch.clientX
  startY = touch.clientY
  startTime = Date.now()
  currentOffsetX = 0
  axisLock = 'none'
  isDragging = false
  // Reset to allow both axes until direction is determined
  setViewportTouchAction('pan-y')
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function handleTouchMove(event: TouchEvent): void {
  if (axisLock === 'vertical' || event.touches.length !== 1) return
  const touch = event.touches[0]
  if (!touch) return

  const deltaX = touch.clientX - startX
  const deltaY = touch.clientY - startY

  if (axisLock === 'none') {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    if (absX > 5 || absY > 5) {
      if (absX >= absY) {
        axisLock = 'horizontal'
        isDragging = true
        // Tell the browser to handle only horizontal panning — no vertical scroll
        // This runs entirely on the compositor thread, no preventDefault needed
        setViewportTouchAction('pan-x')
        if (trackRef.value) {
          trackRef.value.style.transition = 'none'
        }
      } else {
        axisLock = 'vertical'
        // Let the browser scroll vertically without interference
        setViewportTouchAction('pan-y')
        return
      }
    }
  }

  if (axisLock === 'horizontal') {
    const isAtFirst = displayIndex.value === 0 && deltaX > 0
    const isAtLast = displayIndex.value === viewOrder.length - 1 && deltaX < 0
    currentOffsetX = (isAtFirst || isAtLast) ? deltaX * 0.28 : deltaX

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        applyTrackPosition(currentOffsetX, false)
        rafId = null
      })
    }
  }
}

function handleTouchEnd(): void {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }

  if (!isDragging || axisLock !== 'horizontal') {
    touchReset()
    return
  }

  const deltaX = currentOffsetX
  const duration = Math.max(1, Date.now() - startTime)
  const velocity = Math.abs(deltaX) / duration
  const width = typeof window !== 'undefined' ? window.innerWidth : 360
  const threshold = width * 0.2

  if (Math.abs(deltaX) > threshold || velocity > 0.25) {
    if (deltaX < 0 && displayIndex.value < viewOrder.length - 1) {
      displayIndex.value += 1
    } else if (deltaX > 0 && displayIndex.value > 0) {
      displayIndex.value -= 1
    }
  }

  touchReset()
}

function touchReset(): void {
  isDragging = false
  currentOffsetX = 0
  axisLock = 'none'
  setViewportTouchAction('pan-y')
  applyTrackPosition(0, true)
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
        ref="viewportRef"
        class="view-viewport"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend.passive="handleTouchEnd"
        @touchcancel.passive="touchReset"
      >
        <div ref="trackRef" class="view-track">
          <section
            v-for="(view, index) in viewPanels"
            :key="`${view}-${index}`"
            class="view-panel"
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
