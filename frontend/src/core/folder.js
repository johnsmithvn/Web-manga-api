// 📁 frontend/src/folder.js

import { updateFolderPaginationUI } from "./ui.js";
import {
  getRootFolder,
  getFolderCache,
  setFolderCache,
  getAllFoldersList,
  setAllFoldersList,
} from "./storage.js";
import { preloadThumbnails } from "./preload.js";
import { renderFolderCard } from "../components/folderCard.js";

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
    `/api/folder-cache?mode=path&root=${encodeURIComponent(
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
      `/api/folder-cache?mode=folders&root=${encodeURIComponent(root)}`
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
  console.log("📦 Data render:", data); // debug
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

  } else if (data.type === "reader") {
    const encoded = encodeURIComponent(state.currentPath);
    window.location.href = `/reader.html?path=${encoded}`;
  }
  
}

/**
 * 🧱 Hiển thị lưới folder (thẻ card)
 * @param {Array} folders
 */
/**
 * Hiển thị danh sách folder theo dạng lưới (grid)
 * @param {Array} folders - Danh sách folder
 */

/**
 * Hiển thị danh sách folder dạng lưới, được wrap giống slider
 * @param {Array} folders
 */
export function renderFolderGrid(folders) {

  const app = document.getElementById("app");
  app.innerHTML = "";

  // 🧱 Tạo section giống slider
  const section = document.createElement("section");
  section.className = "folder-section grid";

  // 🔠 Tạo header có tiêu đề động (VD: "Thư mục", hoặc "One Piece")
  const header = document.createElement("div");
  header.className = "folder-section-header";

  const title = document.createElement("h3");
  title.className = "folder-section-title";

  // ✅ Tính tên folder hiện tại (hoặc là "Thư mục gốc")
  const pathParts = state.currentPath.split("/").filter(Boolean);
  const currentName = pathParts[pathParts.length - 1];
  title.textContent = pathParts.length === 0 ? "📂 Thư mục" : `📁 ${currentName}`;

  // 🔙 Nếu đang ở trong thư mục con → click để về cha
  if (pathParts.length > 0) {
    title.style.cursor = "pointer";
    title.title = "Click để quay về thư mục cha";
    title.onclick = () => {
      const parentPath = pathParts.slice(0, -1).join("/");
      loadFolder(parentPath);
    };
  }

  header.appendChild(title);
  section.appendChild(header);

  // 🔳 Grid folder
  const grid = document.createElement("div");
  grid.className = "grid";

  folders.forEach((f) => {
    const card = renderFolderCard(f, true);
    grid.appendChild(card);
  });

  section.appendChild(grid);
  app.appendChild(section);

}

