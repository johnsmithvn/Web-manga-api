// 📁 frontend/src/storage.js

/**
 * 📂 Lấy rootFolder hiện tại từ localStorage
 * @returns {string|null}
 */
export function getRootFolder() {
  return localStorage.getItem("rootFolder");
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
    window.location.href = "/select.html";
  }
}

const FOLDER_CACHE_PREFIX = "folderCache::";
const FOLDERS_LIST_PREFIX = "allFoldersList::"; // 🆕 Thêm cache full list
const CACHE_TIMEOUT = 24 * 60 * 60 * 1000; // 1 ngày

/**
 * 📦 Lấy cache folder theo path
 */
export function getFolderCache(root, path) {
  const key = `${FOLDER_CACHE_PREFIX}${root}:${path}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const now = Date.now();
    if (now - parsed.timestamp > CACHE_TIMEOUT) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * 📦 Lưu cache folder
 */
// 📌 Giới hạn tối đa 100 folder cache
const MAX_CACHE_KEYS = 300;

export function setFolderCache(root, path, data) {
  const key = `${FOLDER_CACHE_PREFIX}${root}:${path}`;
  const jsonData = JSON.stringify({ timestamp: Date.now(), data });

  if (jsonData.length > 4000 * 1024) return;

  // 🧹 Nếu cache đã quá nhiều → xóa bớt key cũ
  const keys = Object.keys(localStorage).filter(k => k.startsWith(FOLDER_CACHE_PREFIX));
  if (keys.length >= MAX_CACHE_KEYS) {
    // Sắp xếp theo timestamp và xóa bớt key cũ nhất
    const sorted = keys.map(k => {
      try {
        const d = JSON.parse(localStorage.getItem(k));
        return { k, t: d.timestamp || 0 };
      } catch {
        return { k, t: 0 };
      }
    }).sort((a, b) => a.t - b.t); // tăng dần

    const toDelete = sorted.slice(0, keys.length - MAX_CACHE_KEYS + 1);
    toDelete.forEach(({ k }) => localStorage.removeItem(k));
  }

  localStorage.setItem(key, jsonData);
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

/**
 * 🆕 Lấy cache full folders list cho rootFolder
 */
export function getAllFoldersList(root) {
  const key = `${FOLDERS_LIST_PREFIX}${root}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const now = Date.now();
    if (now - parsed.timestamp > CACHE_TIMEOUT) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * 🆕 Lưu cache full folders list cho rootFolder
 */
// export function setAllFoldersList(root, list) {
//   const key = `${FOLDERS_LIST_PREFIX}${root}`;
//   localStorage.setItem(
//     key,
//     JSON.stringify({
//       timestamp: Date.now(),
//       data: list,
//     })
//   );
// }

/**
 * 🆕 Xóa cache full folders list theo root
 */
// export function clearAllFoldersList(root) {
//   const key = `${FOLDERS_LIST_PREFIX}${root}`;
//   localStorage.removeItem(key);
// }
