<script setup lang="ts">
type AppView = 'home' | 'stats' | 'settings'

defineProps<{ modelValue: AppView }>()
const emit = defineEmits<{ 'update:modelValue': [value: AppView] }>()

const items: Array<{ id: AppView; label: string; icon: string }> = [
  { id: 'home', label: '今天', icon: '☀️' },
  { id: 'stats', label: '统计', icon: '📊' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]
</script>

<template>
  <nav class="bottom-nav" aria-label="主导航">
    <div class="bottom-nav-inner">
      <button
        v-for="item in items"
        :key="item.id"
        class="nav-button"
        :class="{ active: modelValue === item.id }"
        type="button"
        @click="emit('update:modelValue', item.id)"
      >
        <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>
