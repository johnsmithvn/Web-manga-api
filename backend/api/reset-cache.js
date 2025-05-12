const express = require("express");
const router = express.Router();
const getDB = require("../utils/db");
const { getRootPath } = require("../utils/config");
const { scanFolderRecursive } = require("../utils/cache-scan");

/**
 * 🔁 API reset cache DB (DELETE)
 * mode hỗ trợ:
 * - delete: xóa cache của rootFolder hiện tại
 * - reset: xóa cache + scan lại rootFolder
 * - scan : chỉ scan thêm
 *
 * Query: /api/reset-cache?root=FANTASY&folder=Naruto&mode=reset
 */
router.delete("/reset-cache", (req, res) => {
  const root = req.query.root; // ví dụ: FANTASY
  const rootFolder = req.query.folder; // ví dụ: Naruto
  const mode = req.query.mode;

  if (!root || !mode || !rootFolder) {
    return res.status(400).json({ error: "Thiếu root, folder hoặc mode" });
  }

  const rootPath = getRootPath(root);
  if (!rootPath) {
    return res.status(400).json({ error: "Root không hợp lệ trong .env" });
  }

  try {
    const db = getDB(root);

    // ✅ Thêm cột updatedAt nếu chưa có
    try {
      db.prepare(`ALTER TABLE folders ADD COLUMN updatedAt INTEGER`).run();
      console.log("➕ Thêm cột updatedAt vào bảng folders");
    } catch (e) {
      if (!e.message.includes("duplicate column name")) throw e;
    }
  
    if (mode === "delete") {
      db.prepare("DELETE FROM folders WHERE root = ? AND rootFolder = ?").run(
        root,
        rootFolder
      );
      console.log(`🗑️ Đã xoá cache DB cho ${root} / ${rootFolder}`);
      return res.json({ success: true, message: "Đã xoá cache thành công" });
    }

    if (mode === "reset") {
      db.prepare("DELETE FROM folders WHERE root = ? AND rootFolder = ?").run(
        root,
        rootFolder
      );
      const pathToScan = rootFolder;
      const stats = scanFolderRecursive(root, pathToScan);
      console.log(`🔁 Reset cache cho ${root} / ${rootFolder}:`, stats);
      return res.json({
        success: true,
        stats,
        message: "Reset cache thành công",
      });
    }

    return res
      .status(400)
      .json({ error: "Sai mode (chỉ hỗ trợ delete, reset)" });
  } catch (err) {
    console.error("❌ Lỗi reset-cache:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/**
 * 🧨 API xoá toàn bộ DB (dành cho admin hoặc dọn sạch)
 * Xoá tất cả dữ liệu trong bảng folders (mọi root, rootFolder)
 * Endpoint: DELETE /api/reset-cache/all
 */
router.delete("/reset-cache/all", (req, res) => {
  const root = req.query.root;

  try {
    const db = getDB(root); // ✅ FIX: lấy kết nối
    db.prepare("DELETE FROM folders WHERE root = ?").run(root);
    console.log(`🗑️ Đã xoá cache DB cho rootKey = ${root}`);
    res.json({ success: true, message: "Đã xoá toàn bộ cache database" });
  } catch (err) {
    console.error("❌ Lỗi xoá toàn bộ DB:", err);
    res.status(500).json({ error: "Không thể xoá toàn bộ DB" });
  }
});


module.exports = router;
