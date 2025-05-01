// 📁 backend/utils/views-manager.js (mới)
const db = require('./db');

/**
 * 📈 Tăng lượt xem cho folder (theo path, VD: "1/Naruto")
 * Nếu chưa có trong bảng `views` ➜ thêm mới
 * Nếu đã có ➜ tăng count lên 1
 * @param {string} folderPath - Đường path đầy đủ (VD: '1/Naruto')
 */
function increaseView(folderPath) {
  try {
    const existing = db.prepare(`SELECT count FROM views WHERE path = ?`).get(folderPath);

    if (!existing) {
      db.prepare(`INSERT INTO views (path, count) VALUES (?, 1)`).run(folderPath);
    } else {
      db.prepare(`UPDATE views SET count = count + 1 WHERE path = ?`).run(folderPath);
    }
  } catch (err) {
    console.error('❌ Error tăng lượt xem:', err);
  }
}

module.exports = { increaseView };