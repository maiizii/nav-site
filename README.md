# Cloudflare D1 导航站部署

## 1. Cloudflare 资源准备
- 创建 Cloudflare D1 数据库（如 nav_site_db）
- 上传 cloudflare/schema.sql 初始化表结构
- （可选）创建 KV 命名空间

## 2. wrangler.toml 配置
按实际数据库和 KV ID 填写

## 3. Cloudflare Pages 部署
- 连接 GitHub 仓库
- Pages 项目设置环境变量，绑定 D1/KV
- 部署成功后访问 `/api/init` 初始化管理员账号

## 4. 使用说明
- 默认管理员：admin / admin123
- 后台登录：`/admin`
- 管理员账号管理：`/admin`
- 首页展示：`/`
- 导航数据管理接口见 src/api/nav/

## 5. 代码结构
- 后端API均在 `src/api/` 下，自动映射 `/api/xxx`
- 前端页面/组件结构与 Next.js/Ant Design 原项目一致

## 6. 非常重要
- 删除所有 MySQL/Redis/Docker 相关代码和配置
- 所有数据操作均为 Cloudflare D1 SQL
- 鉴权方式为 Cookie，前端无需更改鉴权逻辑
