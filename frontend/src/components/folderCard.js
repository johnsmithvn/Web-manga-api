// 📁 folderCard.js – component dùng chung để hiển thị 1 thẻ folder

import { getSourceKey } from "/src/core/storage.js"; // ✅ gom về 1 dòng import
import {
  getFolderCacheKey,
  getFolderCache,
  setFolderCache,
  getRootFolder,
} from "/src/core/storage.js";

/**
 * Tạo 1 card HTML cho folder (sử dụng cho slider hoặc grid)
 * @param {Object} folder - Thông tin folder (path, name, thumbnail, count, images, isSelfReader, isFavorite)
 * @param {boolean} showViews - Có hiển thị lượt xem không
 * @returns HTMLElement - Thẻ <div class="folder-card">
 */
export function renderFolderCard(folder, showViews = false) {
  const card = document.createElement("div");
  card.className = "folder-card";

  // Ảnh thumbnail (nếu có)
  const imgTag = folder.thumbnail
    ? `<img src="${folder.thumbnail}" alt="${folder.name}" loading="lazy">`
    : `<div class="folder-thumb-placeholder">Không có ảnh</div>`;

  let displayName = folder.name;
  if (folder.name === "__self__") {
    const parts = folder.path.split("/");
    displayName = parts.at(-2) || "Ảnh";
  }
  // HTML bên trong card
  card.innerHTML = `
    <div class="folder-thumb">
      ${imgTag}
      ${
        showViews && folder.count
          ? `<div class="folder-views">👁 ${folder.count}</div>`
          : ""
      }
      <div class="folder-fav ${folder.isFavorite ? "active" : ""}" title="${
    folder.isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"
  }">${folder.isFavorite ? "❤️" : "🤍"}</div>
    </div>
    <div class="folder-title">${displayName}</div>
  `;

  // Xử lý click vào ảnh (tránh click vào nút yêu thích)
  card.onclick = (e) => {
    if (e.target.classList.contains("folder-fav")) return;

    if (folder.isSelfReader && folder.images) {
      const encoded = encodeURIComponent(folder.path);
      window.location.href = `/reader.html?path=${encoded}`;
    } else {
      window.loadFolder?.(folder.path);
    }
  };

  // Xử lý toggle yêu thích
  const favBtn = card.querySelector(".folder-fav");
  favBtn.onclick = async (e) => {
    e.stopPropagation();
    const sourceKey = getSourceKey();
    const rootFolder = getRootFolder(); // 👈 Thêm dòng này

    const newVal = !folder.isFavorite;
    folder.isFavorite = newVal;
    favBtn.classList.toggle("active", newVal);
    favBtn.textContent = newVal ? "❤️" : "🤍";
    favBtn.title = newVal ? "Bỏ yêu thích" : "Thêm yêu thích";

    try {
      await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbkey: sourceKey,
          path: folder.path,
          value: newVal,
        }),
      });

      // Cập nhật cache cho cả folder hiện tại và folder gốc
      updateFavoriteEverywhere(sourceKey, rootFolder, folder.path, newVal);
    } catch (err) {
      console.warn("❌ Không thể lưu yêu thích:", err);
    }
  };

  return card;
}

function updateFavoriteEverywhere(sourceKey, rootFolder, folderPath, newVal) {
  const prefix = `folderCache::${sourceKey}::${rootFolder}`;
  for (const key in localStorage) {
    if (key.startsWith(prefix)) {
      try {
        const raw = localStorage.getItem(key);
        const parsed = JSON.parse(raw);
        let changed = false;
        if (parsed.data && parsed.data.folders) {
          for (const f of parsed.data.folders) {
            if (f.path === folderPath) {
              f.isFavorite = newVal;
              changed = true;
            }
          }
        }
        // Nếu là self-reader
        if (
          parsed.data &&
          parsed.data.images &&
          folderPath.endsWith("/__self__")
        ) {
          if (parsed.data.isFavorite !== undefined) {
            parsed.data.isFavorite = newVal;
            changed = true;
          }
        }
        if (changed) {
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch (err) {
        console.warn("❌ Không thể update cache:", err);
      }
    }
  }

  // 🟢 Update recentViewed nếu có
  try {
    const recentKey = `recentViewed::${rootFolder}::${rootFolder}`;
    const raw = localStorage.getItem(recentKey);
    if (raw) {
      const list = JSON.parse(raw);
      let changed = false;
      for (const item of list) {
        if (item.path === folderPath) {
          item.isFavorite = newVal;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(recentKey, JSON.stringify(list));
      }
    }
  } catch (err) {
    console.warn("❌ Không thể update recentViewed:", err);
  }
}
