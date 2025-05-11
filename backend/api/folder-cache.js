// 📁 backend/api/folder-cache.js
const express = require("express");
const router = express.Router();

// ✅ Dùng DB dynamic theo rootKey
const getDB = require("../utils/db");
// ✅ Lấy path thật theo rootKey
const { getRootPath } = require("../utils/config");

/**
 * 📦 API duy nhất để xử lý các loại folder cache
 * mode = path | random | top | search | folders
 *
 * Query:
 * - root: mã nguồn thư mục (key trong .env, ví dụ: FANTASY)
 * - path: đường dẫn folder (cho mode=path)
 * - q: từ khóa (cho mode=search)
 * - limit, offset: phân trang folder hoặc ảnh
 */
router.get("/folder-cache", async (req, res) => {
  const {
    mode,
    root, // rootKey ví dụ "FANTASY"
    path: folderPath = "",
    q,
    limit = 0,
    offset = 0,
  } = req.query;

  // ❌ Thiếu tham số bắt buộc
  if (!mode || !root) {
    return res.status(400).json({ error: "Missing mode or root" });
  }

  // ✅ Validate rootKey xem có tồn tại trong config không
  const rootPath = getRootPath(root);
  if (!rootPath) {
    return res.status(400).json({ error: "Invalid root" });
  }

  try {
    const db = getDB(root); // ✅ lấy DB instance riêng cho rootKey
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const basePath = folderPath || "";

    switch (mode) {
      case "root-folders": {
        const fs = require("fs");
        const path = require("path");

        const rootDir = getRootPath(root);
        if (!fs.existsSync(rootDir)) {
          return res.status(400).json({ error: "Root path không tồn tại" });
        }

        const entries = fs.readdirSync(rootDir, { withFileTypes: true });
        const folders = [];

        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          folders.push({
            name: entry.name, // Tên thư mục
            path: entry.name, // Path tương đối từ root
            thumbnail: "/default/default-cover.jpg", // ✅ Ảnh mặc định
            isSelfReader: true, // Đánh dấu là folder gốc (không chapter)
          });
        }

        return res.json(folders);
      }

      case "folders": {
        const basePath = folderPath || "";

        // Nếu basePath không có gì → không trả gì cả (bắt buộc chọn rootFolder)
        if (!basePath) {
          return res.json([]);
        }

        const query = `
            SELECT name, path, thumbnail FROM folders 
            WHERE root = ? AND (path = ? OR path LIKE ?)
          `;

        const rows = db.prepare(query).all(root, basePath, `${basePath}/%`);
        return res.json(rows);
      }

      case "random": {
        if (!folderPath) {
          return res.status(400).json({ error: "Missing path for random" });
        }
        // 🎲 Lấy ngẫu nhiên 30 folder có ảnh đại diện
        const rows = db
          .prepare(
            `
            SELECT name, path, thumbnail FROM folders
            WHERE root = ? AND (path = ? OR path LIKE ?) AND thumbnail IS NOT NULL
            ORDER BY RANDOM() LIMIT 30
          `
          )
          .all(root, folderPath, `${folderPath}/%`);

        return res.json(rows);
      }

      case "top": {
        if (!folderPath) {
          return res.status(400).json({ error: "Missing path for top" });
        }
        // 📈 Lấy danh sách top view từ bảng views (JOIN với folders)
        const rows = db
          .prepare(
            `
      SELECT f.name, f.path, f.thumbnail, v.count FROM views v
      JOIN folders f ON f.path = v.path AND f.root = ?
      WHERE f.path = ? OR f.path LIKE ?
      ORDER BY v.count DESC LIMIT 30
    `
          )
          .all(root, folderPath, `${folderPath}/%`);

        return res.json(rows);

      }

      case "path": {
        // 📂 Load folder trực tiếp từ ổ đĩa
        const { loadFolderFromDisk } = require("../utils/folder-loader");

        let realPath = folderPath;
        let isSelf = false;

        // ✅ Nếu là folder giả (__self__) thì trỏ ngược về folder cha
        if (folderPath.endsWith("/__self__")) {
          realPath = folderPath.replace(/\/__self__$/, "");
          isSelf = true;
        }

        // ✅ Load thư mục thật từ ổ đĩa
        const result = loadFolderFromDisk(root, realPath, limitNum, offsetNum);

        // ❌ Nếu là folder giả thì KHÔNG trả về folders con
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
        // 🔍 Tìm kiếm theo tên folder
        if (!q || typeof q !== "string") {
          return res.status(400).json({ error: "Missing query" });
        }

        const rows = db
          .prepare(
            `
            SELECT name, path, thumbnail FROM folders
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

module.exports = router;
