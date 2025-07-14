# nav-site

一个基于 Cloudflare D1 的极简网站导航站点，无需服务器，适合个人与团队自建专属导航页。

---

## 特性

- Cloudflare Pages + D1 Serverless 数据库，无需 MySQL/Redis
- 支持分类导航、搜索、排序
- 所有数据管理与展示均为纯前端页面+API
- 适合自定义扩展，仅需极简配置即可部署

---

## 快速部署

1. **准备 Cloudflare D1 数据库**
   - 在 Cloudflare 控制台创建 D1 数据库
   - 使用 `cloudflare/schema.sql` 初始化表结构

2. **配置 wrangler.toml**
   - 填入 D1 数据库信息
   - 示例：
     ```toml
     name = "nav-site"
     compatibility_date = "2025-07-13"
     [env.production]
     d1_databases = [
       { binding = "DB", database_name = "nav_site_db", database_id = "your-d1-id" }
     ]
     ```

3. **部署到 Cloudflare Pages**
   - 连接 GitHub 仓库
   - 设置环境变量，绑定 D1 数据库
   - 首次部署后自动可用，无需初始化接口

---

## 使用说明

- 首页即导航展示（支持分类/搜索）
- 所有导航数据均通过 API 获取并渲染
- 管理与数据维护请直接操作数据库或自定义 API

---

## 主要 API 接口

- `GET /api/nav-categories/list` 获取分类列表
- `GET /api/nav-links/list` 获取导航列表
- `POST /api/nav-links/add` 新增导航
- `POST /api/nav-links/update` 修改导航
- `POST /api/nav-links/delete` 删除导航
- `POST /api/nav-links/sort` 导航排序

> 如有自定义需求请直接扩展 API 文件或数据库。

---

## 免责声明

本项目仅用于 Cloudflare D1 演示及个人/小型站点，生产环境请加强安全性、鉴权与数据备份。

---

项目地址：[https://github.com/macgowge/nav-site](https://github.com/macgowge/nav-site)
