// 📁 frontend/src/storage.js
const FOLDER_CACHE_PREFIX = "folderCache::";

/**
 * 📂 Lấy rootFolder hiện tại từ localStorage
 * @returns {string|null}
 */
export function getRootFolder() {
  return localStorage.getItem("rootFolder");
}

export function getSourceKey() {
  return localStorage.getItem("sourceKey");
}

/**
 * 🔄 Đổi rootFolder (xoá folder đã chọn và chuyển về select.html)
 */
export function changeRootFolder() {
  localStorage.removeItem("rootFolder");
  window.location.href = "/select.html";
}

/**
 * 📂 Bắt buộc kiểm tra rootFolder, nếu chưa chọn thì redirect
 */
export function requireRootFolder() {
  const root = getRootFolder();

  if (!root) {
    alert("⚠️ Chưa chọn thư mục gốc, vui lòng chọn lại!");
    window.location.href = "/select.html";
  }
}
export function requireSourceKey() {
  const source = getSourceKey();
  if (!source) {
    alert("⚠️ Chưa chọn nguồn dữ liệu, vui lòng chọn lại!");
    window.location.href = "/home.html";
  }
}

/**
 * 📦 Lấy cache folder theo path
 */
export function getFolderCache(sourceKey, rootFolder, path) {


  const key = `${FOLDER_CACHE_PREFIX}${sourceKey}::${rootFolder}:${path}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * 📦 Lưu cache folder
 */
export function setFolderCache(sourceKey, rootFolder, path, data) {
  const key = `${FOLDER_CACHE_PREFIX}${sourceKey}::${rootFolder}:${path}`;
  const jsonData = JSON.stringify({
    timestamp: Date.now(),
    data: data,
  });

  const maxTotalSize = 4 * 1024 * 1024 + 300; // ✅ Giới hạn tổng 8MB
  const currentTotalSize = getCurrentCacheSize();
  // 🆕 Nếu dữ liệu quá lớn (trên 4MB) thì không lưu cache
  if (jsonData.length > maxTotalSize) {
    console.warn(`⚠️ Folder quá lớn, không cache localStorage: ${path}`);
    return;
  }

  // Nếu vượt quá tổng → xoá cache cũ cho đến khi đủ chỗ
  if (currentTotalSize + jsonData.length > maxTotalSize) {
    size = maxTotalSize - jsonData.length;
    if (size > maxTotalSize / 2) {
      size = maxTotalSize / 2; // Giới hạn tối đa 50% dung lượng
    }
    cleanUpOldCache(size); // giữ lại đủ chỗ
  }

  localStorage.setItem(key, jsonData);
}
function getCurrentCacheSize() {
  let total = 0;
  for (const key in localStorage) {
    if (key.startsWith(FOLDER_CACHE_PREFIX)) {
      const item = localStorage.getItem(key);
      total += item?.length || 0;
    }
  }
  return total;
}

/**
 * 🧹 Xoá cache cũ theo timestamp cho đến khi trống >= minFreeBytes
 */
function cleanUpOldCache(minFreeBytes) {
  const entries = [];

  for (const key in localStorage) {
    if (key.startsWith(FOLDER_CACHE_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        const parsed = JSON.parse(raw);
        entries.push({
          key,
          size: raw.length,
          timestamp: parsed.timestamp || 0,
        });
      } catch {
        localStorage.removeItem(key); // corrupted
      }
    }
  }

  // Sắp xếp theo timestamp tăng dần (cũ nhất trước)
  entries.sort((a, b) => a.timestamp - b.timestamp);

  let freed = 0;
  for (const entry of entries) {
    localStorage.removeItem(entry.key);
    freed += entry.size;
    if (freed >= minFreeBytes) break;
  }

  console.log(`🧹 Dọn cache: đã xoá ${freed} byte`);
}
/**
 * 🧹 Xoá toàn bộ folder cache (theo dạng folderCache::)
 */
export function clearAllFolderCache() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(FOLDER_CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
