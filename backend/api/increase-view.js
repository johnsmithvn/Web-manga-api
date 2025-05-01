const express = require('express');
const router = express.Router();
const { increaseView } = require('../utils/views-manager');

/**
 * 📈 Ghi lượt xem cho folder (POST)
 * Body: { path: "1/Naruto" }
 */
router.post('/increase-view', (req, res) => {
  const { path } = req.body;

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: "Missing valid 'path'" });
  }

  try {
    increaseView(path);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi tăng lượt xem:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
