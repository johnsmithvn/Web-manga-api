// 📁 frontend/src/main.js

import { loadFolder } from "/src/folder.js";
import {
  filterManga,
  toggleDarkMode,
  toggleReaderMode,
  goBack,
  toggleSearchBar,
  setupSettingsMenu,
  renderRandomBanner,
  renderTopView,
  renderRecentViewed,
} from "/src/ui.js";
import {
  getRootFolder,
  requireRootFolder,
  changeRootFolder,
} from "./storage.js"; // ✅ Import từ storage.js chuẩn
import { setupSidebar, toggleSidebar } from "./sidebar.js";

// Gắn vào window để HTML onclick hoạt động
window.loadFolder = loadFolder;
window.goBack = goBack;
window.toggleDarkMode = toggleDarkMode;
window.toggleReaderMode = toggleReaderMode;
window.toggleSearchBar = toggleSearchBar;
window.changeRootFolder = changeRootFolder;

window.addEventListener("DOMContentLoaded", async () => {
  requireRootFolder(); // 📂 Nếu chưa có rootFolder thì chuyển về select.html
  setupSettingsMenu(); // ⚙️ Setup menu đổi folder
  // 👉 Hide reader mode button nếu chưa vào reader
  const readerBtn = document.querySelector(
    'button[onclick="toggleReaderMode()"]'
  );
  if (readerBtn) {
    readerBtn.style.display = "none"; // ⛔ Ban đầu ẩn luôn
  }
  document
    .getElementById("searchInput")
    ?.addEventListener("input", filterManga);

  const header = document.getElementById("site-header");
  const wrapper = document.getElementById("wrapper");
  if (header && wrapper) {
    wrapper.style.paddingTop = `${header.offsetHeight}px`;
  }

  loadFolder(); // ✅ Load lần đầu

  // 🆕 Gọi API random banner ngay sau load folder
  const root = getRootFolder();
  if (root) {
    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/all-subfolders?root=${encodeURIComponent(root)}`),
        fetch(`/api/top-view?root=${encodeURIComponent(root)}`),
      ]);

      const listRandom = await res1.json();
      const listTop = await res2.json();

      if (Array.isArray(listRandom)) {
        renderRandomBanner(listRandom);
      }
      if (Array.isArray(listTop)) {
        renderTopView(listTop);
      }
    } catch (err) {
      console.error("❌ Lỗi fetch random/top banner:", err);
    }
  }

  // 🆕 Gắn nút mở Sidebar
  const sidebarButton = document.createElement("button");
  sidebarButton.textContent = "☰ Menu"; // Icon hamburger
  sidebarButton.onclick = toggleSidebar;
  document.querySelector(".header-icons")?.prepend(sidebarButton);
  // ✅ THÊM CUỐI CÙNG
  const recentRaw = localStorage.getItem("recentViewed");
  if (recentRaw) {
    const list = JSON.parse(recentRaw);
    renderRecentViewed(list);
  }
});
