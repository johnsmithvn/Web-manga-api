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
 * @param {string} rootKey 
 * @returns {Database} SQLite instance
 */
function getDB(rootKey) {
  if (dbMap[rootKey]) return dbMap[rootKey];

  const safeName = rootKey.replace(/[^a-zA-Z0-9_-]/g, "_"); // chống path lỗi
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

  dbMap[rootKey] = db;
  return db;
}

module.exports = getDB;
