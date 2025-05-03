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
let totalFolders = 0;

/**
 * 📂 Load thư mục từ cache hoặc API và render ra giao diện
 */
export function loadFolder(path = "", page = 0) {
  const rootFolder = getRootFolder();
  if (!rootFolder) return;

  state.currentPath = path;
  folderPage = page;
  showLoading();

  const cached = getFolderCache(rootFolder, path);
  if (cached) {
    renderFolderData(cached);
    hideLoading();
    return;
  }

  fetchFromAPI(rootFolder, path);
}

function showLoading() {
  document.getElementById("loading-overlay")?.classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loading-overlay")?.classList.add("hidden");
}

function fetchFromAPI(rootFolder, path) {
  fetch(`/api/list-folder?root=${encodeURIComponent(rootFolder)}&path=${encodeURIComponent(path)}`)
    .then((res) => res.json())
    .then((data) => {
      setFolderCache(rootFolder, path, data);
      renderFolderData(data);
    })
    .catch((err) => {
      console.error("❌ Lỗi khi load folder:", err);
      alert("🚫 Lỗi khi tải thư mục, vui lòng thử lại!");
    })
    .finally(hideLoading);
}

/**
 * 📚 Load danh sách allFoldersList cho tính năng random/search
 */
export async function ensureAllFoldersList() {
  const root = getRootFolder();
  if (!root) return [];

  let list = getAllFoldersList(root);
  if (list) return list;

  try {
    const res = await fetch(`/api/list-all-folders?root=${encodeURIComponent(root)}`);
    list = await res.json();
    setAllFoldersList(root, list);
    return list;
  } catch (err) {
    console.error("❌ Lỗi fetch allFoldersList:", err);
    return [];
  }
}

/**
 * 📦 Render dữ liệu folder hoặc điều hướng sang reader nếu cần
 */
function renderFolderData(data) {
  if (data.type === "folder") {
    buildFolderState(data);
    const pagedFolders = paginateFolders(state.allFolders);
    renderFolderGrid(pagedFolders);
    updateFolderPaginationUI(folderPage, totalFolders, foldersPerPage);
  } else if (data.type === "reader") {
    redirectToReader();
  }
}

/**
 * 🧠 Chuẩn bị dữ liệu folder để hiển thị
 */
function buildFolderState(data) {
  state.allFolders = [];

  if (data.images?.length > 0) {
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
  totalFolders = state.allFolders.length;
}

/**
 * 📑 Trả về danh sách folder đã phân trang
 */
function paginateFolders(folders) {
  return folders.slice(
    folderPage * foldersPerPage,
    (folderPage + 1) * foldersPerPage
  );
}

/**
 * 🔀 Điều hướng sang trang reader nếu API trả về reader
 */
function redirectToReader() {
  const encoded = encodeURIComponent(state.currentPath);
  window.location.href = `/reader.html?path=${encoded}`;
}

/**
 * 🖼️ Render grid các folder ra giao diện chính
 */
export function renderFolderGrid(folders) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const section = createSectionElement();
  const header = renderFolderHeader();
  const grid = createGridElement(folders);

  section.appendChild(header);
  section.appendChild(grid);
  app.appendChild(section);
}

/**
 * 🧾 Tạo header hiển thị tên thư mục + xử lý back folder cha
 */
function renderFolderHeader() {
  const header = document.createElement("div");
  header.className = "folder-section-header";

  const title = document.createElement("h3");
  title.className = "folder-section-title";

  const pathParts = state.currentPath.split("/").filter(Boolean);
  const currentName = pathParts[pathParts.length - 1];
  title.textContent = pathParts.length === 0 ? "📂 Thư mục" : `📁 ${currentName}`;

  if (pathParts.length > 0) {
    title.style.cursor = "pointer";
    title.title = "Click để quay về thư mục cha";
    title.onclick = () => {
      const parentPath = pathParts.slice(0, -1).join("/");
      loadFolder(parentPath);
    };
  }

  header.appendChild(title);
  return header;
}

/**
 * 📦 Tạo thẻ section chứa grid thư mục
 */
function createSectionElement() {
  const section = document.createElement("section");
  section.className = "folder-section grid";
  return section;
}

/**
 * 🔳 Tạo lưới grid chứa danh sách thẻ thư mục
 */
function createGridElement(folders) {
  const grid = document.createElement("div");
  grid.className = "grid";
  folders.forEach((f) => {
    const card = renderFolderCard(f, true);
    grid.appendChild(card);
  });
  return grid;
}
