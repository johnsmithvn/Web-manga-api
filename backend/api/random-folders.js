// /api/random-folders.js

const fs = require('fs').promises;
const path = require('path');
const { getRootPath } = require('../utils/config');

/**
 * Random 10 thư mục con từ một ROOT chỉ định
 * @param {string} root - Folder chính (ví dụ '1', '2', '3')
 * @returns {Promise<Array>} - Danh sách 10 folder random
 */
async function randomFolders(root) {
  try {
    const baseRootPath = getRootPath(root); // E:/File/Manga/1
    const entries = await fs.readdir(baseRootPath, { withFileTypes: true });
    const folders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

    // Shuffle mảng folder
    for (let i = folders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [folders[i], folders[j]] = [folders[j], folders[i]];
    }

    return folders.slice(0, 10);
  } catch (err) {
    throw new Error('Không thể đọc thư mục root: ' + err.message);
  }
}

module.exports = randomFolders;
