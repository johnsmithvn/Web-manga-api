const fs = require("fs");
const path = require("path");
const { getRootPath } = require("./config");
const naturalCompare = require("string-natural-compare");
const {
  findFirstImageRecursively,
} = require("./imageUtils");

/**
 * 🔁 Tìm toàn bộ ảnh trong folder và subfolder
 */
// function findAllImagesRecursively(dirPath, rootPath) {
//   if (!fs.existsSync(dirPath)) return [];

//   const entries = fs.readdirSync(dirPath, { withFileTypes: true });
//   const images = [];

//   for (const entry of entries) {
//     const fullPath = path.join(dirPath, entry.name);

//     if (entry.isFile()) {
//       const ext = path.extname(entry.name).toLowerCase();
//       if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext)) {
//         const rel = path.relative(rootPath, fullPath).replace(/\\/g, "/");
//         images.push(`/manga/${rel}`);
//       }
//     }

//     if (entry.isDirectory()) {
//       images.push(...findAllImagesRecursively(fullPath, rootPath));
//     }
//   }

//   return images;
// }

/**
 * 📂 Đọc folder thật từ ổ đĩa
 * Trả về danh sách subfolder và ảnh trong thư mục gốc
 */
function loadFolderFromDisk(root, folderPath = "", limit = 0, offset = 0) {
  const rootPath = getRootPath(root);
  const basePath = path.join(rootPath, folderPath);

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
      const thumb = findFirstImageRecursively(fullPath, rootPath);
      if (!thumb) continue;

      folders.push({
        name: entry.name,
        path: path.posix.join(folderPath, entry.name),
        thumbnail: thumb || null,
      });
    }

    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext)) {
        const rel = path.relative(rootPath, fullPath).replace(/\\/g, "/");
        images.push(`/manga/${rel}`);
      }
    }
  }

  // // ✅ Nếu không có ảnh trực tiếp → tìm ảnh sâu
  // if (images.length === 0) {
  //   const deepImages = findAllImagesRecursively(basePath, rootPath);
  //   images.push(...deepImages);
  // }

  return {
    folders,
    images: limit > 0 ? images.slice(offset, offset + limit) : images,
    total: folders.length,
    totalImages: images.length,
  };
}

module.exports = {
  loadFolderFromDisk,
};
