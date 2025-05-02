// 📄 frontend/src/pages/home.js

import { loadFolder } from "/src/core/folder.js";
import {
  filterManga,
  toggleDarkMode,
  goBack,
  toggleSearchBar,
  setupSettingsMenu,
  renderRandomBanner,
  renderTopView,
  renderRecentViewed,
  showRandomUpdatedTime,
} from "/src/core/ui.js";
import {
  getRootFolder,
  requireRootFolder,
  changeRootFolder,
} from "/src/core/storage.js";
import { setupSidebar, toggleSidebar } from "/src/core/ui.js";

// Gắn global nếu HTML cần gọi
window.loadFolder = loadFolder;
window.goBack = goBack;
window.toggleDarkMode = toggleDarkMode;
window.toggleSearchBar = toggleSearchBar;
window.changeRootFolder = changeRootFolder;
window.getRootFolder = getRootFolder;

window.addEventListener("DOMContentLoaded", async () => {
  requireRootFolder(); // 🔐 Kiểm tra root
  setupSettingsMenu();
  setupSidebar();

  const root = getRootFolder();
  if (!root) return;
  loadFolder(); // 🧠 Load folder đầu tiên
  setupHeaderButtons();
  // 👉 Random banner
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
  }

  if (Array.isArray(listRandom)) {
    renderRandomBanner(listRandom);
    const cache = localStorage.getItem(randomKey);
    if (cache) {
      const { time } = JSON.parse(cache);
      showRandomUpdatedTime(time);
    }

    document
      .getElementById("refresh-random-btn")
      ?.addEventListener("click", () => {
        localStorage.removeItem(randomKey);
        location.reload();
      });
  }

  // 👉 Top View
  try {
    const res2 = await fetch(`/api/top-view?root=${encodeURIComponent(root)}`);
    const listTop = await res2.json();
    if (Array.isArray(listTop)) {
      renderTopView(listTop);
    }
  } catch (err) {
    console.error("❌ Lỗi fetch top view:", err);
  }

  // 👉 Recent Viewed
  const recentRaw = localStorage.getItem(`recentViewed::${root}`);
  if (recentRaw) {
    const list = JSON.parse(recentRaw);
    renderRecentViewed(list);
  }

  // 👉 Tìm kiếm
  document
    .getElementById("floatingSearchInput")
    ?.addEventListener("input", filterManga);

  // 👉 Header padding fix
  const header = document.getElementById("site-header");
  const wrapper = document.getElementById("wrapper");
  if (header && wrapper) {
    wrapper.style.paddingTop = `${header.offsetHeight}px`;
  }

});

// 👉 Nút reset cache
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

function setupHeaderButtons() {
  const headerBox = document.querySelector(".header-icons");
  if (!headerBox) return;

  // 🧹 Clear cũ
  headerBox.innerHTML = "";

  // ☰ Sidebar menu
  const menuBtn = document.createElement("button");
  menuBtn.textContent = "☰";
  menuBtn.onclick = toggleSidebar;
  headerBox.appendChild(menuBtn);

  // 🌙 Dark mode
  const darkBtn = document.createElement("button");
  darkBtn.textContent = "🌙";
  darkBtn.onclick = toggleDarkMode;
  headerBox.appendChild(darkBtn);
  // 🔍 Nút tìm kiếm
  const searchBtn = document.createElement("button");
  searchBtn.textContent = "🔍";
  searchBtn.onclick = toggleSearchBar;
  headerBox.appendChild(searchBtn);

  // ⬅ Back button
  const backBtn = document.createElement("button");
  backBtn.id = "back-button";
  backBtn.onclick = goBack;
  headerBox.appendChild(backBtn);

  // ✅ Update back button UI (🏠 hoặc ⬅)
  import("/src/core/ui.js").then(({ updateBackButtonUI }) => {
    updateBackButtonUI();
  });

  // 🏠 Logo click về Home
  const logo = document.querySelector("#site-header h1");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.onclick = () => (window.location.href = "index.html");
  }
}
