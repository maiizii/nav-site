## v2.0.0 - 2025-07-17

- 新增二级分类（父子分类）功能
- 分类表增加 parent_id 字段，支持父/子分类结构
- 导航链接表增加 category_id 字段，导航项归属子分类
- 前端分类菜单升级，支持顶级分类和子分类 Tab 切换，内容区展示当前子分类导航项
- 管理后台支持父分类设置
- 升级兼容原有数据，原有 category 字段仍可兼容旧数据
- 旧数据自动为顶级分类，导航项可批量迁移到子分类

### 数据库升级兼容性

- 如果 nav_categories 已存在但没有 parent_id 字段，可执行：
  ```sql
  ALTER TABLE nav_categories ADD COLUMN parent_id INTEGER DEFAULT NULL;
  ```
- 如果 nav_links 已存在但没有 category_id 字段，可执行：
  ```sql
  ALTER TABLE nav_links ADD COLUMN category_id INTEGER;
  ```
- 原有 category 字段仍可兼容旧数据，推荐逐步迁移至 category_id 字段

---

## v1.0.0

- 单级分类与导航功能
