import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

let commitHash = ''
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  commitHash = process.env.GITHUB_SHA?.slice(0, 7) || 'dev'
}

const buildTime = `${new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(new Date()).replace(/\//g, '-')} (UTC+8)`

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0'),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_TIME__: JSON.stringify(buildTime)
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Moneko 日常支出',
        short_name: 'Moneko',
        description: '轻量、离线优先的日常支出记录',
        theme_color: '#f7fbff',
        background_color: '#f7fbff',
        lang: 'zh-CN',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}']
      }
    })
  ]
})
