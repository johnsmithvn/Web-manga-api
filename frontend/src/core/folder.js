import { updateFolderPaginationUI } from "./ui.js";
import {
  getRootFolder,
  getSourceKey,
  getFolderCache,
  setFolderCache,
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
 * 📂 Load folder từ API hoặc cache + hiển thị thư mục / ảnh
 * @param {string} path
 * @param {number} page
 */
export function loadFolder(path = "", page = 0) {
  const rootFolder = getRootFolder(); // VD: Naruto
  const sourceKey = getSourceKey(); // VD: FANTASY
  if (!rootFolder || !sourceKey) return;

  state.currentPath = path;
  folderPage = page;

  document.getElementById("loading-overlay")?.classList.remove("hidden");

  const readerBtn = document.getElementById("readerModeButton");
  if (readerBtn) readerBtn.remove();

  // ✅ Cache theo: sourceKey + rootFolder
  const cached = getFolderCache(rootFolder, path);
  if (cached) {
    renderFromData(cached);
    document.getElementById("loading-overlay")?.classList.add("hidden");
    return;
  }

  // ✅ API: /folder-cache?mode=path&root=FANTASY&path=Naruto/vol1
  fetch(
    `/api/folder-cache?mode=path&root=${encodeURIComponent(
      sourceKey
    )}&path=${encodeURIComponent(path)}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data?.error) {
        throw new Error(data.error);
      }
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

function renderFromData(data) {
  console.log("📦 Data render:", data);
  const app = document.getElementById("app");
  app.innerHTML = "";

  if (data.type === "folder") {
    // document.body.classList.remove("reader-mode");
    // document.getElementById("main-footer")?.classList.remove("hidden");
    // document.getElementById("reader-footer")?.classList.add("hidden");

    state.allFolders = [];

    // if (data.images && data.images.length > 0) {
    //   const parts = state.currentPath.split("/");
    //   const folderName = parts[parts.length - 1] || "Xem ảnh";

    //   state.allFolders.push({
    //     name: folderName,
    //     path: state.currentPath + "/__self__",
    //     thumbnail: data.images[0],
    //     isSelfReader: true,
    //     images: data.images,
    //     hasImages: true,
    //   });
    // }

    const hasImages = data.images && data.images.length > 0;
    const hasSubfolders = data.folders && data.folders.length > 0;

    // ✅ Nếu chỉ có ảnh → chuyển sang reader luôn
    if (hasImages && !hasSubfolders) {
      const encoded = encodeURIComponent(state.currentPath);
      window.location.href = `/reader.html?path=${encoded}`;
      return;
    }

    // ✅ Nếu có cả ảnh + folder con → thêm folder giả để đọc ảnh
    if (hasImages && hasSubfolders) {
      const parts = state.currentPath.split("/");
      const folderName = parts[parts.length - 1] || "Xem ảnh";

      state.allFolders.push({
        name: folderName,
        path: state.currentPath + "/__self__",
        thumbnail: data.images[0],
        isSelfReader: true,
        images: data.images,
        hasImages: true,
      });
    }

    state.allFolders = state.allFolders.concat(data.folders);
    preloadThumbnails(state.allFolders);

    totalFolders = state.allFolders.length;

    const pagedFolders = state.allFolders.slice(
      folderPage * foldersPerPage,
      (folderPage + 1) * foldersPerPage
    );

    renderFolderGrid(pagedFolders);
    updateFolderPaginationUI(folderPage, totalFolders, foldersPerPage);
  } else if (data.type === "reader") {
    document.getElementById("loading-overlay")?.classList.remove("hidden");
    const encoded = encodeURIComponent(state.currentPath);
    window.location.href = `/reader.html?path=${encoded}`;
  }
}

export function renderFolderGrid(folders) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const section = document.createElement("section");
  section.className = "folder-section grid";

  const header = document.createElement("div");
  header.className = "folder-section-header";

  const title = document.createElement("h3");
  title.className = "folder-section-title";

  const pathParts = state.currentPath.split("/").filter(Boolean);
  const currentName = pathParts[pathParts.length - 1];

  title.textContent =
    pathParts.length === 0 ? "📂 Thư mục" : `📁 ${currentName}`;

  if (pathParts.length > 0) {
    title.style.cursor = "pointer";
    title.title = "Click để quay về thư mục cha";
    title.onclick = () => {
      const parentPath = pathParts.slice(0, -1).join("/");
      loadFolder(parentPath);
    };
    title.style.maxWidth = "100%";
    title.style.overflow = "hidden";
    title.style.textOverflow = "ellipsis";
    title.style.whiteSpace = "nowrap";
  }

  header.appendChild(title);
  section.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "grid";

  folders.forEach((f) => {
    const card = renderFolderCard(f, true);
    grid.appendChild(card);
  });

  section.appendChild(grid);
  app.appendChild(section);
}
