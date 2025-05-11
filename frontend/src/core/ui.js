import { getRootFolder, getSourceKey } from "./storage.js";
import { state, loadFolder } from "/src/core/folder.js";
import { changeRootFolder } from "./storage.js";
import { renderFolderSlider } from "/src/components/folderSlider.js";

/**
 * 🔍 Tìm kiếm truyện theo từ khóa
 */
export async function filterManga() {
  const keyword = document
    .getElementById("floatingSearchInput")
    ?.value.trim()
    .toLowerCase();
  const dropdown = document.getElementById("search-dropdown");
  const sourceKey = getSourceKey();
  if (!dropdown || !keyword || !sourceKey) return;

  dropdown.classList.remove("hidden");
  dropdown.innerHTML = `<div id="search-loader">🔍 Đang tìm kiếm...</div>`;

  try {
    const res = await fetch(
      `/api/folder-cache?mode=search&root=${encodeURIComponent(
        sourceKey
      )}&q=${encodeURIComponent(keyword)}`
    );
    const results = await res.json();

    dropdown.innerHTML = "";

    if (results.length === 0) {
      dropdown.innerHTML = `<div id="search-loader">❌ Không tìm thấy kết quả</div>`;
      return;
    }

    results.forEach((f) => {
      const item = document.createElement("div");
      item.className = "search-item";
      item.innerHTML = `
        <img src="${f.thumbnail}" class="search-thumb" alt="thumb">
        <div class="search-title">${f.name}</div>
      `;
      item.onclick = () => {
        dropdown.classList.add("hidden");

        if (window.location.pathname.includes("reader.html")) {
          window.location.href = `/index.html?path=${encodeURIComponent(
            f.path
          )}`;
        } else {
          window.loadFolder?.(f.path);
        }
      };

      dropdown.appendChild(item);
    });
  } catch (err) {
    dropdown.innerHTML = `<div id="search-loader">⚠️ Lỗi khi tìm kiếm</div>`;
    console.error("❌ Lỗi tìm kiếm:", err);
  }
}

/**
 * 🌙 Bật / tắt dark mode
 */
export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/**
 * 📄 Hiển thị phân trang folder
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
 * 🔍 Toggle thanh tìm kiếm nổi
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
 * 🖼 Banner random
 */
export function renderRandomBanner(folders) {
  renderFolderSlider({
    title: "✨ Đề xuất ngẫu nhiên",
    folders,
    showRefresh: true,
  });
}

export function renderTopView(folders) {
  renderFolderSlider({
    title: "👑 Xem nhiều nhất",
    folders,
    showViews: true,
  });
}

export function renderRecentViewed(folders = []) {
  renderFolderSlider({
    title: "🕘 Mới đọc",
    folders,
  });
}

export function showRandomUpdatedTime(timestamp) {
  const info = document.getElementById("random-timestamp");
  if (!info) return;
  const diff = Math.floor((Date.now() - timestamp) / 60000);
  const isMobile = window.innerWidth <= 480;
  info.textContent = isMobile
    ? `🎲 ${diff === 0 ? "now" : `${diff}m`}`
    : `🎲 Random ${diff === 0 ? "vừa xong" : `${diff} phút trước`}`;
}

/**
 * ⚙️ Sidebar setup
 */
export function setupSidebar() {
  const sidebar = document.getElementById("sidebar-menu");
  if (!sidebar) return;
  sidebar.innerHTML = "";

  const sourceKey = getSourceKey();
  if (!sourceKey) return;

  sidebar.appendChild(createSidebarButton("🔄 Đổi Manga Folder", () => {
    changeRootFolder();
  }));

  sidebar.appendChild(createSidebarButton("🗑 Xoá DB", async () => {
    const res = await fetch(`/api/reset-cache?root=${encodeURIComponent(sourceKey)}&mode=delete`, {
      method: "DELETE",
    });
    const data = await res.json();
    alert(data.message || "✅ Đã xoá DB");
  }));

  sidebar.appendChild(createSidebarButton("🔄 Reset DB (Xoá + Scan)", async () => {
    const res = await fetch(`/api/reset-cache?root=${encodeURIComponent(sourceKey)}&mode=reset`, {
      method: "DELETE",
    });
    const data = await res.json();
    alert(data.message || "✅ Reset DB xong");
  }));

  sidebar.appendChild(createSidebarButton("📦 Quét thư mục mới", async () => {
    const res = await fetch(`/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ root: sourceKey }),
    });
    const data = await res.json();
    alert(
      `✅ Scan xong:\nInserted ${data.stats.inserted}, Updated ${data.stats.updated}, Skipped ${data.stats.skipped}`
    );
  }));

  sidebar.appendChild(createSidebarButton("🧼 Xoá cache folder", () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("folderCache::" + sourceKey + "::")) {
        localStorage.removeItem(key);
      }
    });
    alert("✅ Đã xoá cache folder localStorage của source");
    location.reload();
  }));
}

function createSidebarButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.onclick = withLoading(onClick);
  return btn;
}

export function toggleSidebar() {
  const sidebar = document.getElementById("sidebar-menu");
  if (!sidebar) return;
  sidebar.classList.toggle("active");
}

export function withLoading(fn) {
  return async (...args) => {
    const overlay = document.getElementById("loading-overlay");
    overlay?.classList.remove("hidden");
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    try {
      await fn(...args);
    } catch (e) {
      console.error("❌ withLoading error:", e);
    } finally {
      overlay?.classList.add("hidden");
    }
  };
}
