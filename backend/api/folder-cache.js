// 📁 backend/api/folder-cache.js
const express = require("express");
const router = express.Router();
const db = require("../utils/db");
// 🔧 Tạo bảng favorites nếu chưa có
db.prepare(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root TEXT NOT NULL,
    path TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();


// 🧠 Favorites DB thao tác

function addFavorite(root, path) {
  db.prepare("INSERT INTO favorites (root, path) VALUES (?, ?)").run(root, path);
}

function removeFavorite(root, path) {
  db.prepare("DELETE FROM favorites WHERE root = ? AND path = ?").run(root, path);
}

function getFavorites(root) {
  return db
    .prepare("SELECT path FROM favorites WHERE root = ? ORDER BY added_at DESC")
    .all(root);
}

/**
 * 📦 API duy nhất để xử lý các loại folder cache
 * mode = path | random | top | search | folders | favorites | add-favorite | remove-favorite
 *
 * Query:
 * - root: thư mục gốc
 * - path: đường dẫn folder (cho mode=path)
 * - q: từ khóa (cho mode=search)
 * - limit, offset: phân trang folder hoặc ảnh
 */
router.get("/folder-cache", async (req, res) => {
  const {
    mode,
    root,
    path: folderPath = "",
    q,
    limit = 0,
    offset = 0,
  } = req.query;
  if (!mode || !root)
    return res.status(400).json({ error: "Missing mode or root" });

  try {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    switch (mode) {
      case "folders": {
        const rows = db
          .prepare("SELECT name, path, thumbnail FROM folders WHERE root = ?")
          .all(root);
        return res.json(rows);
      }

      case "random": {
        const rows = db
          .prepare(
            `SELECT name, path, thumbnail FROM folders
             WHERE root = ? AND thumbnail IS NOT NULL
             ORDER BY RANDOM() LIMIT 30`
          )
          .all(root);
        return res.json(rows);
      }

      case "top": {
        const rows = db
          .prepare(
            `SELECT f.name, f.path, f.thumbnail, v.count FROM views v
             JOIN folders f ON f.path = v.path AND f.root = ?
             ORDER BY v.count DESC LIMIT 30`
          )
          .all(root);
        return res.json(rows);
      }

      case "favorites": {
        const favs = await getFavorites(root);
        const placeholders = favs.map(() => "?").join(",");
        const paths = favs.map((f) => f.path);

        if (!paths.length) return res.json([]);

        const rows = db
          .prepare(
            `SELECT name, path, thumbnail FROM folders
             WHERE root = ? AND path IN (${placeholders})`
          )
          .all(root, ...paths);
        return res.json(rows);
      }

      case "path": {
        const { loadFolderFromDisk } = require("../utils/folder-loader");

        let realPath = folderPath;
        let isSelf = false;
        if (folderPath.endsWith("/__self__")) {
          realPath = folderPath.replace(/\/__self__$/, "");
          isSelf = true;
        }

        const result = loadFolderFromDisk(root, realPath, limitNum, offsetNum);

        if (isSelf) {
          result.folders = [];
        }

        const isReader =
          result.images.length > 0 && result.folders.length === 0;

        return res.json({
          type: isReader ? "reader" : "folder",
          folders: result.folders,
          images: result.images,
          total: result.total,
          totalImages: result.totalImages,
        });
      }

      case "search": {
        if (!q || typeof q !== "string") {
          return res.status(400).json({ error: "Missing query" });
        }

        const rows = db
          .prepare(
            `SELECT name, path, thumbnail FROM folders
             WHERE root = ? AND name LIKE ?
             ORDER BY name ASC LIMIT 50`
          )
          .all(root, `%${q}%`);
        return res.json(rows);
      }

      default:
        return res.status(400).json({ error: "Invalid mode" });
    }
  } catch (err) {
    console.error("❌ folder-cache error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ POST: add/remove favorite
router.post("/folder-cache", express.json(), async (req, res) => {
  const { mode, root, path } = req.body;
  if (!mode || !root || !path)
    return res.status(400).json({ error: "Missing mode/root/path" });

  try {
    if (mode === "add-favorite") {
      addFavorite(root, path);
      return res.json({ success: true });
    }
    if (mode === "remove-favorite") {
      removeFavorite(root, path);
      return res.json({ success: true });
    }
    return res.status(400).json({ error: "Invalid favorite mode" });
  } catch (err) {
    console.error("❌ favorite API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
