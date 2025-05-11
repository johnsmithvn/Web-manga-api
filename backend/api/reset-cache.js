// 📁 backend/api/reset-cache.js
const express = require("express");
const router = express.Router();

// ✅ DB theo rootKey (đọc từ .env)
const getDB = require("../utils/db");
// ✅ Hàm lấy path thật từ rootKey
const { getRootPath } = require("../utils/config");

// ✅ Hàm đệ quy scan folder và lưu vào DB
const { scanFolderRecursive } = require("../utils/cache-scan");

/**
 * 🔁 API reset cache DB (DELETE)
 * mode hỗ trợ:
 * - delete: xóa toàn bộ cache trong DB (không scan)
 * - reset: xóa toàn bộ cache + scan lại từ đầu
 * - scan : chỉ scan thêm, không xóa
 *
 * Query: /api/reset-cache?root=FANTASY&mode=reset
 */
router.delete("/reset-cache", (req, res) => {
  const root = req.query.root; // ví dụ: FANTASY
  const mode = req.query.mode;

  // ❌ Thiếu tham số
  if (!root || !mode) {
    return res.status(400).json({ error: "Thiếu root hoặc mode" });
  }

  // ❌ root không hợp lệ (không nằm trong .env)
  const rootPath = getRootPath(root);
  if (!rootPath) {
    return res.status(400).json({ error: "Root không hợp lệ trong .env" });
  }

  try {
    const db = getDB(root); // ✅ DB riêng cho rootKey

    // ✅ Bổ sung cột updatedAt nếu chưa có (hỗ trợ DB cũ)
    try {
      db.prepare(`ALTER TABLE folders ADD COLUMN updatedAt INTEGER`).run();
      console.log("➕ Thêm cột updatedAt vào bảng folders");
    } catch (e) {
      // ✅ Bỏ qua nếu lỗi là do đã có cột rồi
      if (!e.message.includes("duplicate column name")) throw e;
    }

    if (mode === "delete") {
      // 🗑️ Xoá toàn bộ folder cache của root hiện tại
      db.prepare("DELETE FROM folders WHERE root = ?").run(root);
      console.log(`🗑️ Đã xoá cache DB cho rootKey = ${root}`);
      return res.json({ success: true, message: "Đã xoá cache thành công" });
    }

    if (mode === "reset") {
      // 🔁 Reset = xoá toàn bộ + scan lại
      db.prepare("DELETE FROM folders WHERE root = ?").run(root);
      scanFolderRecursive(root);
      console.log(`🔁 Reset cache: Đã xoá và scan lại DB cho root = ${root}`);
      return res.json({ success: true, message: "Reset cache thành công" });
    }

    // ❌ Mode không hợp lệ
    return res.status(400).json({ error: "Sai mode (chỉ hỗ trợ delete, reset)" });
  } catch (err) {
    console.error("❌ Lỗi reset-cache:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
