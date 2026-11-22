<script setup lang="ts">
import UiIcon, { type IconName } from './UiIcon.vue'

type AppView = 'home' | 'stats' | 'settings'

defineProps<{ modelValue: AppView }>()
const emit = defineEmits<{ 'update:modelValue': [value: AppView] }>()

const items: Array<{ id: AppView; label: string; icon: IconName }> = [
  { id: 'home', label: '记录', icon: 'nav-home' },
  { id: 'stats', label: '统计', icon: 'nav-stats' },
  { id: 'settings', label: '设置', icon: 'nav-settings' }
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
        <span class="nav-icon-wrap" aria-hidden="true">
          <UiIcon :name="item.icon" :size="19" :stroke-width="modelValue === item.id ? 2.2 : 1.8" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>
