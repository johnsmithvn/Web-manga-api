// 📁 backend/utils/db.js
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_DIR = path.join(__dirname, "../data");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

// ✅ map: rootKey => DB instance
const dbMap = {};

/**
 * ✅ Tạo DB nếu chưa tồn tại
 * @param {string} dbkey  đây là key của environment
 * @returns {Database} SQLite instance
 */
// ✅ Tạo bảng nếu chưa tồn tại
// folders: cache toàn bộ folder có thumbnail
// views: lưu lượt xem
// ➕ thêm cột root để phân biệt folder từ root nào


function getDB(dbkey) {
  if (dbMap[dbkey]) return dbMap[dbkey];

  const safeName = dbkey.replace(/[^a-zA-Z0-9_-]/g, "_"); // chống path lỗi
  const dbPath = path.join(DB_DIR, `${safeName}.db`);

  const db = new Database(dbPath);
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

  dbMap[dbkey] = db;
  return db;
}

module.exports = getDB;
