// 📁 backend/utils/imageUtils.js

const fs = require('fs');
const path = require('path');
const { BASE_DIR } = require('./config');

// Các định dạng file ảnh hợp lệ
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * 📂 Đệ quy tìm ảnh đầu tiên trong folder hoặc subfolder
 * @param {string} dirPath - Đường dẫn tuyệt đối cần tìm
 * @param {string} baseUrl - URL gốc để convert (ví dụ "/manga")
 * @returns {string|null} - URL public tới ảnh hoặc null nếu không có
 */
function findFirstImageRecursively(dirPath, baseUrl = '/manga') {
  if (!fs.existsSync(dirPath)) return null;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        return convertToUrl(fullPath, baseUrl);
      }
    }

    if (entry.isDirectory()) {
      const found = findFirstImageRecursively(fullPath, baseUrl);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 📸 Kiểm tra folder có chứa ít nhất 1 ảnh hợp lệ không
 * @param {string} dirPath - Đường dẫn tuyệt đối
 * @returns {boolean}
 */
function hasImageRecursively(dirPath) {
  if (!fs.existsSync(dirPath)) return false;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        return true;
      }
    }

    if (entry.isDirectory()) {
      if (hasImageRecursively(fullPath)) return true;
    }
  }

  return false;
}

/**
 * 🔗 Chuyển đường dẫn vật lý sang URL public
 * @param {string} filePath
 * @param {string} baseUrl - Ví dụ "/manga"
 * @returns {string}
 */
function convertToUrl(filePath, baseUrl = '/manga') {
  const relativePath = path.relative(BASE_DIR, filePath).replace(/\\/g, '/');
  return `${baseUrl}/${relativePath}`;
}

module.exports = {
  findFirstImageRecursively,
  hasImageRecursively,
};
