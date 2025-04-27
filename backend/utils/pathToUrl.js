// 📁 backend/utils/pathToUrl.js

const path = require('path');
const { BASE_DIR } = require('./config');

/**
 * 🔗 Convert đường dẫn file vật lý (E:\File\Manga\...) sang URL public (/manga/...)
 * @param {string} filePath - Đường dẫn tuyệt đối
 * @returns {string} - URL client có thể load (đã encode an toàn)
 */
function pathToUrl(filePath) {
  const relativePath = path.relative(BASE_DIR, filePath).split(path.sep);
  // ✅ encodeURIComponent từng phần để đảm bảo URL chuẩn
  const encodedParts = relativePath.map(encodeURIComponent);
  return `/manga/${encodedParts.join('/')}`;
}

module.exports = { pathToUrl };
