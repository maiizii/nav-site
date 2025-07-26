# nav-site

一个基于 Cloudflare D1 的极简网站导航站点，无需服务器，适合个人与团队自建专属导航页。

---

---

## v2.1.0 版本说明

在 v2.0.0 基础上新增移动端响应式适配优化：

- **移动端分类菜单**：PC端左侧边栏在移动端改为右上角三横线菜单，采用全屏弹窗显示
- **响应式布局优化**：移动端分类菜单4列布局，二级分类3列布局，网址卡片2列布局
- **自适应交互**：分类名称自动换行，窗口尺寸变化时内容自动重新渲染
- **移动端体验优化**：针对触摸操作优化交互逻辑，统一视觉风格

## v2.0.0 版本说明

本分支新增「二级分类（父/子分类）」功能，支持更丰富的导航结构，菜单交互参考 TikTok 导航样式：

- 支持顶级分类与子分类（仅二级，不支持多级嵌套）
- 侧栏点击顶级分类时，下方展示子分类 Tab，缺省显示第一个子分类内容
- 导航项归属于子分类，内容区展示当前子分类下的导航项
- 管理后台支持父分类选择
- 升级兼容原有数据，旧分类自动为顶级，导航项可批量迁移至子分类

---

## 数据库升级说明

如果已有旧版数据库，升级时请注意：

1. **分类表升级**  
   如果 `nav_categories` 已存在但没有 `parent_id` 字段，可用如下 SQL 补充：
   ```sql
   ALTER TABLE nav_categories ADD COLUMN parent_id INTEGER DEFAULT NULL;
   ```

2. **导航链接表升级**  
   如果 `nav_links` 已存在但没有 `category_id` 字段，可补充：
   ```sql
   ALTER TABLE nav_links ADD COLUMN category_id INTEGER;
   ```

3. **兼容性说明**  
   - 原有 `category` 字段仍可兼容旧数据，后续可逐步迁移到 `category_id`。
   - 顶级分类的 `parent_id` 设为 NULL，导航项建议归属到具体子分类。

---

## 特性

- Cloudflare Pages + D1 Serverless 数据库，无需 MySQL/Redis
- 支持二级分类导航、搜索、排序
- **响应式设计**：完整支持PC端、平板和移动端，自适应布局优化
- **移动端优化**：专门设计的移动端分类菜单和交互体验
- 所有数据管理与展示均为纯前端页面+API
- 适合自定义扩展，仅需极简配置即可部署

---

## 快速部署

1. **准备 Cloudflare D1 数据库**
   - 在 Cloudflare 控制台创建 D1 数据库
   - 使用 `cloudflare/schema.sql` 初始化表结构（注意本版本需 parent_id、category_id 字段）

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

- 首页导航展示（支持父/子分类、搜索）
- 所有导航数据均通过 API 获取并渲染
- 管理与数据维护请直接操作数据库或自定义 API
- 管理后台支持分类父子结构管理

---

## 主要 API 接口

- `GET /api/nav-categories/list` 获取分类列表（含 parent_id 字段）
- `GET /api/nav-links/list` 获取导航列表（建议使用 category_id 字段归类）
- `POST /api/nav-links/add` 新增导航
- `POST /api/nav-links/update` 修改导航
- `POST /api/nav-links/delete` 删除导航
- `POST /api/nav-links/sort` 导航排序

> 如有自定义需求请直接扩展 API 文件或数据库。

---

## 兼容性

- 升级前的单级分类数据自动为顶级分类
- 导航项未归类时可批量迁移到子分类
- 原有 category 字段兼容，推荐逐步迁移至 category_id

---

## CHANGELOG

详见 [CHANGELOG.md](./CHANGELOG.md)

---

## 免责声明

本项目仅用于 Cloudflare D1 演示及个人/小型站点，生产环境请加强安全性、鉴权与数据备份。

---

项目地址：[https://github.com/maiizii/nav-site](https://github.com/maiizii/nav-site)
