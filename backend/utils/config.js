const path = require('path');

// Thư mục gốc Manga
const BASE_DIR = 'E:/File/Manga';

module.exports = {
  BASE_DIR,
  getRootPath: (root) => path.join(BASE_DIR, root), // Helper mới
};
