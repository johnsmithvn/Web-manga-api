// 📁 frontend/src/main.js

import { loadFolder } from "/src/folder.js";
import {
  filterManga,
  toggleDarkMode,
  toggleReaderMode,
  goBack,
  toggleSearchBar,
  setupSettingsMenu,
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

window.addEventListener("DOMContentLoaded", () => {
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

  // 🆕 Gắn nút mở Sidebar
  const sidebarButton = document.createElement("button");
  sidebarButton.textContent = "☰ Menu"; // Icon hamburger
  sidebarButton.onclick = toggleSidebar;
  document.querySelector(".header-icons")?.prepend(sidebarButton);
});
