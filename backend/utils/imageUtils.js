// 📁 backend/utils/imageUtils.js
const fs = require("fs");
const path = require("path");

/**
 * 🔁 Đệ quy tìm ảnh đầu tiên trong folder (hoặc folder con) để làm thumbnail
 * @param {string} dirPath - Đường dẫn thư mục cần tìm
 * @param {string} baseUrl - Đường dẫn tương đối tính từ thư mục gốc
 * @returns {string|null} - Đường dẫn ảnh đầu tiên hoặc null nếu không có ảnh
 */
function findFirstImageRecursively(dirPath, baseUrl) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    const entryUrl = path.join(baseUrl, entry.name).replace(/\\/g, "/");

    if (entry.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(entry.name)) {
      return `/manga/${entryUrl}`;
    }

    if (entry.isDirectory()) {
      const found = findFirstImageRecursively(entryPath, entryUrl);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 🔁 Đệ quy kiểm tra folder có ảnh hay không
 * @param {string} dirPath - Đường dẫn thư mục
 * @returns {boolean} - true nếu có ảnh, false nếu không
 */
function hasImageRecursively(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(entry.name)) return true;
    if (entry.isDirectory() && hasImageRecursively(entryPath)) return true;
  }
  return false;
}

module.exports = {
  findFirstImageRecursively,
  hasImageRecursively,
};
