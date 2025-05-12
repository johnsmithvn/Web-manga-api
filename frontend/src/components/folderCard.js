// 📁 folderCard.js – component dùng chung để hiển thị 1 thẻ folder
import { getSourceKey } from "../core/storage.js";

/**
 * Tạo 1 card HTML cho folder (sử dụng cho slider hoặc grid)
 * @param {Object} folder - Thông tin folder (path, name, thumbnail, count, images, isSelfReader)
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
      </div>
      <div class="folder-title">${displayName}</div>
    `;

  // Xử lý click để vào trang đọc hoặc load folder
  card.onclick = () => {
    const sourceKey = getSourceKey(); // 📌 Quan trọng để giữ đúng root
    const fullPath = folder.path; // path đã là tương đối từ root

    if (folder.isSelfReader && folder.images) {
      const encoded = encodeURIComponent(fullPath);
      window.location.href = `/reader.html?path=${encoded}`;
    } else {
      window.loadFolder(fullPath);
    }
  };

  return card;
}
