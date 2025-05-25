// 📁 backend/api/movie-folder.js
const express = require("express");
const router = express.Router();
const { loadMovieFolderFromDisk } = require("../utils/folder-loader");
const { getRootPath } = require("../utils/config");

/**
 * API: Lấy folder + file video trong thư mục MOVIE
 * GET /api/movie-folder?key=V_MOVIE&path=...
 */
router.get("/movie-folder", (req, res) => {
  const { key, path = "" } = req.query;

  if (!key) return res.status(400).json({ error: "Missing key" });
  const rootPath = getRootPath(key);
  if (!rootPath) return res.status(400).json({ error: "Invalid key" });

  // root có thể truyền null/rỗng hoặc key (tùy env)
  const root = key;

  // Không cần limit/offset vì movie không phân trang folder
  const result = loadMovieFolderFromDisk(key, root, path);

  return res.json({
    type: "movie-folder",
    folders: result.folders, // có cả subfolder & file video
    total: result.total,
  });
});

module.exports = router;
