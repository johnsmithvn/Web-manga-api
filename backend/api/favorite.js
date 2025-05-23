// 📁 backend/api/favorite.js
const express = require("express");
const router = express.Router();
const getDB = require("../utils/db");

/**
 * ⭐ Toggle trạng thái yêu thích cho folder
 * POST /api/favorite
 * Body: { dbkey, path, value: true/false }
 */
router.post("/favorite", (req, res) => {
  const { dbkey, path, value } = req.body;

  if (!dbkey || !path || typeof value !== "boolean") {
    return res.status(400).json({ error: "Thiếu hoặc sai dữ liệu" });
  }

  try {
    const db = getDB(dbkey);
    db.prepare(`UPDATE folders SET isFavorite = ? WHERE path = ?`).run(value ? 1 : 0, path);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi set favorite:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ⭐ Lấy danh sách folder yêu thích
 * GET /api/favorite?key=FANTASY&root=Naruto
 */
router.get("/favorite", (req, res) => {
  const { key, root } = req.query;

  if (!key || !root) {
    return res.status(400).json({ error: "Thiếu key hoặc root" });
  }

  try {
    const db = getDB(key);
    const list = db
      .prepare(`SELECT name, path, thumbnail FROM folders WHERE root = ? AND isFavorite = 1`)
      .all(root);
    res.json(list);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách yêu thích:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
