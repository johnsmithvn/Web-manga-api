// 📁 frontend/src/ui.js
import { renderFolderGrid, loadFolder, currentPath, allFolders } from "./folder.js";
import { renderReader, toggleReaderMode as toggleMode } from "./reader.js";

/**
 * 🔍 Lọc danh sách truyện theo từ khóa
 */
export function filterManga() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allFolders.filter((f) => f.name.toLowerCase().includes(keyword));
  renderFolderGrid(filtered);
}

/**
 * 🌙 Bật / tắt chế độ dark mode
 */
export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/**
 * ↩️ Quay lại folder cha
 */
export function goBack() {
  const parts = currentPath.split("/");
  parts.pop();
  loadFolder(parts.join("/"));
}

/**
 * 📖 Đổi chế độ đọc truyện (scroll <-> swipe)
 */
export function toggleReaderMode() {
  toggleMode();
}

/**
 * 📄 Phân trang folder view (prev / next / jump)
 */
export function updateFolderPaginationUI(currentPage, totalItems, perPage) {
  const totalPages = Math.ceil(totalItems / perPage);
  const app = document.getElementById("app");

  const nav = document.createElement("div");
  nav.className = "reader-controls";

  const prev = document.createElement("button");
  prev.textContent = "⬅ Trang trước";
  prev.disabled = currentPage <= 0;
  prev.onclick = () => loadFolder(currentPath, currentPage - 1);
  nav.appendChild(prev);

  const jumpForm = document.createElement("form");
  jumpForm.style.display = "inline-block";
  jumpForm.style.margin = "0 10px";
  jumpForm.onsubmit = (e) => {
    e.preventDefault();
    const inputPage = parseInt(jumpInput.value) - 1;
    if (!isNaN(inputPage) && inputPage >= 0) {
      loadFolder(currentPath, inputPage);
    }
  };

  const jumpInput = document.createElement("input");
  jumpInput.type = "number";
  jumpInput.min = 1;
  jumpInput.max = totalPages;
  jumpInput.placeholder = `Trang...`;
  jumpInput.title = `Tổng ${totalPages} trang`;
  jumpInput.style.width = "60px";

  const jumpBtn = document.createElement("button");
  jumpBtn.textContent = "⏩";

  jumpForm.appendChild(jumpInput);
  jumpForm.appendChild(jumpBtn);
  nav.appendChild(jumpForm);

  const next = document.createElement("button");
  next.textContent = "Trang sau ➡";
  next.disabled = currentPage + 1 >= totalPages;
  next.onclick = () => loadFolder(currentPath, currentPage + 1);
  nav.appendChild(next);

  app.appendChild(nav);

  const info = document.createElement("div");
  info.textContent = `Trang ${currentPage + 1} / ${totalPages}`;
  info.style.textAlign = "center";
  info.style.marginTop = "10px";
  app.appendChild(info);
}
