// 📁 backend/api/all-subfolders.js
const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { scanFolderRecursive } = require('../utils/cache-scan');

/**
 * 📦 API: Trả về 30 folder ngẫu nhiên có thumbnail trong toàn bộ cây thư mục root
 * - Nếu DB chưa có dữ liệu thì quét lại (lần đầu)
 * - Chỉ lấy folder đã có thumbnail
 * 🔗 GET /api/all-subfolders?root=1
 */
router.get('/all-subfolders', (req, res) => {
  const root = req.query.root;
  if (!root) return res.status(400).json({ error: 'Missing root parameter' });

  try {
    // ✅ Nếu chưa có dữ liệu ➜ quét toàn bộ folder con
    const count = db.prepare(`SELECT COUNT(*) as total FROM folders WHERE root = ?`).get(root).total;
    if (count === 0) {
      scanFolderRecursive(root); // Lưu vào DB
    }

    // ✅ Lấy ngẫu nhiên 30 folder có thumbnail
    const folders = db.prepare(`
      SELECT name, path, thumbnail FROM folders
      WHERE root = ? AND thumbnail IS NOT NULL
      ORDER BY RANDOM() LIMIT 30
    `).all(root);

    res.json(folders);
  } catch (err) {
    console.error('❌ Error in /all-subfolders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
