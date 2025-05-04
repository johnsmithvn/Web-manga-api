// 📁 backend/api/reset-cache.js
const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { scanFolderRecursive } = require("../utils/cache-scan");

/**
 * 🔁 Xử lý theo mode:
 * - mode=delete ➜ Xoá DB
 * - mode=scan   ➜ Scan và thêm vào DB (không xóa)
 * - mode=reset  ➜ Xoá + Scan lại
 * Query: /api/reset-cache?root=1&mode=scan
 */
router.delete("/reset-cache", (req, res) => {
  const root = req.query.root;
  const mode = req.query.mode;

  if (!root || !mode) return res.status(400).json({ error: "Thiếu root hoặc mode" });

  try {
    if (mode === "delete") {
      db.prepare("DELETE FROM folders WHERE root = ?").run(root);
      console.log(`🗑️ Đã xoá toàn bộ folder cache của root: ${root}`);
      return res.json({ success: true, message: "Xoá DB thành công" });
    }

    if (mode === "scan") {
      scanFolderRecursive(root); // không xoá, chỉ insert thêm
      console.log(`📥 Scan và thêm mới folder cho root: ${root}`);
      return res.json({ success: true, message: "Scan DB thành công" });
    }

    if (mode === "reset") {
      db.prepare("DELETE FROM folders WHERE root = ?").run(root);
      scanFolderRecursive(root);
      console.log(`🔁 Reset cache: xoá + scan lại cho root: ${root}`);
      return res.json({ success: true, message: "Reset DB thành công" });
    }

    return res.status(400).json({ error: "Sai mode" });
  } catch (err) {
    console.error("❌ Lỗi reset-cache:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
