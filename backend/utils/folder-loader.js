// 📁 backend/utils/folder-loader.js
const fs = require("fs");
const path = require("path");
const { getRootPath } = require("./config");
const naturalCompare = require("string-natural-compare");
const { findFirstImageRecursively } = require("./imageUtils");

/**
 * 📂 Đọc folder thật từ ổ đĩa
 * Trả về danh sách subfolder và ảnh trong thư mục gốc
 * Dùng cho API mode=path
 *
 * @param {string} root - tên thư mục gốc (VD: "1")
 * @param {string} folderPath - đường dẫn bên trong root (VD: "OnePiece")
 * @param {number} limit - số lượng ảnh cần lấy (0 = all)
 * @param {number} offset - bắt đầu từ ảnh thứ mấy
 * @returns {{ folders: Array, images: Array, total: number, totalImages: number }}
 */
// 🧠 RAM cache folder: key = `${root}:${folderPath}`
// value = { data: {folders, images...}, mtime, expiresAt }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút
const MAX_CACHE_SIZE = 10000;
global.folderCache = global.folderCache || new Map();

function loadFolderFromDisk(root, folderPath = "", limit = 0, offset = 0) {
  const cacheKey = `${root}:${folderPath}`;
  const basePath = path.join(getRootPath(root), folderPath);

  try {
    const stat = fs.statSync(basePath);

    // ✅ Nếu đã có cache và vẫn còn hạn và không bị đổi folder
    if (global.folderCache.has(cacheKey)) {
      const cached = global.folderCache.get(cacheKey);
      if (Date.now() < cached.expiresAt && cached.mtime === stat.mtimeMs) {
        return cached.data;
      } else {
        global.folderCache.delete(cacheKey); // ❌ Mất hạn hoặc folder đổi
      }
    }

    if (!fs.existsSync(basePath)) {
      return { folders: [], images: [], total: 0, totalImages: 0 };
    }

    const entries = fs.readdirSync(basePath, { withFileTypes: true });
    entries.sort((a, b) => naturalCompare(a.name, b.name));

    const folders = [];
    const images = [];

    for (const entry of entries) {
      const fullPath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        const thumb = findFirstImageRecursively(fullPath); // ✅ Dùng đúng biến đã có
        if (!thumb) continue; // 🔥 Bỏ qua folder không có ảnh

        folders.push({
          name: entry.name,
          path: path.posix.join(folderPath, entry.name),
          thumbnail: thumb || null,
        });
      }

      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext)) {
          const rel = path
            .relative(getRootPath(""), fullPath)
            .replace(/\\/g, "/");
          images.push(`/manga/${rel}`);
        }
      }
    }

    const result = {
      folders,
      images: limit > 0 ? images.slice(offset, offset + limit) : images,
      total: folders.length,
      totalImages: images.length,
    };

    // 🧠 Set cache và giữ RAM dưới giới hạn
    if (global.folderCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = global.folderCache.keys().next().value;
      global.folderCache.delete(oldestKey);
    }
    global.folderCache.set(cacheKey, {
      data: result,
      mtime: stat.mtimeMs,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return result;
  } catch (e) {
    console.error("[CacheError]", e);
    return { folders: [], images: [], total: 0, totalImages: 0 };
  }
}

module.exports = {
  loadFolderFromDisk,
};


// Thêm RAM cache Map() với:
// TTL 5 phút (CACHE_TTL_MS)

// Tự invalidate khi folder thay đổi (mtime)

// Giới hạn tối đa 10.000 folder → không phình RAM

// ✅ Mỗi lần load folder:

// Check có cache chưa

// So sánh mtime thư mục

// Nếu khớp và chưa hết hạn → trả từ RAM

// Nếu không → đọc HDD rồi lưu lại cache