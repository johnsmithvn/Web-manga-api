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
 */
function scanFolderRecursive(
  root,
  currentPath = "",
  stats = { scanned: 0, inserted: 0, updated: 0, skipped: 0 }
) {
  const db = getDB(root);
  const rootPath = getRootPath(root);
  const fullPath = path.join(rootPath, currentPath);

  if (!hasImageRecursively(fullPath)) return stats;

  // ✅ Scan folder hiện tại
  stats.scanned++;
  const statsInfo = fs.statSync(fullPath);
  const lastModified = statsInfo.mtimeMs;
  const thumbnail = findFirstImageRecursively(fullPath, rootPath);

  const childEntries = fs.readdirSync(fullPath, { withFileTypes: true });

  const imageCount = childEntries.filter(
    (e) =>
      e.isFile() &&
      [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(
        path.extname(e.name).toLowerCase()
      )
  ).length;

  const chapterCount = childEntries.filter((e) => e.isDirectory()).length;

  const existing = db
    .prepare(`SELECT * FROM folders WHERE root = ? AND path = ?`)
    .get(root, currentPath);

  if (!existing) {
    db.prepare(
      `INSERT INTO folders (
        root, name, path, thumbnail,
        lastModified, imageCount, chapterCount, type, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      root,
      currentPath || "(root)",
      currentPath,
      thumbnail,
      lastModified,
      imageCount,
      chapterCount,
      currentPath === "" ? "root" : "folder",
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
      currentPath
    );
    stats.updated++;
  } else {
    stats.skipped++;
  }

  // ✅ Đệ quy vào folder con
  const skipNames = [".git", "node_modules", "__MACOSX", ".Trash", ".DS_Store"];
  for (const entry of childEntries) {
    if (!entry.isDirectory() || skipNames.includes(entry.name)) continue;

    const relativePath = path.posix.join(currentPath, entry.name);
    scanFolderRecursive(root, relativePath, stats);
  }

  return stats;

}

module.exports = { scanFolderRecursive };
