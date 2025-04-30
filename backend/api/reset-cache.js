const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { scanFolderRecursive } = require("../utils/cache-scan");

router.delete("/reset-cache", (req, res) => {
  const root = req.query.root;
  if (!root) return res.status(400).json({ error: "Thiếu root" });

  try {
    db.prepare("DELETE FROM folders WHERE root = ?").run(root);
    scanFolderRecursive(root);
    console.log(`🔥 Reset cache cho root: ${root}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi reset cache:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
