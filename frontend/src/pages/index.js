import { loadFolder } from "/src/core/folder.js";
import {
  filterManga,
  toggleDarkMode,
  toggleSearchBar,
  renderRandomBanner,
  renderTopView,
  renderRecentViewed,
  showRandomUpdatedTime,
} from "/src/core/ui.js";
import {
  getRootFolder,
  getSourceKey,
  requireRootFolder,
  changeRootFolder,
} from "/src/core/storage.js";
import { setupSidebar, toggleSidebar } from "/src/core/ui.js";

// ✅ Expose global nếu HTML cần gọi
window.loadFolder = loadFolder;
window.toggleDarkMode = toggleDarkMode;
window.toggleSearchBar = toggleSearchBar;
window.changeRootFolder = changeRootFolder;
window.getRootFolder = getRootFolder;

window.addEventListener("DOMContentLoaded", async () => {
  requireRootFolder(); // 🔐 Check rootFolder + sourceKey
  setupSidebar();

  const rootFolder = getRootFolder(); // VD: Naruto
  const sourceKey = getSourceKey(); // VD: FANTASY
  if (!rootFolder || !sourceKey) return;

  const urlParams = new URLSearchParams(window.location.search);
  const initialPath = urlParams.get("path");
  const fullPath = initialPath || getRootFolder(); // ✅ Nếu không có path → lấy rootFolder
  loadFolder(fullPath);

  // 👉 CACHE RANDOM VIEW
  const randomKey = `randomView::${sourceKey}::${rootFolder}`;
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

  // 👉 Nếu chưa có cache → fetch API random
  if (!listRandom) {
    const res1 = await fetch(
      `/api/folder-cache?mode=random&root=${encodeURIComponent(
        sourceKey
      )}&path=${encodeURIComponent(rootFolder)}`
    );

    listRandom = await res1.json();
    localStorage.setItem(
      randomKey,
      JSON.stringify({ data: listRandom, time: Date.now() })
    );
  }

  // 👉 Render banner random
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

  // 👉 Fetch TOP view
  try {
    const res2 = await fetch(
      `/api/folder-cache?mode=top&root=${encodeURIComponent(
        sourceKey
      )}&path=${encodeURIComponent(rootFolder)}`
    );

    const listTop = await res2.json();
    if (Array.isArray(listTop)) {
      renderTopView(listTop);
    }
  } catch (err) {
    console.error("❌ Lỗi fetch top view:", err);
  }

  // 👉 Load recent viewed từ cache
  const recentRaw = localStorage.getItem(`recentViewed::${rootFolder}`);
  //  const recentRaw = localStorage.getItem(`recentViewed::${sourceKey}::${rootFolder}`);

  if (recentRaw) {
    const list = JSON.parse(recentRaw);
    renderRecentViewed(list);
  }

  // 👉 Tìm kiếm
  document
    .getElementById("floatingSearchInput")
    ?.addEventListener("input", filterManga);

  // 👉 Fix padding header
  const header = document.getElementById("site-header");
  const wrapper = document.getElementById("wrapper");
  if (header && wrapper) {
    wrapper.style.paddingTop = `${header.offsetHeight}px`;
  }
});

// 👉 Nút reset cache (theo sourceKey)
document
  .getElementById("reset-cache-btn")
  ?.addEventListener("click", async () => {
    const sourceKey = getSourceKey();
    if (!sourceKey) return alert("❌ Chưa chọn source!");

    if (!confirm(`Reset cache cho '${sourceKey}'?`)) return;

    try {
      const res = await fetch(
        `/api/reset-cache?root=${encodeURIComponent(sourceKey)}`,
        { method: "DELETE" }
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

// 👉 Sidebar toggle
document.getElementById("sidebarToggle")?.addEventListener("click", () => {
  if (typeof toggleSidebar === "function") {
    toggleSidebar();
  } else {
    console.warn("toggleSidebar() not defined");
  }
});

document.getElementById("searchToggle")?.addEventListener("click", () => {
  if (typeof toggleSearchBar === "function") {
    toggleSearchBar();
  } else {
    console.warn("toggleSearchBar() not defined");
  }
});
