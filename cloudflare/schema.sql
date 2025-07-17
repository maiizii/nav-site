-- Cloudflare D1/SQLite 数据库初始化建表脚本

-- 导航链接表（升级：增加 category_id 字段用于二级分类归属）
CREATE TABLE IF NOT EXISTS nav_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  category_id INTEGER,  -- 新增：指向 nav_categories.id
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  icon TEXT,
  sort INTEGER DEFAULT 0
);

-- 管理员账号表
CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 分类表（升级：增加 parent_id 字段实现二级分类）
CREATE TABLE IF NOT EXISTS nav_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER DEFAULT NULL,  -- 新增：指向父分类id，顶级分类为NULL
  sort INTEGER DEFAULT 0
);
