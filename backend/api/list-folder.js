// 📁 backend/api/list-folder.js

const fs = require("fs");
const path = require("path");
const { pathToUrl } = require("../utils/pathToUrl");
const { BASE_DIR } = require("../utils/config");
const { findFirstImageRecursively } = require("../utils/imageUtils");
const naturalCompare = require("string-natural-compare"); // 🆕 Import thư viện so sánh giống Windows Explorer

// ✨ Định dạng file ảnh hợp lệ
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/**
 * 📂 API: Lấy danh sách folder và ảnh trong 1 thư mục
 * @param {string} rootFolder - Folder gốc
 * @param {string} subPath - Folder con (nếu có)
 * @param {number} limit - số lượng folder/anh trả về (0 = không giới hạn)
 * @param {number} offset - bắt đầu từ folder/anh thứ mấy
 * @returns {object} - { type, folders, images, total }
 */
async function listFolder(rootFolder, subPath = "", limit = 0, offset = 0) {
  const basePath = path.join(BASE_DIR, rootFolder, subPath);

  if (!fs.existsSync(basePath)) {
    throw new Error("Folder not found");
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  // 🆕 Sort entries theo đúng thứ tự Windows Explorer
  entries.sort((a, b) => naturalCompare(a.name, b.name));

  let folders = []; // Danh sách folder con
  const images = []; // Danh sách đường dẫn ảnh

  // Đọc danh sách entry trong folder
  for (const entry of entries) {
    const fullPath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const firstImage = findFirstImageRecursively(fullPath, "/manga");
      if (firstImage) {
        folders.push({
          name: entry.name,
          path: path.posix.join(subPath, entry.name),
          thumbnail: firstImage,
        });
      }
    }

    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        images.push(pathToUrl(fullPath));
      }
    }
  }

  // 📊 Nếu vừa có ảnh và folder, tạo "folder giả" để làm thumbnail folder cha
  if (images.length > 0 && folders.length > 0) {
    const parts = subPath.split("/").filter(Boolean);
    const folderName = parts[parts.length - 1] || "Ảnh riêng";

    folders.unshift({
      name: folderName,
      path: path.posix.join(subPath, "__self__"),
      thumbnail: images[0],
      isSelfReader: true,
      images: limit > 0 ? images.slice(offset, offset + limit) : images,
      totalImages: images.length,
    });

    const total = folders.length;
    const slicedFolders =
      limit > 0 ? folders.slice(offset, offset + limit) : folders;

    return {
      type: "folder",
      folders: slicedFolders,
      images: [],
      total,
    };
  }

  // 📚 Nếu chỉ có ảnh, không có folder con
  if (images.length > 0 && folders.length === 0) {
    const totalImages = images.length;
    const slicedImages =
      limit > 0 ? images.slice(offset, offset + limit) : images;

    return {
      type: "reader",
      images: slicedImages,
      totalImages,
    };
  }

  // 📂 Nếu chỉ có folder con, không có ảnh
  const total = folders.length;
  const slicedFolders =
    limit > 0 ? folders.slice(offset, offset + limit) : folders;

  return {
    type: "folder",
    folders: slicedFolders,
    images: [],
    total,
  };
}

/**
 * 📂 API: Lấy tất cả folder để cache search/random
 * @param {string} rootFolder
 * @returns {Array<{name: string, path: string}>}
 */
async function listAllFolders(rootFolder) {
  const basePath = path.join(BASE_DIR, rootFolder);
  if (!fs.existsSync(basePath)) {
    throw new Error("Root folder not found");
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  const folders = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push({
        name: entry.name,
        path: entry.name,
      });
    }
  }

  return folders;
}

module.exports = {
  listFolder,
  listAllFolders,
};
