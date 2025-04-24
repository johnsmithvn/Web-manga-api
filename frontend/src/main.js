// 📁 frontend/src/main.js
import { loadFolder } from "./folder.js";
import { filterManga, toggleDarkMode, toggleReaderMode, goBack } from "./ui.js";

// Khởi tạo sự kiện DOM khi trang sẵn sàng
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput")?.addEventListener("input", filterManga);
  document.querySelector(".mode-btn")?.addEventListener("click", toggleReaderMode);
  document.querySelector(".dark-btn")?.addEventListener("click", toggleDarkMode);
  document.querySelector(".back-btn")?.addEventListener("click", goBack);

  loadFolder(); // Load thư mục gốc khi mở web
});