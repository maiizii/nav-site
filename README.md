# Cloudflare D1 导航站

## 快速部署

1. Cloudflare 控制台创建 D1 数据库和 KV 命名空间
2. 上传 `cloudflare/schema.sql` 初始化表结构
3. 配置 `wrangler.toml` 绑定 D1/KV
4. 使用 Cloudflare Pages 连接 GitHub 仓库，一键部署

## 主要 API

- GET `/api/nav/list` 导航列表
- POST `/api/nav/add` 新增导航
- POST `/api/nav/delete` 删除导航

## 技术栈

- 前端：Next.js + TypeScript + Tailwind CSS + Ant Design
- 后端：Cloudflare Pages Functions + Cloudflare D1/KV