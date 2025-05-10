// 📄 src/pages/favorites.js
import { getRootFolder } from "../core/storage.js";
import { renderFolderCard } from "../components/folderCard.js";

const container = document.getElementById("favorites-list");
const root = getRootFolder();

// 👇 Giả hàm loadFolder nếu không chạy trong index.html
window.loadFolder = (path) => {
  window.location.href = `/index.html?path=${encodeURIComponent(path)}&root=${encodeURIComponent(root)}`;
};

const perPage = 20;
let currentPage = 0;
let allFolders = [];

function renderPage(page = 0) {
  container.innerHTML = ""; // container = #favorites-list có sẵn .folder-grid

  const start = page * perPage;
  const end = start + perPage;
  const pageFolders = allFolders.slice(start, end);

  pageFolders.forEach((f) => {
    const card = renderFolderCard(f, true);

    const favBtn = document.createElement("button");
    favBtn.innerText = "🗑️ Bỏ yêu thích";
    favBtn.className = "favorite-btn";
    favBtn.onclick = async (e) => {
      e.stopPropagation();
      await fetch("/api/folder-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "remove-favorite", root, path: f.path }),
      });
      card.remove();
    };

    card.appendChild(favBtn);
    container.appendChild(card); // 🧠 bỏ bọc grid mới → dùng trực tiếp
  });

  renderPagination();
}


function renderPagination() {
  let nav = document.getElementById("favorites-pagination");
  if (!nav) {
    nav = document.createElement("div");
    nav.id = "favorites-pagination";
    nav.className = "pagination-controls";
    container.parentElement.appendChild(nav);
  }
  nav.innerHTML = "";

  const totalPages = Math.ceil(allFolders.length / perPage);

  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i + 1;
    if (i === currentPage) btn.disabled = true;
    btn.onclick = () => {
      currentPage = i;
      renderPage(currentPage);
    };
    nav.appendChild(btn);
  }
}

if (!root) {
  container.innerHTML = `<p>❌ Chưa chọn thư mục gốc</p>`;
} else {
  fetch(`/api/folder-cache?mode=favorites&root=${encodeURIComponent(root)}`)
    .then((res) => res.json())
    .then((folders) => {
      if (!folders.length) {
        container.innerHTML = `<p>📭 Chưa có folder nào được yêu thích</p>`;
        return;
      }
      allFolders = folders;
      renderPage(currentPage);
    })
    .catch((err) => {
      console.error("Error loading favorites:", err);
      container.innerHTML = `<p>⚠️ Lỗi khi tải danh sách yêu thích</p>`;
    });
}