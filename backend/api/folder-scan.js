// 📁 backend/api/folder-scan.js
const express = require("express");
const router = express.Router();
const { scanFolderRecursive } = require("../utils/cache-scan");

/**
 * 🚀 Quét toàn bộ thư mục và lưu vào DB
 * GET /api/folder-scan?root=1
 */
router.get("/folder-scan", (req, res) => {
  const root = req.query.root;
  if (!root) return res.status(400).json({ error: "Missing root" });

  try {
    scanFolderRecursive(root);
    console.log(`✅ Scan hoàn tất cho root: ${root}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Scan folder error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
