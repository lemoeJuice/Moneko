import { registerSW } from 'virtual:pwa-register'

export const updateServiceWorker = registerSW({ immediate: true })

export async function checkForUpdates(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('当前浏览器不支持 PWA 更新')
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    throw new Error('应用尚未完成离线缓存，请刷新后重试')
  }

  await registration.update()
}
