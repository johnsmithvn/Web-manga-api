// 📁 folderCard.js – component dùng chung để hiển thị 1 thẻ folder

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

  
    // HTML bên trong card
    card.innerHTML = `
      <div class="folder-thumb">
        ${imgTag}
        ${showViews && folder.count ? `<div class="folder-views">👁 ${folder.count}</div>` : ""}
      </div>
      <div class="folder-title">${folder.name}</div>
    `;
  
    // Xử lý click để vào trang đọc hoặc load folder
    card.onclick = () => {
      if (folder.isSelfReader && folder.images) {
        const encoded = encodeURIComponent(folder.path);
        window.location.href = `/reader.html?path=${encoded}`;
      } else {
        window.loadFolder(folder.path);
      }
    };
  
    return card;
  }
  