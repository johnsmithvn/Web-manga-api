// 📁 folderCard.js – component dùng chung để hiển thị 1 thẻ folder

/**
 * Tạo 1 card HTML cho folder (sử dụng cho slider hoặc grid)
 * @param {Object} folder - Thông tin folder (path, name, thumbnail, count, images, isSelfReader)
 * @param {boolean} showViews - Có hiển thị lượt xem không
 * @param {boolean} isFavorite - Có phải folder yêu thích không
 * @returns HTMLElement - Thẻ <div class="folder-card">
 */
export function renderFolderCard(folder, showViews = false, isFavorite = false) {
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
    if (folder.isSelfReader && folder.images) {
      const encoded = encodeURIComponent(folder.path);
      window.location.href = `/reader.html?path=${encoded}`;
    } else {
      window.loadFolder(folder.path);
    }
  };

  // ✅ Thêm nút ❤️ nếu chưa là yêu thích
  if (!isFavorite) {
    const favBtn = document.createElement("button");
    favBtn.className = "favorite-btn";
    favBtn.innerText = "❤️ Yêu thích";
    favBtn.onclick = async (e) => {
      e.stopPropagation();
      await fetch("/api/folder-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "add-favorite",
          root: window.getRootFolder?.() || localStorage.getItem("rootFolder"),
          path: folder.path,
        }),
      });
      favBtn.innerText = "✅ Đã thêm";
      favBtn.disabled = true;
    };
    card.appendChild(favBtn);
  } else {
    card.classList.add("favorite-highlight"); // có thể dùng CSS highlight
  }

  return card;
}
