// 📁 backend/api/top-view.js
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

/**
 * 📈 API: Lấy top 20 folder được xem nhiều nhất
 * Trả về kèm thumbnail (nối với bảng folders)
 * 🔗 GET /api/top-view?root=1
 */
router.get('/top-view', (req, res) => {
  const root = req.query.root;
  if (!root) return res.status(400).json({ error: 'Missing root parameter' });

  try {
    const results = db.prepare(`
      SELECT f.name, f.path, f.thumbnail, v.count FROM views v
      JOIN folders f ON f.path = v.path AND f.root = ?
      ORDER BY v.count DESC
      LIMIT 30
    `).all(root);

    res.json(results);
  } catch (err) {
    console.error('❌ Error in /top-view:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

