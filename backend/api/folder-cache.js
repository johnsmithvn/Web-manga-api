// 📁 backend/api/folder-cache.js
const express = require("express");
const router = express.Router();
const db = require("../utils/db");

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
  const { mode, root, path: folderPath = "", q, limit = 0, offset = 0 } = req.query;
  if (!mode || !root) return res.status(400).json({ error: "Missing mode or root" });

  try {
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    switch (mode) {
      case "folders": {
        // 📂 Trả về list { name, path } cho allFoldersList
        const rows = db.prepare("SELECT name, path FROM folders WHERE root = ?").all(root);
        return res.json(rows);
      }

      case "random": {
        // 🎲 Lấy ngẫu nhiên 30 folder có thumbnail
        const rows = db.prepare(`
          SELECT name, path, thumbnail FROM folders
          WHERE root = ? AND thumbnail IS NOT NULL
          ORDER BY RANDOM() LIMIT 30
        `).all(root);
        return res.json(rows);
      }

      case "top": {
        // 📈 Top view từ bảng views + folders
        const rows = db.prepare(`
          SELECT f.name, f.path, f.thumbnail, v.count FROM views v
          JOIN folders f ON f.path = v.path AND f.root = ?
          ORDER BY v.count DESC LIMIT 30
        `).all(root);
        return res.json(rows);
      }

      case "search": {
        if (!q) return res.status(400).json({ error: "Missing query" });
        const rows = db.prepare(`
          SELECT name, path, thumbnail FROM folders
          WHERE root = ? AND name LIKE ?
          ORDER BY name ASC LIMIT 50
        `).all(root, `%${q}%`);
        return res.json(rows);
      }

      case "path": {
        // 1️⃣ Lấy record chính của folder hiện tại (ảnh/thumbnail/số lượng ảnh)
        const current = db.prepare(`
          SELECT name, path, thumbnail, imageCount FROM folders
          WHERE root = ? AND path = ?
        `).get(root, folderPath);
      
        // 2️⃣ Lấy subfolder cấp con (VD: Naruto/Ch1 là con của Naruto)
        const depth = folderPath === "" ? 0 : (folderPath.match(/\//g) || []).length;
        const subfolders = db.prepare(`
          SELECT name, path, thumbnail FROM folders
          WHERE root = ? AND path LIKE ? AND
                LENGTH(path) - LENGTH(REPLACE(path, '/', '')) = ?
          ORDER BY path ASC
        `).all(
          root,
          folderPath ? `${folderPath}/%` : `%`,
          depth + 1
        );
        
      
        // 3️⃣ Trả kết quả
        return res.json({
          type: "folder", // 🔥 BẮT BUỘC
          folders: subfolders,
          images: current?.thumbnail ? [current.thumbnail] : [],
          total: subfolders.length,
          totalImages: current?.imageCount || 0
        });
        
      }
      

      default:
        return res.status(400).json({ error: "Invalid mode" });
    }
  } catch (err) {
    console.error("❌ folder-cache error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
