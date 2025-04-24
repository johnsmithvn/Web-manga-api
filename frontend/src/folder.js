// 📁 frontend/src/folder.js
import { renderReader } from "./reader.js";
import { updateFolderPaginationUI } from "./ui.js";

export let currentPath = "";
export let allFolders = [];
let folderPage = 0;
const foldersPerPage = 20;

/**
 * 📂 Load folder từ API + hiển thị thư mục / ảnh
 * @param {string} path
 * @param {number} page
 */
export function loadFolder(path = "", page = 0) {
  currentPath = path;
  folderPage = page;

  const offset = folderPage * foldersPerPage;
  fetch(
    `/api/folder?path=${encodeURIComponent(
      path
    )}&limit=${foldersPerPage}&offset=${offset}`
  )
    .then((res) => res.json())
    .then((data) => {
      const app = document.getElementById("app");
      app.innerHTML = "";

      if (data.type === "folder") {
        document.body.classList.remove("reader-mode");
        // ✅ Hiện lại footer mặc định
        document.getElementById("main-footer")?.classList.remove("hidden");
        document.getElementById("reader-footer")?.classList.add("hidden");

        allFolders = [];

        if (data.images && data.images.length > 0) {
          const parts = path.split("/");
          const folderName = parts[parts.length - 1] || "Xem ảnh";
          allFolders.push({
            name: folderName,
            path: currentPath + "/__self__",
            thumbnail: data.images[0],
            isSelfReader: true,
            images: data.images,
          });
        }

        allFolders = allFolders.concat(data.folders);
        renderFolderGrid(allFolders);

        updateFolderPaginationUI(folderPage, data.total || 0, foldersPerPage);
      } else if (data.type === "reader") {
        document.body.classList.add("reader-mode");
        // 🧼 Ẩn footer mặc định (nếu chưa ẩn bằng CSS)
        document.getElementById("main-footer")?.classList.add("hidden");
        renderReader(data.images);
      }
    });
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
    card.innerHTML = `
      ${f.thumbnail ? `<img src="${f.thumbnail}" alt="${f.name}">` : ""}
      <div>${f.name}</div>
    `;
    card.onclick = () => {
      if (f.isSelfReader && f.images) renderReader(f.images);
      else loadFolder(f.path);
    };
    grid.appendChild(card);
  });
  app.appendChild(grid);
}
