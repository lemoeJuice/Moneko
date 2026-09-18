# Moneko

轻量、离线优先的个人日常支出记录 PWA 原型。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

账目通过 Dexie 保存在浏览器 IndexedDB，不需要账号或后端。首次打开并缓存完成后，新增、编辑、删除和统计均可离线使用。

## GitHub Pages

仓库推送到 `main` 或 `master` 后，`.github/workflows/deploy.yml` 会构建并发布 `dist`。Vite 会根据 `GITHUB_REPOSITORY` 自动设置 `/<repository-name>/` base path；应用不使用客户端路由，因此不依赖服务器端 history fallback。
