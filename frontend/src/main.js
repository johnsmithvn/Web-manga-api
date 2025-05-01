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
  showRandomUpdatedTime,
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
window.getRootFolder = getRootFolder; // 👈 THÊM dòng này

window.addEventListener("DOMContentLoaded", async () => {
  requireRootFolder(); // 📂 Nếu chưa có rootFolder thì chuyển về select.html
  setupSettingsMenu(); // ⚙️ Setup menu đổi folder

  // 🆕 Gọi API random banner ngay sau load folder
  const root = getRootFolder();
  if (!root) return;
  loadFolder(); // ✅ Load lần đầu

  if (root) {
    try {
      // 🔒 KEY lưu cache random
      const randomKey = `randomView::${root}`;
      let listRandom = null;

      try {
        const cache = localStorage.getItem(randomKey);
        if (cache) {
          const { data, time } = JSON.parse(cache);
          if (Date.now() - time < 30 * 60 * 1000) {
            listRandom = data;
            console.log("⚡ Dùng cache random từ localStorage");
          }
        }
      } catch (err) {
        console.warn("❌ Lỗi đọc cache random:", err);
      }

      if (!listRandom) {
        const res1 = await fetch(
          `/api/all-subfolders?root=${encodeURIComponent(root)}`
        );
        listRandom = await res1.json();
        localStorage.setItem(
          randomKey,
          JSON.stringify({ data: listRandom, time: Date.now() })
        );
        renderRandomBanner(listRandom); // ✅ Thêm dòng này
        showRandomUpdatedTime(Date.now()); // ✅ Thêm ở đây
      }

      const res2 = await fetch(
        `/api/top-view?root=${encodeURIComponent(root)}`
      );
      const listTop = await res2.json();

      if (Array.isArray(listRandom)) {
        renderRandomBanner(listRandom);
        // ✅ Sau khi render xong, gọi timestamp
        const cache = localStorage.getItem(randomKey);
        if (cache) {
          const { time } = JSON.parse(cache);
          showRandomUpdatedTime(time);
        }

        // ✅ Gắn sự kiện sau khi DOM render xong
        document
          .getElementById("refresh-random-btn")
          ?.addEventListener("click", () => {
            const root = getRootFolder();
            if (!root) return;
            localStorage.removeItem(`randomView::${root}`);
            location.reload();
          });
      }
      if (Array.isArray(listTop)) {
        renderTopView(listTop);
      }
    } catch (err) {
      console.error("❌ Lỗi fetch random/top banner:", err);
    }
  }

  // Các đoạn UI phụ

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

  // 🆕 Gắn nút mở Sidebar
  const sidebarButton = document.createElement("button");
  sidebarButton.textContent = "☰ Menu"; // Icon hamburger
  sidebarButton.onclick = toggleSidebar;
  document.querySelector(".header-icons")?.prepend(sidebarButton);
  // ✅ THÊM CUỐI CÙNG
  const recentRaw = localStorage.getItem(`recentViewed::${root}`);
  if (recentRaw) {
    const list = JSON.parse(recentRaw);
    renderRecentViewed(list);
  }
});

// 🆕 nut reset random banner
document.getElementById("refresh-random-btn")?.addEventListener("click", () => {
  const root = getRootFolder();
  if (!root) return;
  localStorage.removeItem(`randomView::${root}`);
  location.reload();
});

document
  .getElementById("reset-cache-btn")
  ?.addEventListener("click", async () => {
    const root = getRootFolder();
    if (!root) return alert("❌ Chưa chọn root!");

    if (!confirm(`Reset cache cho '${root}'?`)) return;

    try {
      const res = await fetch(
        `/api/reset-cache?root=${encodeURIComponent(root)}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json();
      if (json.success) {
        alert("✅ Reset xong!");
        location.reload();
      } else {
        alert("❌ Reset thất bại!");
      }
    } catch (err) {
      alert("🚫 Lỗi kết nối API reset");
      console.error(err);
    }
  });
