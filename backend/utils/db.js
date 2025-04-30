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
    lastModified INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_folders_root_path ON folders(root, path);

  CREATE TABLE IF NOT EXISTS views (
    path TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1
  );
`);

module.exports = db;