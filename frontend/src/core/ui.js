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

  const sourceKey = getSourceKey(); // ví dụ: FANTASY
  const rootFolder = getRootFolder(); // ví dụ: Naruto
  if (!sourceKey || !rootFolder) return;

  sidebar.appendChild(
    createSidebarButton("🔄 Đổi Manga Folder", () => {
      changeRootFolder();
    })
  );

  // 🗑️ Xoá cache DB theo rootFolder
  sidebar.appendChild(
    createSidebarButton("🗑 Xoá DB", async () => {
      const ok = await showConfirm("Bạn có chắc muốn xoá toàn bộ DB không?", {
        loading: true,
      });
      if (!ok) return;

      try {
        const res = await fetch(
          `/api/reset-cache?root=${encodeURIComponent(
            sourceKey
          )}&folder=${encodeURIComponent(rootFolder)}&mode=delete`,
          { method: "DELETE" }
        );
        const data = await res.json();
        showToast(data.message || "✅ Đã xoá DB");
      } catch (err) {
        showToast("❌ Lỗi khi gọi API");
      } finally {
        // ✅ ĐẢM BẢO LUÔN TẮT LOADING
        const overlay = document.getElementById("loading-overlay");
        overlay?.classList.add("hidden");
      }
    })
  );

  // 🔁 Reset cache DB + scan lại theo rootFolder
  sidebar.appendChild(
    createSidebarButton("🔄 Reset DB (Xoá + Scan)", async () => {
      const ok = await showConfirm("Bạn chắc muốn reset và scan lại DB?", {
        loading: true,
      });
      if (!ok) return;

      try {
        const res = await fetch(
          `/api/reset-cache?root=${encodeURIComponent(
            sourceKey
          )}&folder=${encodeURIComponent(rootFolder)}&mode=reset`,
          { method: "DELETE" }
        );
        const data = await res.json();
        showToast(data.message || "✅ Reset DB xong");
      } catch (err) {
        showToast("❌ Lỗi reset DB");
        console.error(err);
      } finally {
        const overlay = document.getElementById("loading-overlay");
        overlay?.classList.add("hidden");
      }
    })
  );

  // 📦 Scan folder mới (không xoá DB)
  sidebar.appendChild(
    createSidebarButton("📦 Quét thư mục mới", async () => {
      const ok = await showConfirm("Quét folder mới (không xoá DB)?", {
        loading: true,
      });
      if (!ok) return;

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: sourceKey }),
        });
        const data = await res.json();
        showToast(
          `✅ Scan xong:\nInserted ${data.stats.inserted}, Updated ${data.stats.updated}, Skipped ${data.stats.skipped}`
        );
      } catch (err) {
        showToast("❌ Lỗi khi quét folder");
        console.error(err);
      } finally {
        const overlay = document.getElementById("loading-overlay");
        overlay?.classList.add("hidden");
      }
    })
  );

  // 🧼 Xoá cache folder localStorage
  sidebar.appendChild(
    createSidebarButton("🧼 Xoá cache folder", () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("folderCache::" + sourceKey + "::")) {
          localStorage.removeItem(key);
        }
      });
      alert("✅ Đã xoá cache folder localStorage của source");
      location.reload();
    })
  );
}

function createSidebarButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.onclick = onClick;
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

export function showToast(msg) {
  let toast = document.getElementById("global-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "global-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#333";
    toast.style.color = "white";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "9999";
    toast.style.fontSize = "14px";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

export function showConfirm(message, options = {}) {
  let modal = document.getElementById("global-confirm");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "global-confirm";
    modal.className = "modal-overlay hidden";
    modal.innerHTML = `
      <div class="modal-box">
        <p id="confirm-text"></p>
        <div class="buttons">
          <button class="ok">OK</button>
          <button class="cancel">Huỷ</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.querySelector("#confirm-text").textContent = message;
  modal.classList.remove("hidden");

  return new Promise((resolve) => {
    const okBtn = modal.querySelector("button.ok");
    const cancelBtn = modal.querySelector("button.cancel");

    const cleanup = () => {
      modal.classList.add("hidden");
      okBtn.removeEventListener("click", onOK);
      cancelBtn.removeEventListener("click", onCancel);
    };

    const onOK = () => {
      cleanup();

      // ✅ Nếu options.loading = true thì bật overlay sau khi OK
      if (options.loading) {
        const overlay = document.getElementById("loading-overlay");
        overlay?.classList.remove("hidden");
      }

      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    okBtn.addEventListener("click", onOK);
    cancelBtn.addEventListener("click", onCancel);
  });
}
