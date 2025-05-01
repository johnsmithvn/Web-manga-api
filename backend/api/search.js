//backend/api/search.js

const express = require("express");
const router = express.Router();
const db = require("../utils/db");

router.get("/search", (req, res) => {
  const root = req.query.root;
  const keyword = req.query.q;

  if (!root || !keyword) {
    return res.status(400).json({ error: "Missing root or query" });
  }

  try {
    const stmt = db.prepare(`
      SELECT name, path, thumbnail
      FROM folders
      WHERE root = ? AND name LIKE ?
      ORDER BY name ASC
      LIMIT 50
    `);

    const rows = stmt.all(root, `%${keyword}%`);
    res.json(rows);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
