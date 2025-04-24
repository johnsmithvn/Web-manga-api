// 📁 frontend/src/main.js
import { loadFolder } from "./folder.js";
import {
  filterManga,
  toggleDarkMode,
  toggleReaderMode,
  goBack,
  toggleSearchBar,
} from "./ui.js";

// Gắn vào window để HTML onclick hoạt động
window.loadFolder = loadFolder;
window.goBack = goBack;
window.toggleDarkMode = toggleDarkMode;
window.toggleReaderMode = toggleReaderMode;
window.toggleSearchBar = toggleSearchBar;

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput")?.addEventListener("input", filterManga);

  const header = document.getElementById("site-header");
  const wrapper = document.getElementById("wrapper");
  if (header && wrapper) {
    wrapper.style.paddingTop = `${header.offsetHeight}px`;
  }

  loadFolder(); // ✅ Load lần đầu
});
