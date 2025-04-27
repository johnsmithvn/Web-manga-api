// /api/top-folders.js

const viewsManager = require('../utils/views-manager');

/**
 * Lấy 20 folder có lượt xem cao nhất theo ROOT
 * @param {string} root - Folder chính (ví dụ '1', '2', '3')
 * @returns {Promise<Array>} - Danh sách top folders
 */
async function topFolders(root) {
  const views = await viewsManager.getViews();

  const filteredViews = Object.entries(views)
    .filter(([folderPath]) => folderPath.startsWith(root + '/')) // chỉ lấy folder thuộc root
    .sort((a, b) => b[1] - a[1]) // sắp xếp lượt xem giảm dần
    .slice(0, 20)
    .map(([folder, count]) => ({ folder, count }));

  return filteredViews;
}

module.exports = topFolders;
