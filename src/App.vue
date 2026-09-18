<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BottomNav from './components/BottomNav.vue'
import ExpenseEditorModal from './components/ExpenseEditorModal.vue'
import HomeView from './views/HomeView.vue'
import SettingsView from './views/SettingsView.vue'
import StatsView from './views/StatsView.vue'
import { useExpenseStore } from './stores/expenseStore'
import type { Expense } from './types'

type AppView = 'home' | 'stats' | 'settings'

const viewOrder: AppView[] = ['home', 'stats', 'settings']
const viewPanels: AppView[] = ['settings', 'home', 'stats', 'settings', 'home']
const displayIndex = ref(1)
const isAnimating = ref(true)
const touchStart = ref<{ x: number; y: number } | null>(null)
const editingExpense = ref<Expense | null>(null)
const expenseStore = useExpenseStore()

const activeView = computed<AppView>({
  get: () => viewOrder[(displayIndex.value - 1 + viewOrder.length) % viewOrder.length],
  set: (view) => goToView(view)
})

const trackStyle = computed(() => ({
  transform: `translate3d(-${displayIndex.value * 20}%, 0, 0)`,
  transition: isAnimating.value ? 'transform .36s cubic-bezier(.22, .75, .25, 1)' : 'none'
}))

onMounted(() => expenseStore.load())

function openEditor(expense: Expense): void {
  editingExpense.value = expense
}

function resetScrollPosition(): void {
  window.scrollTo({ top: 0, behavior: 'auto' })
}

function goToView(view: AppView): void {
  const targetIndex = viewOrder.indexOf(view) + 1
  if (targetIndex === displayIndex.value) return
  resetScrollPosition()
  isAnimating.value = true
  displayIndex.value = targetIndex
}

function moveView(direction: 1 | -1): void {
  resetScrollPosition()
  isAnimating.value = true
  displayIndex.value += direction
}

function handleTrackTransitionEnd(event: TransitionEvent): void {
  if (event.propertyName !== 'transform') return
  if (displayIndex.value === 0 || displayIndex.value === viewPanels.length - 1) {
    const targetIndex = displayIndex.value === 0 ? viewPanels.length - 2 : 1
    isAnimating.value = false
    displayIndex.value = targetIndex
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => { isAnimating.value = true })
    })
  }
}

function handleTouchStart(event: TouchEvent): void {
  const touch = event.touches[0]
  if (touch) touchStart.value = { x: touch.clientX, y: touch.clientY }
}

function handleTouchEnd(event: TouchEvent): void {
  if (!touchStart.value) return
  const touch = event.changedTouches[0]
  if (!touch) return
  const deltaX = touch.clientX - touchStart.value.x
  const deltaY = touch.clientY - touchStart.value.y
  touchStart.value = null
  if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return
  moveView(deltaX < 0 ? 1 : -1)
}

onBeforeUnmount(() => { touchStart.value = null })
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
        @touchend="handleTouchEnd"
      >
        <div class="view-track" :style="trackStyle" @transitionend="handleTrackTransitionEnd">
          <section v-for="(view, index) in viewPanels" :key="`${view}-${index}`" class="view-panel">
            <HomeView v-if="view === 'home'" @edit="openEditor" />
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
