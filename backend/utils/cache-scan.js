// 📁 backend/utils/cache-scan.js
const fs = require("fs");
const path = require("path");
const getDB = require("./db");
const { getRootPath } = require("./config");
const {
  hasImageRecursively,
  findFirstImageRecursively,
} = require("./imageUtils");
  /**
   * ✅ Đệ quy quét toàn bộ folder con trong root
   * 📌 Nếu folder có ảnh thì thêm vào DB (nếu chưa có)
   * 📌 Nếu lastModified mới hơn thì update thumbnail
   * 📌 Trả về stats: inserted / updated / skipped / scanned
   * @param {string} rootFolder - tên của folder root
   * @param {string} dbkey - tên của folder cha => rootKey là db name
   * @param {string} currentPath - thư mục con bên trong root
   * @param {object} stats - thống kê kết quả
   */
  function scanFolderRecursive(
    dbkey,
    root,
    currentPath = "",
    stats = { scanned: 0, inserted: 0, updated: 0, skipped: 0 }
  ) {
    const db = getDB(dbkey); // Lấy DB từ dbkey => xác định db

    // const fullPath = path.join(getRootPath(dbkey), currentPath);
    const rootPath = path.join(getRootPath(dbkey), root); // Lấy đường dẫn root từ config
    const fullPath = path.join(rootPath, currentPath);
    // ⚠️ Bỏ qua nếu cả folder và subfolder đều không có ảnh
    if (!hasImageRecursively(fullPath)) return stats;

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    const skipNames = [
      ".git",
      "node_modules",
      "__MACOSX",
      ".Trash",
      ".DS_Store",
    ];

    for (const entry of entries) {
      if (!entry.isDirectory() || skipNames.includes(entry.name)) continue;

      const relativePath = path.posix.join(currentPath, entry.name);
      const fullChildPath = path.join(fullPath, entry.name);

      if (hasImageRecursively(fullChildPath)) {
        stats.scanned++;
        const statsInfo = fs.statSync(fullChildPath);
        const lastModified = statsInfo.mtimeMs;
        const thumbnail = findFirstImageRecursively(rootPath,fullChildPath);

        const existing = db
          .prepare(`SELECT * FROM folders WHERE root = ? AND path = ?`)
          .get(root, relativePath);

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
          db.prepare(
            `INSERT INTO folders (
            root, name, path, thumbnail,
            lastModified, imageCount, chapterCount, type, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            root,
            entry.name,
            relativePath,
            thumbnail,
            lastModified,
            imageCount,
            chapterCount,
            "folder",
            Date.now(),
            Date.now()
          );
          stats.inserted++;
        } else if (existing.lastModified < lastModified) {
          db.prepare(
            `UPDATE folders
           SET thumbnail = ?, lastModified = ?, imageCount = ?, chapterCount = ?, updatedAt = ?
           WHERE root = ? AND path = ?`
          ).run(
            thumbnail,
            lastModified,
            imageCount,
            chapterCount,
            Date.now(),
            root,
            relativePath
          );
          stats.updated++;
        } else {
          stats.skipped++;
        }
      }

      // 🔁 Đệ quy tiếp
      scanFolderRecursive(dbkey,root, relativePath, stats);
    }

    return stats;
  };

module.exports = { scanFolderRecursive };
