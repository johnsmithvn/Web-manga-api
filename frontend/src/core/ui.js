// ➕ BỔ SUNG UI FRONTEND RENDER BANNER RANDOM
// 📁 frontend/src/ui.js ➜ renderRandomBanner()
import { getRootFolder } from "./storage.js";

import { state, loadFolder } from "/src/core/folder.js";
import { changeRootFolder } from "./storage.js";
import { renderFolderSlider } from "/src/components/folderSlider.js";

/**
 * 🔍 Lọc danh sách truyện theo từ khóa
 */

export async function filterManga() {
  const keyword = document
    .getElementById("floatingSearchInput")
    ?.value.trim()
    .toLowerCase();
  const dropdown = document.getElementById("search-dropdown");
  const root = getRootFolder();
  if (!dropdown || !root) return;

  if (!keyword) {
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
    return;
  }

  // Hiện dropdown + loader
  dropdown.classList.remove("hidden");
  dropdown.innerHTML = `<div id="search-loader">🔍 Đang tìm kiếm...</div>`;

  try {
    const res = await fetch(
      `/api/folder-cache?mode=search&root=${encodeURIComponent(
        root
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

        // Nếu đang trong reader.html thì redirect thủ công
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
 * 🌙 Bật / tắt chế độ dark mode
 */
export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
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
 * 🖼️ Render banner thư mục ngẫu nhiên dạng slider ngang
 * @param {Array} folders - Danh sách folder có thumbnail
 */
// ✅ Hiển thị thời gian cập nhật ngẫu nhiên bên dưới banner random
export function showRandomUpdatedTime(timestamp) {
  const info = document.getElementById("random-timestamp");
  if (!info) return;

  const diff = Math.floor((Date.now() - timestamp) / 60000); // phút
  // ✅ Check nếu mobile thì rút gọn
  const isMobile = window.innerWidth <= 480;

  if (isMobile) {
    info.textContent = `🎲 ${diff === 0 ? "now" : `${diff}m`}`;
  } else {
    info.textContent = `🎲 Random ${
      diff === 0 ? "vừa xong" : `${diff} phút trước`
    }`;
  }
}

export function renderRandomBanner(folders) {
  renderFolderSlider({
    title: "✨ Đề xuất ngẫu nhiên",
    folders,
    showRefresh: true,
  });
}

/**
 * 📈 Render hàng TOP VIEW bên dưới banner random
 * @param {Array} folders - Có dạng {name, path, thumbnail, count}
 */

// ✅ Cập nhật renderTopView để thêm tiêu đề
export function renderTopView(folders) {
  renderFolderSlider({
    title: "👑 Xem nhiều nhất",
    folders,
    showViews: true,
  });
}

// ➕ BỔ SUNG UI FRONTEND - TIÊU ĐỀ + RECENT VIEW

/** ✅ Ghi lại folder vừa đọc vào localStorage */
export function saveRecentViewed(folder) {
  try {
    const root = getRootFolder();
    const key = `recentViewed::${root}`;
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];

    // Bỏ item cũ nếu trùng path
    const filtered = list.filter((item) => item.path !== folder.path);

    // Thêm lên đầu
    filtered.unshift({
      name: folder.name,
      path: folder.path,
      thumbnail: folder.thumbnail,
    });

    // Giới hạn 10
    const limited = filtered.slice(0, 30);
    localStorage.setItem(key, JSON.stringify(limited));
  } catch (err) {
    console.warn("❌ Không thể lưu recentViewed:", err);
  }
}

/** 🧠 Danh sách truy cập gần đây – hiển thị bên phải, vuốt được */
export function renderRecentViewed(folders = []) {
  renderFolderSlider({
    title: "🕘 Mới đọc",
    folders,
  });
}

// / Side bar
// 📂 Sidebar functions gộp từ sidebar.js
function createSidebarButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.onclick = withLoading(onClick);
  return btn;
}

export function setupSidebar() {
  const sidebar = document.getElementById("sidebar-menu");
  if (!sidebar) return;
  sidebar.innerHTML = "";

  const root = getRootFolder();

  // 🔄 Đổi Manga Folder
  sidebar.appendChild(
    createSidebarButton("🔄 Đổi Manga Folder", () => {
      changeRootFolder();
    })
  );

  // 🗑 Xoá DB
  sidebar.appendChild(
    createSidebarButton(
      "🗑 Xoá DB",
      withLoading(async () => {
        if (!root) return alert("❌ Chưa chọn folder gốc");

        const res = await fetch(
          `/api/reset-cache?root=${encodeURIComponent(root)}&mode=delete`,
          { method: "DELETE" }
        );

        const data = await res.json();
        alert(data.message || "✅ Đã xoá DB");
      })
    )
  );

  // 🔄 Reset DB (xoá + scan)
  sidebar.appendChild(
    createSidebarButton(
      "🔄 Reset DB (Xoá + Scan)",
      withLoading(async () => {
        if (!root) return alert("❌ Chưa chọn folder gốc");

        const res = await fetch(
          `/api/reset-cache?root=${encodeURIComponent(root)}&mode=reset`,
          { method: "DELETE" }
        );

        const data = await res.json();
        alert(data.message || "✅ Reset DB xong");
      })
    )
  );

  // 📦 Quét thư mục mới (Scan DB)
  sidebar.appendChild(
    createSidebarButton(
      "📦 Quét thư mục mới",
      withLoading(async () => {
        if (!root) return alert("❌ Chưa chọn folder gốc");

        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root }),
        });

        const data = await res.json();

        alert(
          `✅ Scan xong:\nInserted ${data.stats.inserted}, Updated ${data.stats.updated}, Skipped ${data.stats.skipped}`
        );
      })
    )
  );

  // 🧼 Xoá cache folder localStorage
  sidebar.appendChild(
    createSidebarButton("🧼 Xoá cache folder", () => {
      if (!root) return alert("❌ Chưa chọn folder gốc");

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("folderCache::" + root + ":")) {
          localStorage.removeItem(key);
        }
      });

      alert("✅ Đã xoá cache folder localStorage của root");
      location.reload();
    })
  );

    // ❤️ Mở trang Yêu thích
    sidebar.appendChild(
      createSidebarButton("❤️ Danh sách yêu thích", () => {
        window.location.href = "/favorites.html";
      })
    );
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

    // 💥 Ép trình duyệt render overlay trước khi tiếp tục
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
