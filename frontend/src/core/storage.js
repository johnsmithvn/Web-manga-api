// 📁 frontend/src/storage.js

/**
 * 📂 Lấy folder hiện tại đang đọc (VD: Naruto)
 */
export function getRootFolder() {
  return localStorage.getItem("rootFolder");
}

/**
 * 🌍 Lấy source key hiện tại (VD: FANTASY, ANIME, ...)
 */
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
  const folder = getRootFolder();
  const source = getSourceKey();
  if (!folder || !source) {
    window.location.href = "/home.html";
  }
}

const FOLDER_CACHE_PREFIX = "folderCache::";
const FOLDERS_LIST_PREFIX = "allFoldersList::";
const CACHE_TIMEOUT = 24 * 60 * 60 * 1000; // 1 ngày

/**
 * 📦 Lấy cache folder theo path (dựa trên cả sourceKey)
 * @param {string} rootFolder - tên folder (VD: Naruto)
 * @param {string} path - đường dẫn hiện tại trong folder
 */
export function getFolderCache(rootFolder, path) {
  const sourceKey = getSourceKey();
  if (!sourceKey) return null;

  const key = `${FOLDER_CACHE_PREFIX}${sourceKey}::${rootFolder}:${path}`;
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
 * @param {string} rootFolder
 * @param {string} path
 * @param {object} data
 */
export function setFolderCache(rootFolder, path, data) {
  const sourceKey = getSourceKey();
  if (!sourceKey) return;

  const key = `${FOLDER_CACHE_PREFIX}${sourceKey}::${rootFolder}:${path}`;
  const jsonData = JSON.stringify({
    timestamp: Date.now(),
    data: data,
  });

  const maxTotalSize = 4 * 1024 * 1024;
  const currentTotalSize = getCurrentCacheSize();
  if (jsonData.length > maxTotalSize) {
    console.warn(`⚠️ Không cache folder (quá lớn): ${path}`);
    return;
  }

  if (currentTotalSize + jsonData.length > maxTotalSize) {
    let size = maxTotalSize - jsonData.length;
    if (size > maxTotalSize / 2) size = maxTotalSize / 2;
    cleanUpOldCache(size);
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
        localStorage.removeItem(key);
      }
    }
  }

  entries.sort((a, b) => a.timestamp - b.timestamp);

  let freed = 0;
  for (const entry of entries) {
    localStorage.removeItem(entry.key);
    freed += entry.size;
    if (freed >= minFreeBytes) break;
  }

  console.log(`🧹 Đã xoá ${freed} byte cache`);
}

/**
 * 🧹 Xoá toàn bộ cache folder
 */
export function clearAllFolderCache() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(FOLDER_CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

// /**
//  * 🆕 Lấy danh sách all folders list cache (nếu có)
//  */
// export function getAllFoldersList(rootFolder) {
//   const sourceKey = getSourceKey();
//   if (!sourceKey) return null;

//   const key = `${FOLDERS_LIST_PREFIX}${sourceKey}::${rootFolder}`;
//   const raw = localStorage.getItem(key);
//   if (!raw) return null;

//   try {
//     const parsed = JSON.parse(raw);
//     const now = Date.now();
//     if (now - parsed.timestamp > CACHE_TIMEOUT) {
//       localStorage.removeItem(key);
//       return null;
//     }
//     return parsed.data;
//   } catch {
//     localStorage.removeItem(key);
//     return null;
//   }
// }


/** ✅ Ghi lại folder vừa đọc vào localStorage */
export function saveRecentViewed(folder) {
  try {
    const root = getRootFolder();
    const sourceKey = getSourceKey(); // ✅ Thêm dòng này

    const key = `recentViewed::${root}`;
    //  sửa thành cái này nếu muốn đúng rootFolder và phải sửa trong index nữa
    // const key = `recentViewed::${sourceKey}::${root}`; // ✅ Gộp sourceKey

    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];

    // Bỏ item cũ nếu trùng path
    const filtered = list.filter((item) => item.path !== folder.path);

    // Thêm lên đầu
    filtered.unshift({
      name: folder.name,
      path: folder.path,
      thumbnail: folder.thumbnail,
    });

    // Giới hạn 10
    const limited = filtered.slice(0, 30);
    localStorage.setItem(key, JSON.stringify(limited));
  } catch (err) {
    console.warn("❌ Không thể lưu recentViewed:", err);
  }
}


