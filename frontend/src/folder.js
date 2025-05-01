// 📁 frontend/src/folder.js

import { renderReader } from "./reader.js";
import { updateFolderPaginationUI, updateBackButtonUI } from "./ui.js";
import {
  getRootFolder,
  getFolderCache,
  setFolderCache,
  getAllFoldersList,
  setAllFoldersList,
} from "./storage.js";
import { preloadThumbnails } from "./preload.js";
import { saveRecentViewed } from "./ui.js";

export const state = {
  currentPath: "",
  allFolders: [],
};
let folderPage = 0;
const foldersPerPage = 20;
let totalFolders = 0; // 🆕 Tổng số folder thực tế không bị slice

/**
 * 📂 Load folder từ API hoặc cache + hiển thị thư mục / ảnh
 * @param {string} path
 * @param {number} page
 */
export function loadFolder(path = "", page = 0) {
  const rootFolder = getRootFolder();
  if (!rootFolder) return;

  state.currentPath = path;
  folderPage = page;

  document.getElementById("loading-overlay")?.classList.remove("hidden");

  const readerBtn = document.getElementById("readerModeButton");
  if (readerBtn) readerBtn.remove();

  const cached = getFolderCache(rootFolder, path);
  if (cached) {
    renderFromData(cached);
    document.getElementById("loading-overlay")?.classList.add("hidden");
    return;
  }

  fetch(
    `/api/list-folder?root=${encodeURIComponent(
      rootFolder
    )}&path=${encodeURIComponent(path)}`
  )
    .then((res) => res.json())
    .then((data) => {
      setFolderCache(rootFolder, path, data);
      renderFromData(data);
    })
    .catch((err) => {
      console.error("❌ Lỗi khi load folder:", err);
      alert("🚫 Lỗi khi tải thư mục, vui lòng thử lại!");
    })
    .finally(() => {
      document.getElementById("loading-overlay")?.classList.add("hidden");
    });
}

/**
 * 🆕 Load danh sách allFoldersList để search/random (cache hoặc fetch)
 */
export async function ensureAllFoldersList() {
  const root = getRootFolder();
  if (!root) return [];

  let list = getAllFoldersList(root);
  if (list) return list;

  try {
    const res = await fetch(
      `/api/list-all-folders?root=${encodeURIComponent(root)}`
    );
    list = await res.json();
    setAllFoldersList(root, list);
    return list;
  } catch (err) {
    console.error("❌ Lỗi fetch allFoldersList:", err);
    return [];
  }
}

/**
 * 🧱 Render dữ liệu folder hoặc reader từ cache hoặc API
 * @param {object} data
 */
function renderFromData(data) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  if (data.type === "folder") {
    document.body.classList.remove("reader-mode");
    document.getElementById("main-footer")?.classList.remove("hidden");
    document.getElementById("reader-footer")?.classList.add("hidden");

    state.allFolders = [];

    if (data.images && data.images.length > 0) {
      const parts = state.currentPath.split("/");
      const folderName = parts[parts.length - 1] || "Xem ảnh";

      state.allFolders.push({
        name: folderName,
        path: state.currentPath + "/__self__",
        thumbnail: data.images[0],
        isSelfReader: true,
        images: data.images,
      });
    }

    state.allFolders = state.allFolders.concat(data.folders);

    preloadThumbnails(state.allFolders);

    // 🆕 Ghi lại tổng số folders thực tế
    totalFolders = state.allFolders.length;

    // 🆕 Slice phân trang chỉ đúng trang cần render
    const pagedFolders = state.allFolders.slice(
      folderPage * foldersPerPage,
      (folderPage + 1) * foldersPerPage
    );

    renderFolderGrid(pagedFolders);

    // 🆕 update đúng phân trang: dùng tổng số folders
    updateFolderPaginationUI(folderPage, totalFolders, foldersPerPage);

    updateBackButtonUI();
  } else if (data.type === "reader") {
    document.body.classList.add("reader-mode");
    document.getElementById("main-footer")?.classList.add("hidden");

    // ✅ THÊM Ở ĐÂY
    const parts = state.currentPath.split("/");
    const folderName = parts[parts.length - 1] || "Xem ảnh";
    saveRecentViewed({
      name: folderName,
      path: state.currentPath,
      thumbnail: data.images[0] || null,
    });
    // 📍 Tăng view tại đây là đúng
    fetch("/api/increase-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: state.currentPath }),
    });

    renderReader(data.images);
  }
}

/**
 * 🧱 Hiển thị lưới folder (thẻ card)
 * @param {Array} folders
 */
export function renderFolderGrid(folders) {
  const app = document.getElementById("app");
  const grid = document.createElement("div");
  grid.className = "grid";

  folders.forEach((f) => {
    const card = document.createElement("div");
    card.className = "card";

    const imgTag = f.thumbnail
      ? `<img src="${f.thumbnail}" alt="${f.name}" loading="lazy">`
      : "";

    card.innerHTML = `
      ${imgTag}
      <div>${f.name}</div>
    `;

    card.onclick = () => {
      if (f.isSelfReader && f.images) {
        renderReader(f.images);
      } else {
        loadFolder(f.path);
      }
    };

    grid.appendChild(card);
  });

  app.appendChild(grid);
}
