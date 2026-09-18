<script setup lang="ts">
import { ref } from 'vue'
import { useExpenseStore } from '../stores/expenseStore'
import { useSettingsStore } from '../stores/settingsStore'
import { createBackup, createCsv, parseBackup } from '../utils/backup'
import { checkForUpdates as fetchLatestApp } from '../pwa'

const expenseStore = useExpenseStore()
const settingsStore = useSettingsStore()
const fileInput = ref<HTMLInputElement>()
const statusMessage = ref('')
const isError = ref(false)
const updateMessage = ref('')
const isCheckingUpdate = ref(false)
const periodStartDays = Array.from({ length: 28 }, (_, index) => index + 1)

function download(content: BlobPart, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
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

async function checkForUpdates(): Promise<void> {
  if (isCheckingUpdate.value) return

  isCheckingUpdate.value = true
  updateMessage.value = '正在检查更新...'

  try {
    await fetchLatestApp()
    updateMessage.value = '已检查，当前已是最新版本 v0.1'
  } catch (error) {
    updateMessage.value = error instanceof Error ? error.message : '检查更新失败，请稍后重试'
  } finally {
    isCheckingUpdate.value = false
  }

  window.setTimeout(() => {
    if (!isCheckingUpdate.value) updateMessage.value = ''
  }, 3500)
}

function changePeriodStartDay(event: Event): void {
  const target = event.target as HTMLSelectElement
  settingsStore.setPeriodStartDay(Number(target.value))
}
</script>

<template>
  <div>
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
          <span class="setting-icon" aria-hidden="true">📅</span>
          <div class="setting-copy">
            <h2 class="setting-title">统计周期</h2>
            <p class="setting-description">默认按每月设定日期开始，并自动从本周期第一笔记录开始计算。</p>
          </div>
        </div>
        <div class="period-control">
          <span>每月</span>
          <select :value="settingsStore.periodStartDay" aria-label="统计周期开始日期" @change="changePeriodStartDay">
            <option v-for="day in periodStartDays" :key="day" :value="day">{{ day }} 日</option>
          </select>
          <span>开始</span>
        </div>
      </section>

      <section class="card setting-card">
        <div class="setting-card-header">
          <span class="setting-icon" aria-hidden="true">🌤️</span>
          <div class="setting-copy">
            <h2 class="setting-title">离线优先</h2>
            <p class="setting-description">页面 / 应用首次加载并缓存完成后，即使没有网络也能继续使用。记录保存在本机 IndexedDB。</p>
          </div>
        </div>
      </section>

      <section class="card setting-card account-note-card">
        <div class="setting-card-header">
          <span class="setting-icon" aria-hidden="true">💡</span>
          <div class="setting-copy">
            <p class="account-note-title">提示</p>
            <p class="account-note-text">没有账号系统，也没有服务器。请定期导出 JSON 备份，避免清理浏览器数据时丢失记录。</p>
          </div>
        </div>
      </section>

      <section class="card setting-card version-card">
        <div class="setting-card-header">
          <span class="setting-icon" aria-hidden="true">ⓘ</span>
          <div class="setting-copy">
            <h2 class="setting-title">版本</h2>
            <p class="setting-description">当前版本 v0.1</p>
          </div>
           <button class="secondary-button version-action" type="button" :disabled="isCheckingUpdate" @click="checkForUpdates">
             {{ isCheckingUpdate ? '检查中...' : '检查更新' }}
           </button>
        </div>
        <p v-if="updateMessage" class="status-message">{{ updateMessage }}</p>
      </section>
    </div>

  </div>
</template>

<style scoped>
.status-error { color: var(--danger); }
.account-note-title { margin: 0; color: var(--ink); font-size: 14px; font-weight: 800; }
.account-note-text { margin: 4px 0 0; color: var(--muted); font-size: 11px; line-height: 1.5; }
.version-action { flex: 0 0 auto; }
</style>
