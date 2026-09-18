<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BottomNav from './components/BottomNav.vue'
import ExpenseEditorModal from './components/ExpenseEditorModal.vue'
import HomeView from './views/HomeView.vue'
import SettingsView from './views/SettingsView.vue'
import StatsView from './views/StatsView.vue'
import { useExpenseStore } from './stores/expenseStore'
import type { Expense } from './types'

type AppView = 'home' | 'stats' | 'settings'

const activeView = ref<AppView>('home')
const editingExpense = ref<Expense | null>(null)
const expenseStore = useExpenseStore()

onMounted(() => expenseStore.load())

function openEditor(expense: Expense): void {
  editingExpense.value = expense
}
</script>

<template>
  <div class="app-shell">
    <div class="app-content">
      <header class="topbar">
        <div class="brand-name">Moneko</div>
      </header>

      <main>
        <HomeView v-if="activeView === 'home'" @edit="openEditor" />
        <StatsView v-else-if="activeView === 'stats'" @edit="openEditor" />
        <SettingsView v-else />
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
