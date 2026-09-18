# Moneko

轻量、离线优先的个人日常支出记录 PWA。

Moneko 只关注两件事：快速记下一笔日常消费，以及观察排除一次性支出后的真实生活成本。它是纯前端应用，不需要账号、后端或云端数据库。

详细功能说明见 [`feature.md`](./feature.md)。

## 技术栈

- Vue 3、TypeScript、Vite
- Pinia
- Dexie + IndexedDB
- vite-plugin-pwa + Workbox
- 本地 SVG 堆叠柱状图

## 快速开始

需要 Node.js 20+ 和 npm。

```bash
npm ci
npm run dev
```

开发服务器默认地址是 `http://localhost:5173/`。如果需要让同一局域网内的手机访问：

```bash
npm run dev -- --host 0.0.0.0
```

生产构建与本地预览：

```bash
npm run build
npm run preview
```

## 数据与隐私

- 账目使用 Dexie 保存在当前浏览器的 IndexedDB 中。
- 金额使用分为单位的整数保存，不使用浮点数记账。
- 应用没有登录、账号、服务器、远程 API 或云同步。
- 清除浏览器站点数据会清除本机账目，建议在设置中定期导出 JSON 备份。
- JSON 恢复会先验证版本和记录结构；已有记录时会要求确认覆盖。

## GitHub Pages 自部署

项目已经包含可直接使用的 [GitHub Actions workflow](./.github/workflows/deploy.yml)。

1. 在 GitHub 创建仓库，并将项目推送到 `main` 或 `master` 分支。
2. 打开仓库 `Settings` → `Pages`。
3. 将 `Build and deployment` 的 `Source` 设置为 `GitHub Actions`。
4. 推送代码或在 Actions 页面手动运行 `Deploy to GitHub Pages`。
5. 构建完成后，Pages 页面会显示应用地址。

Workflow 会执行 `npm ci`、`npm run build`，然后发布 `dist`。Vite 会根据 GitHub Actions 提供的 `GITHUB_REPOSITORY` 自动设置 `/<repository-name>/` base path。

应用不使用客户端路由，因此不依赖 GitHub Pages 的服务器端 history fallback。构建产物包含 Service Worker，首次正常加载并缓存完成后，核心记录和统计功能可以离线运行。

## 静态服务器部署

也可以将 `npm run build` 生成的 `dist` 目录部署到任意静态文件服务器。应用是单页静态资源，不需要 Node.js 常驻进程或 API 服务。

## 开发约定

- 业务数据通过 `src/data/expenseRepository.ts` 访问 IndexedDB，业务组件不直接操作数据库。
- 货币与日期逻辑集中在 `src/utils/`。
- 默认部署 workflow 位于 `.github/workflows/deploy.yml`。
