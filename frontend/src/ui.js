// 📁 frontend/src/ui.js

import { renderFolderGrid, state, loadFolder, ensureAllFoldersList } from "/src/folder.js"; // 🆕 Import ensureAllFoldersList
import { toggleReaderMode as toggleMode } from "/src/reader.js";
import { changeRootFolder } from "./storage.js"; 

/**
 * 🔙 Cập nhật trạng thái nút Back/Home tuỳ theo vị trí folder
 */
export function updateBackButtonUI() {
  const backButton = document.getElementById("back-button");
  if (!backButton) return;

  backButton.style.display = "inline-block";

  if (!state.currentPath || state.currentPath.trim() === "") {
    backButton.textContent = "🏠"; 
    backButton.setAttribute("aria-label", "Về chọn bộ"); 
  } else {
    backButton.textContent = "⬅"; 
    backButton.setAttribute("aria-label", "Back về thư mục cha");
  }
}

/**
 * 🔍 Lọc danh sách truyện theo từ khóa
 */
export async function filterManga() {
  const keyword = document.getElementById("searchInput")?.value.toLowerCase() || "";
  if (!keyword) {
    renderFolderGrid(state.allFolders);
    return;
  }

  const allFoldersList = await ensureAllFoldersList(); // 🆕 lấy cache hoặc fetch
  const filtered = allFoldersList.filter((f) => f.name.toLowerCase().includes(keyword));
  renderFolderGrid(filtered);
}

/**
 * 🌙 Bật / tắt chế độ dark mode
 */
export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/**
 * ⬅️ Xử lý hành động Back (về root hoặc folder cha)
 */
export function goBack() {
  if (!state.currentPath || state.currentPath.trim() === "") {
    changeRootFolder(); 
  } else {
    const parts = state.currentPath.split("/").filter(Boolean);
    parts.pop(); 
    loadFolder(parts.join("/")); 
  }
}

/**
 * 📖 Đổi chế độ đọc (scroll <-> swipe)
 */
export function toggleReaderMode() {
  toggleMode();
}

/**
 * 📄 Cập nhật UI phân trang
 */
export function updateFolderPaginationUI(currentPage, totalItems, perPage) {
  const totalPages = Math.ceil(totalItems / perPage);
  const app = document.getElementById("app");

  const nav = document.createElement("div");
  nav.className = "reader-controls";

  const prev = document.createElement("button");
  prev.textContent = "⬅ Trang trước";
  prev.disabled = currentPage <= 0;
  prev.onclick = () => loadFolder(state.currentPath, currentPage - 1);
  nav.appendChild(prev);

  const jumpForm = document.createElement("form");
  jumpForm.style.display = "inline-block";
  jumpForm.style.margin = "0 10px";
  jumpForm.onsubmit = (e) => {
    e.preventDefault();
    const inputPage = parseInt(jumpInput.value) - 1;
    if (!isNaN(inputPage) && inputPage >= 0) {
      loadFolder(state.currentPath, inputPage);
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
  next.onclick = () => loadFolder(state.currentPath, currentPage + 1);
  nav.appendChild(next);

  app.appendChild(nav);

  const info = document.createElement("div");
  info.textContent = `Trang ${currentPage + 1} / ${totalPages}`;
  info.style.textAlign = "center";
  info.style.marginTop = "10px";
  app.appendChild(info);
}

/**
 * 🔍 Toggle thanh tìm kiếm nổi (slide xuống giống YouTube)
 */
export function toggleSearchBar() {
  const bar = document.getElementById("floating-search");
  bar?.classList.toggle("active");

  const input = document.getElementById("floatingSearchInput");
  if (bar?.classList.contains("active")) {
    input?.focus();
  } else {
    input.value = "";
    filterManga();
  }
}

/**
 * ⚙️ Setup menu đổi bộ truyện
 */
export function setupSettingsMenu() {
  const settingsMenu = document.getElementById("settings-menu");
  if (!settingsMenu) return;

  const changeFolderBtn = document.createElement("button");
  changeFolderBtn.textContent = "🔄 Đổi Manga Folder";
  changeFolderBtn.onclick = () => {
    localStorage.removeItem("rootFolder");
    window.location.href = "/select.html";
  };

  settingsMenu.appendChild(changeFolderBtn);
}


/**
 * 👆 Toggle hiển/ẩn header và reader-footer
 * Dùng chung cho mọi chế độ reader (horizontal, scroll...)
 */
export function toggleReaderUI() {
  ["site-header", "reader-footer"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("hidden");
  });
}

/**
 * 👆 Show lại UI nếu đang ẩn
 */
export function showReaderUI() {
  document.getElementById("site-header")?.classList.remove("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
}

/**
 * 👇 Hide toàn bộ UI để tập trung đọc
 */
export function hideReaderUI() {
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");
}