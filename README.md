# Cloudflare D1 导航站部署说明

---

## 1. Cloudflare 资源准备

- 创建 Cloudflare D1 数据库（如 nav_site_db）
- 上传 `cloudflare/schema.sql` 初始化表结构
- （可选）创建 KV 命名空间（如需缓存功能）

---

## 2. wrangler.toml 配置

请根据实际数据库和 KV ID 填写：

```toml
name = "nav-site"
compatibility_date = "2025-07-13"
[env.production]
d1_databases = [
  { binding = "DB", database_name = "nav_site_db", database_id = "your-d1-id" }
]
kv_namespaces = [
  { binding = "KV", id = "your-kv-id" }
]
```

---

## 3. Cloudflare Pages 一键部署

1. 连接 GitHub 仓库
2. Pages 项目设置环境变量，绑定 D1/KV
3. 首次部署后访问 `/api/init` 初始化管理员账号

---

## 4. 使用说明

- 默认管理员账号：`admin`，默认密码：`admin123`
- 后台登录页面：`/login`
- 管理后台主页：`/admin`
- 导航管理页面：`/admin/nav`
- 管理员账号设置：`/admin/account`
- 首页展示：`/`
- 所有导航数据管理接口见 `src/api/nav/`

---

## 5. 代码结构

- 后端 API 均在 `src/api/` 下，自动映射至 `/api/xxx`
- 前端页面/组件结构采用 Next.js + TypeScript + Tailwind CSS + Ant Design
- 云服务相关脚本/工具在 `cloudflare/` 目录

---

## 6. 常见问题

- **首次进入后台请先访问 `/api/init` 完成初始化**
- 若出现鉴权失败，请确保浏览器允许 Cookie
- 若需要自定义导航分类/管理员信息，请在管理后台页面操作
- 所有数据操作均为 Cloudflare D1 SQL，无需任何 MySQL/Redis 环境

---

## 7. API 列表（核心接口）

- `POST /api/auth/login` 管理员登录
- `GET /api/admin/account` 获取管理员信息
- `POST /api/admin/account/password` 修改密码
- `GET /api/nav/list` 获取导航列表
- `POST /api/nav/add` 新增导航
- `POST /api/nav/update` 修改导航
- `POST /api/nav/delete` 删除导航

---

## 8. 免责声明

本项目为 Cloudflare D1/KV 演示项目，安全性仅适用于测试/小型站点场景。若用于生产环境请加强鉴权和数据备份。
