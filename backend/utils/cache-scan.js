// 📁 backend/utils/cache-scan.js
const fs = require('fs');
const path = require('path');
const db = require('./db');
const { getRootPath } = require('./config');
const { hasImageRecursively, findFirstImageRecursively } = require('./imageUtils');

/**
 * ✅ Đệ quy quét toàn bộ folder con trong root
 * 📌 Nếu folder có ảnh thì thêm vào DB (nếu chưa có)
 * 📌 Nếu lastModified mới hơn thì update thumbnail
 * @param {string} root - tên thư mục gốc (VD: "1", "OnePiece")
 * @param {string} currentPath - thư mục con bên trong root
 */
function scanFolderRecursive(root, currentPath = '') {
  const fullPath = path.join(getRootPath(root), currentPath);
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const relativePath = path.posix.join(currentPath, entry.name);
    const fullChildPath = path.join(fullPath, entry.name);

    // ✅ Kiểm tra folder có ảnh không
    if (hasImageRecursively(fullChildPath)) {
      const stats = fs.statSync(fullChildPath);
      const lastModified = stats.mtimeMs;
      const thumbnail = findFirstImageRecursively(fullChildPath);

      // ✅ Tìm xem đã có trong DB chưa
      const existing = db.prepare(`SELECT * FROM folders WHERE root = ? AND path = ?`).get(root, relativePath);

      if (!existing) {
        // 🆕 Thêm mới
        db.prepare(`INSERT INTO folders (root, name, path, thumbnail, lastModified) VALUES (?, ?, ?, ?, ?)`)
          .run(root, entry.name, relativePath, thumbnail, lastModified);
      } else if (existing.lastModified < lastModified) {
        // 🔁 Cập nhật thumbnail nếu folder bị đổi nội dung
        db.prepare(`UPDATE folders SET thumbnail = ?, lastModified = ? WHERE root = ? AND path = ?`)
          .run(thumbnail, lastModified, root, relativePath);
      }
    }

    // 🔁 Đệ quy tiếp
    scanFolderRecursive(root, relativePath);
  }
}

module.exports = { scanFolderRecursive };