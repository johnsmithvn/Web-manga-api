// 📁 backend/api/folder-cache.js
const express = require("express");
const router = express.Router();
// ✅ Dùng DB dynamic theo dbkey
const getDB = require("../utils/db");
const { getRootPath } = require("../utils/config");
/**
 * 📦 API duy nhất để xử lý các loại folder cache
 * mode = path | random | top | search | folders
 *
 * Query:
 * - root: thư mục gốc
 * - path: đường dẫn folder (cho mode=path)
 * - q: từ khóa (cho mode=search)
 * - limit, offset: phân trang folder hoặc ảnh
 */
router.get("/folder-cache", async (req, res) => {
  const {
    key,
    mode,
    root,
    path: folderPath = "",
    q,
    limit = 0,
    offset = 0,
  } = req.query;
  const dbkey = key;
  if (!dbkey) return res.status(400).json({ error: "Missing dbkey" });
  
  if (!mode || !root)
    return res.status(400).json({ error: "Missing mode or root" });
  // ✅ Validate rootKey xem có tồn tại trong config không
  const rootPath = getRootPath(dbkey);
  if (!rootPath) {
    return res.status(400).json({ error: "Invalid root" });
  }

  try {
    const db = getDB(dbkey); // ✅ lấy DB instance riêng env
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
        // 🎲 Lấy ngẫu nhiên 30 folder có thumbnail
        const rows = db
          .prepare(
            `
          SELECT name, path, thumbnail, isFavorite FROM folders
          WHERE root = ? AND thumbnail IS NOT NULL
          ORDER BY RANDOM() LIMIT 30
        `
          )
          .all(root);
        return res.json(rows);
      }

      case "top": {
        // 📈 Top view từ bảng views + folders
        const rows = db
          .prepare(
            `
          SELECT f.name, f.path, f.thumbnail, v.count ,f.isFavorite FROM views v
          JOIN folders f ON f.path = v.path AND f.root = ?
          ORDER BY v.count DESC LIMIT 30
        `
          )
          .all(root);
        return res.json(rows);
      }

      case "path": {
        const { loadFolderFromDisk } = require("../utils/folder-loader");

        // ✅ Xử lý folder giả (__self__) → load từ folder cha
        let realPath = folderPath;
        let isSelf = false;
        if (folderPath.endsWith("/__self__")) {
          realPath = folderPath.replace(/\/__self__$/, "");
          isSelf = true;
        }

        const result = loadFolderFromDisk(
          dbkey,
          root,
          realPath,
          limitNum,
          offsetNum
        );

        // ❌ Nếu là folder giả thì không trả folders con (chỉ là reader)
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
            `
            SELECT name, path, thumbnail, isFavorite FROM folders
            WHERE root = ? AND name LIKE ?
            ORDER BY name ASC LIMIT 50
          `
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


router.get("/next-chapter", (req, res) => {
  const { key, root, path, dir = "next" } = req.query;
  if (!key || !root || !path || !["next", "prev"].includes(dir)) {
    return res.status(400).json({ error: "Thiếu tham số hoặc sai direction" });
  }

  const db = getDB(key);
  const current = db
    .prepare(`SELECT id FROM folders WHERE root = ? AND path = ?`)
    .get(root, path);

  if (!current) return res.json({ path: null }); // Không tìm thấy current

  const order = dir === "next" ? "ASC" : "DESC";
  const compare = dir === "next" ? ">" : "<";

  const next = db
    .prepare(
      `SELECT path FROM folders WHERE root = ? AND id ${compare} ? ORDER BY id ${order} LIMIT 1`
    )
    .get(root, current.id);

  res.json({ path: next?.path || null });
});


module.exports = router;


