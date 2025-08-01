## v2.1.0 - 2025-07-26

### 移动端响应式适配优化

- **移动端分类菜单重构**：将PC端左侧边栏分类菜单改为移动端右上角三横线菜单，采用全屏弹窗形式
- **分类菜单布局优化**：移动端分类菜单采用4列网格布局，提升空间利用率和交互体验
- **二级分类响应式**：移动端二级分类采用3列网格布局，字体和间距针对小屏优化
- **网址卡片适配**：移动端网址列表改为2列布局，卡片内容和字体大小适配移动设备
- **分类名称换行**：长分类名称在移动端自动换行显示，提升阅读体验
- **响应式交互**：窗口尺寸变化时自动重新渲染内容，确保最佳显示效果
- **移动端优化**：隐藏移动端TOP按钮，优化头部布局和导航菜单显示

### 样式和交互改进

- 移动端分类菜单采用淡入动画效果
- 优化移动端触摸交互和菜单关闭逻辑
- 改进移动端搜索框和头部布局
- 统一移动端和PC端的视觉风格

---

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
