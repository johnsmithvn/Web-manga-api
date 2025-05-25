// 📁 public/src/pages/movie-index.js

let currentPath = "";

function getSourceKey() {
  return localStorage.getItem("sourceKey");
}

function loadMovieFolder(path = "") {
  const sourceKey = getSourceKey();
  if (!sourceKey) {
    alert("Chưa chọn nguồn phim!"); window.location.href = "/movieroot.html"; return;
  }

  currentPath = path;
  const params = new URLSearchParams();
  params.set("key", sourceKey);
  if (path) params.set("path", path);

  fetch("/api/movie-folder?" + params.toString())
    .then(res => res.json())
    .then(data => renderMovieGrid(data.folders, path));
}

function renderMovieGrid(list, basePath) {
  const app = document.getElementById("movie-app");
  app.innerHTML = "";

  // Header
  const parts = basePath ? basePath.split("/").filter(Boolean) : [];
  const backBtn = document.getElementById("back-root");
  if (parts.length > 0) {
    backBtn.style.display = "";
    backBtn.onclick = () => {
      const parent = parts.slice(0, -1).join("/");
      loadMovieFolder(parent);
    };
  } else {
    backBtn.style.display = "none";
  }

  // Tiêu đề
  const title = document.createElement("h2");
  title.textContent = parts.length === 0 ? "📂 Danh sách phim" : "📁 " + parts[parts.length - 1];
  app.appendChild(title);

  // Grid
  const grid = document.createElement("div");
  grid.className = "grid";

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "folder-card";

    let icon;
    if (item.type === "video") {
      icon = `<div class="folder-thumb-placeholder">🎬</div>`;
    } else {
      icon = `<div class="folder-thumb-placeholder">📁</div>`;
    }

    card.innerHTML = `
      <div class="folder-thumb">${icon}</div>
      <div class="folder-title">${item.name}</div>
    `;

    card.onclick = () => {
      if (item.type === "video") {
        // Sang page play
        window.location.href = `/movie-player.html?file=${encodeURIComponent((basePath ? basePath + "/" : "") + item.name)}`;
      } else {
        loadMovieFolder((basePath ? basePath + "/" : "") + item.name);
      }
    };

    grid.appendChild(card);
  });

  app.appendChild(grid);
}

window.addEventListener("DOMContentLoaded", () => {
  loadMovieFolder();
});
