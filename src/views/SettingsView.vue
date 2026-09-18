<script setup lang="ts">
import { ref } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'
import { createBackup, createCsv, parseBackup } from '../utils/backup'

const expenseStore = useExpenseStore()
const fileInput = ref<HTMLInputElement>()
const statusMessage = ref('')
const isError = ref(false)

function download(content: BlobPart, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function exportJson(): void {
  const content = JSON.stringify(createBackup(expenseStore.expenses), null, 2)
  download(content, `moneko-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
  setStatus('JSON 备份已导出', false)
}

function exportCsv(): void {
  download(createCsv(expenseStore.expenses), `moneko-expenses-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')
  setStatus('CSV 已导出', false)
}

function openFilePicker(): void {
  fileInput.value?.click()
}

async function importJson(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  try {
    const payload = parseBackup(await file.text())
    if (expenseStore.expenseCount > 0 && !window.confirm(`恢复备份会替换当前 ${expenseStore.expenseCount} 笔记录，确定继续吗？`)) return
    await expenseStore.replaceExpenses(payload.expenses)
    setStatus(`已恢复 ${payload.expenses.length} 笔记录`, false)
  } catch (error) {
    setStatus(error instanceof Error ? error.message : '恢复失败，请检查文件', true)
  }
}

function setStatus(message: string, error: boolean): void {
  statusMessage.value = message
  isError.value = error
  window.setTimeout(() => {
    if (statusMessage.value === message) statusMessage.value = ''
  }, 3500)
}
</script>

<template>
  <div>
    <div class="page-intro">
      <p class="page-kicker">数据只在你的设备上</p>
      <h1 class="page-heading">设置</h1>
    </div>

    <div class="settings-list">
      <section class="card setting-card">
        <div class="setting-card-header">
          <span class="setting-icon" aria-hidden="true">💾</span>
          <div class="setting-copy">
            <h2 class="setting-title">备份与恢复</h2>
            <p class="setting-description">JSON 备份包含版本信息和全部记录，可以在设备之间手动保存。</p>
          </div>
        </div>
        <div class="setting-actions">
          <button class="primary-button" type="button" @click="exportJson">导出 JSON</button>
          <button class="secondary-button" type="button" @click="openFilePicker">恢复 JSON</button>
          <input ref="fileInput" class="file-input" type="file" accept="application/json,.json" @change="importJson" />
        </div>
        <p v-if="statusMessage" class="status-message" :class="{ 'status-error': isError }">{{ statusMessage }}</p>
      </section>

      <section class="card setting-card">
        <div class="setting-card-header">
          <span class="setting-icon" aria-hidden="true">📄</span>
          <div class="setting-copy">
            <h2 class="setting-title">导出 CSV</h2>
            <p class="setting-description">方便用 Numbers、Excel 或其他表格工具查看原始流水。</p>
          </div>
        </div>
        <div class="setting-actions">
          <button class="secondary-button" type="button" @click="exportCsv">导出全部记录</button>
        </div>
      </section>

      <section class="card setting-card">
        <div class="setting-card-header">
          <span class="setting-icon" aria-hidden="true">🌤️</span>
          <div class="setting-copy">
            <h2 class="setting-title">离线优先</h2>
            <p class="setting-description">记录保存在本机 IndexedDB。首次加载并缓存完成后，即使没有网络也能继续使用。</p>
          </div>
        </div>
      </section>
    </div>

    <p class="settings-note">没有账号，也没有后台。请定期导出 JSON 备份，避免清理浏览器数据时丢失记录。</p>
    <p class="version-line">Moneko v0.1 · 只记录支出</p>
  </div>
</template>

<style scoped>
.page-intro { padding-top: 6px; }
.status-error { color: var(--danger); }
</style>
