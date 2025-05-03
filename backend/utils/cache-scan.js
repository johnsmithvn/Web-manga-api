// 📁 backend/utils/cache-scan.js
const fs = require("fs");
const path = require("path");
const db = require("./db");
const { getRootPath } = require("./config");
const {
  hasImageRecursively,
  findFirstImageRecursively,
} = require("./imageUtils");

/**
 * ✅ Đệ quy quét toàn bộ folder con trong root
 * 📌 Nếu folder có ảnh thì thêm vào DB (nếu chưa có)
 * 📌 Nếu lastModified mới hơn thì update thumbnail
 * @param {string} root - tên thư mục gốc (VD: "1", "OnePiece")
 * @param {string} currentPath - thư mục con bên trong root
 */
function scanFolderRecursive(root, currentPath = "") {
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
      const existing = db
        .prepare(`SELECT * FROM folders WHERE root = ? AND path = ?`)
        .get(root, relativePath);

      // ✅ Đọc toàn bộ entry trong folder để đếm ảnh + subfolder
      const childEntries = fs.readdirSync(fullChildPath, {
        withFileTypes: true,
      });

      const imageCount = childEntries.filter(
        (e) =>
          e.isFile() &&
          [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(
            path.extname(e.name).toLowerCase()
          )
      ).length;

      const chapterCount = childEntries.filter((e) => e.isDirectory()).length;

      if (!existing) {
        // 🆕 Insert mới
        db.prepare(
          `
    INSERT INTO folders (
      root, name, path, thumbnail,
      lastModified, imageCount, chapterCount, type, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
        ).run(
          root,
          entry.name,
          relativePath,
          thumbnail,
          lastModified,
          imageCount,
          chapterCount,
          "folder",
          Date.now()
        );
      } else if (existing.lastModified < lastModified) {
        // 🔁 Update nếu folder thay đổi
        db.prepare(
          `
    UPDATE folders
    SET thumbnail = ?, lastModified = ?, imageCount = ?, chapterCount = ?
    WHERE root = ? AND path = ?
  `
        ).run(
          thumbnail,
          lastModified,
          imageCount,
          chapterCount,
          root,
          relativePath
        );
      }
    }

    // 🔁 Đệ quy tiếp
    scanFolderRecursive(root, relativePath);
  }
}

module.exports = { scanFolderRecursive };
