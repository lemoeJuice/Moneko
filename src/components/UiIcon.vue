<script setup lang="ts">
export type IconName =
  | 'nav-home'
  | 'nav-stats'
  | 'nav-settings'
  | 'meal'
  | 'snack'
  | 'transport'
  | 'shopping'
  | 'daily'
  | 'entertainment'
  | 'other'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'plus'
  | 'close'
  | 'check'
  | 'disk'
  | 'file-spreadsheet'
  | 'calendar'
  | 'cloud-off'
  | 'bulb'
  | 'info'
  | 'empty-sheet'

withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    strokeWidth?: number | string
  }>(),
  {
    size: 20,
    strokeWidth: 2
  }
)
</script>

<template>
  <svg
    class="ui-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Navigation -->
    <template v-if="name === 'nav-home'">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </template>
    <template v-else-if="name === 'nav-stats'">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </template>
    <template v-else-if="name === 'nav-settings'">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </template>

    <!-- Categories -->
    <template v-else-if="name === 'meal'">
      <path d="M4 11h16a1 1 0 0 1 1 1 8 8 0 0 1-8 8 8 8 0 0 1-8-8 1 1 0 0 1 1-1z" />
      <path d="M8 4c0 1.5 1 2 1 3" />
      <path d="M12 3c0 1.5 1 2 1 3" />
      <path d="M16 4c0 1.5 1 2 1 3" />
      <line x1="9" y1="19" x2="15" y2="19" />
    </template>
    <template v-else-if="name === 'snack'">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </template>
    <template v-else-if="name === 'transport'">
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <circle cx="8" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
      <line x1="7" y1="18" x2="5" y2="21" />
      <line x1="17" y1="18" x2="19" y2="21" />
    </template>
    <template v-else-if="name === 'shopping'">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </template>
    <template v-else-if="name === 'daily'">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </template>
    <template v-else-if="name === 'entertainment'">
      <rect x="2" y="6" width="20" height="12" rx="6" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="12" x2="15.01" y2="12" stroke-width="2.5" />
      <line x1="18" y1="12" x2="18.01" y2="12" stroke-width="2.5" />
    </template>
    <template v-else-if="name === 'other'">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </template>

    <!-- Controls -->
    <template v-else-if="name === 'chevron-left'">
      <path d="m15 18-6-6 6-6" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m9 18 6-6-6-6" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" />
    </template>
    <template v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </template>
    <template v-else-if="name === 'close'">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </template>
    <template v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12" />
    </template>

    <!-- Settings & System -->
    <template v-else-if="name === 'disk'">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </template>
    <template v-else-if="name === 'file-spreadsheet'">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <line x1="12" y1="11" x2="12" y2="19" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </template>
    <template v-else-if="name === 'cloud-off'">
      <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0-4 7h1.26a5 5 0 0 0 9.29 2" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </template>
    <template v-else-if="name === 'bulb'">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
    </template>
    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </template>
    <template v-else-if="name === 'empty-sheet'">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="9" y1="8" x2="15" y2="8" stroke-dasharray="2 2" />
      <line x1="9" y1="12" x2="13" y2="12" stroke-dasharray="2 2" />
      <line x1="9" y1="16" x2="11" y2="16" stroke-dasharray="2 2" />
    </template>
  </svg>
</template>

<style scoped>
.ui-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: transform 0.15s ease, stroke 0.15s ease;
}
</style>
