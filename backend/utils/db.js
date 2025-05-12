// 📁 backend/utils/db.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// ✅ Tạo thư mục data nếu chưa có
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// ✅ Tạo hoặc mở file SQLite
const dbPath = path.join(DATA_DIR, 'cache.db');
const db = new Database(dbPath);

// ✅ Tạo bảng nếu chưa tồn tại
// folders: cache toàn bộ folder có thumbnail
// views: lưu lượt xem
// ➕ thêm cột root để phân biệt folder từ root nào

db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root TEXT NOT NULL,
    name TEXT NOT NULL, 
    path TEXT NOT NULL,
    thumbnail TEXT,
    lastModified INTEGER,
    imageCount INTEGER DEFAULT 0,
    chapterCount INTEGER DEFAULT 0,
    type TEXT DEFAULT 'folder',
    createdAt INTEGER,
    updatedAt INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_folders_root_path ON folders(root, path);

  CREATE TABLE IF NOT EXISTS views (
    path TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1
  );
`);


module.exports = db;

// CREATE TABLE IF NOT EXISTS folders (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   root TEXT NOT NULL,            -- tên thư mục gốc (1,2,...)
//   name TEXT NOT NULL,            -- tên folder
//   path TEXT NOT NULL,            -- đường dẫn từ root
//   thumbnail TEXT,                -- URL ảnh đầu tiên
//   imageCount INTEGER DEFAULT 0,  -- số lượng ảnh trong folder
//   chapterCount INTEGER DEFAULT 0,-- số lượng subfolder trực tiếp
//   type TEXT DEFAULT 'folder',    -- 'folder' hoặc 'reader'
//   createdAt INTEGER,             -- timestamp lần đầu insert
//   updatedAt INTEGER              -- timestamp lần cuối cập nhật
// );
