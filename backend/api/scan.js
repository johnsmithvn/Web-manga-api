const express = require("express");
const router = express.Router();

const { scanFolderRecursive } = require("../utils/cache-scan");
const { getRootPath } = require("../utils/config");

/**
 * 🚀 API quét folder mới (chỉ scan 1 thư mục con)
 * Body: { root: "FANTASY", path: "Naruto" }
 */
router.post("/", async (req, res) => {
  const { root, path = "" } = req.body; // 👈 path là thư mục con trong source

  if (!root) {
    return res.status(400).json({ error: "Missing root" });
  }

  const rootPath = getRootPath(root);
  if (!rootPath) {
    return res.status(400).json({ error: "Invalid root" });
  }

  try {
    // ✅ Chỉ scan riêng thư mục con truyền vào
    const stats = await scanFolderRecursive(root, path);
    console.log(`✅ Scan hoàn tất cho '${root}/${path}':`, stats);

    res.json({ success: true, stats });
  } catch (err) {
    console.error("❌ Lỗi khi scan:", err);
    res.status(500).json({ error: "Scan thất bại" });
  }
});

module.exports = router;
