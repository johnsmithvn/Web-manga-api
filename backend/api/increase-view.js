const express = require("express");
const router = express.Router();
// ✅ Dynamic DB theo rootKey
const getDB = require("../utils/db");
// ✅ Lấy path thật của rootKey từ .env
const { getRootPath } = require("../utils/config");
/**
 * 📈 Ghi lượt xem cho folder (POST)
 * Body: { path: "1/Naruto" }
 */
router.post("/increase-view", (req, res) => {
  let { path, dbkey } = req.body;
  // ❌ Thiếu dữ liệu
  if (!path || typeof path !== "string" || !dbkey) {
    return res.status(400).json({ error: "Missing valid 'root' or 'path'" });
  }
  // ❌ Kiểm tra rootKey có tồn tại trong .env không
  const rootPath = getRootPath(dbkey);
  if (!rootPath) {
    return res.status(400).json({ error: "Invalid dbkey key" });
  }

  // ✅ Normalize nếu là folder giả
  if (path.endsWith("/__self__")) {
    path = path.replace(/\/__self__$/, "");
  }

  if (!path || typeof path !== "string") {
    return res.status(400).json({ error: "Missing valid 'path'" });
  }

  try {
    const db = getDB(dbkey);
    increaseView(db, path);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi tăng lượt xem:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
/**
 * 📈 Tăng lượt xem cho folder (theo path, VD: "1/Naruto")
 * Nếu chưa có trong bảng `views` ➜ thêm mới
 * Nếu đã có ➜ tăng count lên 1
 * @param {string} folderPath - Đường path đầy đủ (VD: '1/Naruto')
 * @param {Database} db - SQLite instance
 */

function increaseView(db, folderPath) {
  try {
    const existing = db
      .prepare(`SELECT count FROM views WHERE path = ?`)
      .get(folderPath);

    if (!existing) {
      db.prepare(`INSERT INTO views (path, count) VALUES (?, 1)`).run(
        folderPath
      );
    } else {
      db.prepare(`UPDATE views SET count = count + 1 WHERE path = ?`).run(
        folderPath
      );
    }
  } catch (err) {
    console.error("❌ Error tăng lượt xem:", err);
  }
}

module.exports = router;
