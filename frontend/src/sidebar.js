// 📁 frontend/src/sidebar.js

import { clearAllFolderCache } from "./storage.js"; // ✅ Hàm clear cache
import { changeRootFolder } from "./storage.js";   // ✅ Hàm đổi bộ

/**
 * 📂 Tạo sidebar và gắn nút chức năng
 */
export function setupSidebar() {
  const sidebar = document.getElementById("sidebar-menu");
  if (!sidebar) return;

  // 🧹 Clear cũ nếu có
  sidebar.innerHTML = "";


  // ➡️ Tạo nút Đổi bộ truyện
  const changeBtn = document.createElement("button");
  changeBtn.textContent = "🔄 Đổi Manga Folder";
  changeBtn.onclick = () => {
    changeRootFolder();
  };
  sidebar.appendChild(changeBtn);
}

/**
 * 📂 Mở/Đóng sidebar
 */
export function toggleSidebar() {
  const sidebar = document.getElementById("sidebar-menu");
  if (!sidebar) return;
  sidebar.classList.toggle("active");
}
