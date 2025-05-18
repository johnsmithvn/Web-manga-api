// 📁 backend/api/scan.js
const express = require("express");
const router = express.Router();
const { scanFolderRecursive } = require("../utils/cache-scan");

/**
 * 🚀 API mới: Quét toàn bộ thư mục gốc (không xoá DB)
 * POST /api/scan
 * Body: { root: "1" }
 */
router.post("/", async (req, res) => {
  const { root,key } = req.body;
  const dbkey =key;
  if (!root||!dbkey) return res.status(400).json({ error: "Missing root or db" });

  try {
    const stats = await scanFolderRecursive(dbkey,root);
    console.log(`\u2705 Scan hoàn tất cho root '${root}':`, stats);
    res.json({ success: true, stats });
  } catch (err) {
    console.error("\u274C Lỗi khi scan:", err);
    res.status(500).json({ error: "Scan thất bại" });
  }
});

module.exports = router;
