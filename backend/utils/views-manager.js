// /utils/views-manager.js

const fs = require('fs').promises;
const path = require('path');

const VIEWS_FILE = path.join(__dirname, '..', 'data', 'views.json');

/**
 * Đọc file views.json
 * @returns {Promise<Object>}
 */
async function getViews() {
  try {
    const data = await fs.readFile(VIEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {}; // Nếu file chưa tồn tại
  }
}

/**
 * Tăng lượt xem cho 1 folder
 * @param {string} folderPath - Ví dụ: '1/OnePiece' hoặc '2/Naruto'
 * @returns {Promise<void>}
 */
async function increaseView(folderPath) {
  const views = await getViews();
  const key = folderPath.replace(/\\/g, '/'); // chuẩn hóa đường dẫn

  if (views[key]) {
    views[key]++;
  } else {
    views[key] = 1;
  }

  await fs.writeFile(VIEWS_FILE, JSON.stringify(views, null, 2), 'utf-8');
}

module.exports = {
  getViews,
  increaseView
};
