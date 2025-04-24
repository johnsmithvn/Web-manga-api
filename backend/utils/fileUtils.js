// 📁 backend/utils/fileUtils.js
const path = require("path");
const fs = require("fs");

/**
 * 🔁 Đệ quy tìm ảnh đầu tiên trong folder hoặc subfolder (sử dụng cho thumbnail)
 * @param {string} dirPath - Đường dẫn thư mục cần tìm ảnh
 * @returns {string|null} - Đường dẫn ảnh đầu tiên nếu có, hoặc null
 */
function findFirstImage(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    if (item.isFile() && /\.(jpe?g|png|gif)$/i.test(item.name)) return fullPath;
    if (item.isDirectory()) {
      const found = findFirstImage(fullPath);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 📁 Lấy danh sách folder con và ảnh đại diện (thumbnail) cho từng folder
 * @param {string} baseDir - Thư mục gốc
 * @param {string} dirPath - Thư mục hiện tại đang duyệt
 * @returns {Array} - Danh sách folder con dạng object: name, path, thumbnail
 */
function getFolderData(baseDir, dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  let folders = [];

  for (const item of items) {
    if (item.isDirectory()) {
      const folderPath = path.join(dirPath, item.name);
      const thumbnail = findFirstImage(folderPath);
      folders.push({
        name: item.name,
        path: path.relative(baseDir, folderPath).replace(/\\/g, "/"),
        thumbnail: thumbnail ? `/manga/${path.relative(baseDir, thumbnail).replace(/\\/g, "/")}` : null,
      });
    }
  }
  return folders;
}

module.exports = {
  findFirstImage,
  getFolderData,
};
