// 📁 backend/api/increase-view.js
const express = require("express");
const router = express.Router();

// ✅ Dynamic DB theo rootKey
const getDB = require("../utils/db");
// ✅ Lấy path thật của rootKey từ .env
const { getRootPath } = require("../utils/config");

/**
 * 📈 Ghi lượt xem cho folder (POST)
 * Body: { root: "FANTASY", path: "Naruto" }
 */
router.post("/increase-view", (req, res) => {
  let { path, root } = req.body;

  // ❌ Thiếu dữ liệu
  if (!path || typeof path !== "string" || !root || typeof root !== "string") {
    return res.status(400).json({ error: "Missing valid 'root' or 'path'" });
  }

  // ✅ Nếu path là dạng /__self__ thì bỏ phần đó đi
  if (path.endsWith("/__self__")) {
    path = path.replace(/\/__self__$/, "");
  }

  // ❌ Kiểm tra lại path sau normalize
  if (!path) {
    return res.status(400).json({ error: "Invalid folder path" });
  }

  // ❌ Kiểm tra rootKey có tồn tại trong .env không
  const rootPath = getRootPath(root);
  if (!rootPath) {
    return res.status(400).json({ error: "Invalid root key" });
  }

  try {
    const db = getDB(root); // ✅ DB riêng cho rootKey
    increaseView(db, path); // Gọi hàm tăng view
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi tăng lượt xem:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 📈 Tăng lượt xem cho folder (theo path)
 * - Nếu chưa có ➜ thêm mới
 * - Nếu đã có ➜ count++
 * @param {Database} db - SQLite instance
 * @param {string} folderPath - VD: "Naruto"
 */
function increaseView(db, folderPath) {
  try {
    const existing = db
      .prepare(`SELECT count FROM views WHERE path = ?`)
      .get(folderPath);

    if (!existing) {
      db.prepare(`INSERT INTO views (path, count) VALUES (?, 1)`).run(folderPath);
    } else {
      db.prepare(`UPDATE views SET count = count + 1 WHERE path = ?`).run(folderPath);
    }
  } catch (err) {
    console.error("❌ Error tăng lượt xem:", err);
  }
}

module.exports = router;
