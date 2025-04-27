// 📁 backend/api/list-folder.js

const fs = require('fs');
const path = require('path');
const { pathToUrl } = require('../utils/pathToUrl');
const { BASE_DIR } = require('../utils/config');
const { findFirstImageRecursively } = require('../utils/imageUtils');

// Các định dạng file ảnh hợp lệ
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * 📂 API: Lấy danh sách folder và ảnh trong một thư mục
 * @param {string} rootFolder - Folder gốc
 * @param {string} subPath - Sub folder con
 * @param {number} limit - số lượng folder mỗi page (0 = lấy hết)
 * @param {number} offset - bắt đầu từ folder thứ mấy
 * @returns {object} - { type, folders, images }
 */
async function listFolder(rootFolder, subPath = '', limit = 0, offset = 0) {
  const basePath = path.join(BASE_DIR, rootFolder, subPath);
  if (!fs.existsSync(basePath)) {
    throw new Error('Folder not found');
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true });

  let folders = [];
  const images = [];

  for (const entry of entries) {
    const fullPath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const firstImage = findFirstImageRecursively(fullPath, '/manga');
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

  // 📋 Nếu có cả ảnh lẫn folder ➔ tạo "folder giả"
  if (images.length > 0 && folders.length > 0) {
    const parts = subPath.split('/').filter(Boolean);
    const folderName = parts[parts.length - 1] || "Ảnh riêng";

    folders.unshift({
      name: folderName,
      path: path.posix.join(subPath, '__self__'),
      thumbnail: images[0],
      isSelfReader: true,
      images: images,
    });
  }

  // 📥 Nếu có limit/offset thì slice
  const total = folders.length;
  const slicedFolders = limit > 0 ? folders.slice(offset, offset + limit) : folders;

  if (images.length > 0 && folders.length === 0) {
    // 📖 Chỉ có ảnh ➔ Reader mode
    return {
      type: 'reader',
      images,
    };
  }

  // 📂 Chỉ có folder ➔ Folder mode
  return {
    type: 'folder',
    folders: slicedFolders,
    images: [],
    total,
  };
}

/**
 * 📂 API: Lấy tất cả folder {name, path} của 1 root để cache toàn bộ
 * @param {string} rootFolder 
 * @returns {Array<{name: string, path: string}>}
 */
async function listAllFolders(rootFolder) {
  const basePath = path.join(BASE_DIR, rootFolder);
  if (!fs.existsSync(basePath)) {
    throw new Error('Root folder not found');
  }

  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  const folders = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders.push({
        name: entry.name,
        path: entry.name, // root trực tiếp
      });
    }
  }

  return folders;
}

module.exports = {
  listFolder,
  listAllFolders, // 🆕 Export thêm hàm mới
};
