// 📁 backend/utils/fileUtils.js
const path = require('path');
const fs = require('fs');

function findFirstImage(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    if (item.isFile() && /\.(jpe?g|png|gif)$/i.test(item.name)) return fullPath;
    if (item.isDirectory()) {
      const found = findFirstImage(fullPath);
      if (found) return found;
    }
  }
  return null;
}

function getFolderData(baseDir, dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  let folders = [];

  for (const item of items) {
    if (item.isDirectory()) {
      const folderPath = path.join(dirPath, item.name);
      const thumbnail = findFirstImage(folderPath);
      folders.push({
        name: item.name,
        path: path.relative(baseDir, folderPath).replace(/\\/g, '/'),
        thumbnail: thumbnail ? `/manga/${path.relative(baseDir, thumbnail).replace(/\\/g, '/')}` : null,
      });
    }
  }
  return folders;
}

module.exports = {
  findFirstImage,
  getFolderData,
};