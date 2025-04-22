// 📁 frontend/src/app.js
let currentPath = "";
let allFolders = [];
let currentImages = [];
let currentPage = 0;
let readerMode = "horizontal"; // hoặc 'vertical'
let folderPage = 0;
const foldersPerPage = 20;

function loadFolder(path = "", page = 0) {
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

      const searchBar = document.querySelector(".search");
      const modeBtn = document.querySelector(".mode-toggle");

      if (data.type === "folder") {
        document.body.classList.remove("reader-mode");


        if (searchBar) searchBar.style.display = "block";
        if (modeBtn) modeBtn.style.display = "none";

        allFolders = [];

        // Thêm "folder giả" nếu folder này có ảnh
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

        // Thêm các folder con
        allFolders = allFolders.concat(data.folders);
        renderFolderGrid(allFolders);

        const totalPages = Math.ceil((data.total || 0) / foldersPerPage);

        const nav = document.createElement("div");
        nav.className = "reader-controls";

        const prev = document.createElement("button");
        prev.textContent = "⬅ Trang trước";
        prev.disabled = folderPage <= 0;
        prev.onclick = () => loadFolder(currentPath, folderPage - 1);
        nav.appendChild(prev);

        const jumpForm = document.createElement("form");
        jumpForm.style.display = "inline-block";
        jumpForm.style.margin = "0 10px";
        jumpForm.onsubmit = (e) => {
          e.preventDefault();
          const inputPage = parseInt(jumpInput.value) - 1;
          if (!isNaN(inputPage) && inputPage >= 0) {
            loadFolder(currentPath, inputPage);
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
        next.disabled = folderPage + 1 >= totalPages;
        next.onclick = () => loadFolder(currentPath, folderPage + 1);
        nav.appendChild(next);

        app.appendChild(nav);

        const info = document.createElement("div");
        info.textContent = `Trang ${folderPage + 1} / ${totalPages}`;
        info.style.textAlign = "center";
        info.style.marginTop = "10px";
        app.appendChild(info);
      } else if (data.type === "reader") {
        document.body.classList.add("reader-mode");
        if (searchBar) searchBar.style.display = "none";
        if (modeBtn) modeBtn.style.display = "inline-block";
        renderReader(data.images);
      } else {
        if (searchBar) searchBar.style.display = "block";
        if (modeBtn) modeBtn.style.display = "none";
      }
    });
}

function renderFolderGrid(folders) {
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

function filterManga() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allFolders.filter((f) =>
    f.name.toLowerCase().includes(keyword)
  );
  renderFolderGrid(filtered);
}

function renderReader(images) {
  currentImages = images;
  currentPage = 0;

  const app = document.getElementById("app");
  app.innerHTML = "";

  const reader = document.createElement("div");
  reader.className = "reader";
  reader.classList.toggle("scroll-mode", readerMode === "vertical");

  if (readerMode === "vertical") {
    images.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Page ${index + 1}`;
      img.className = "scroll-img";
      img.style.display = "block";
      reader.appendChild(img);
    });
  } else {
    const img = document.createElement("img");
    img.src = currentImages[currentPage];
    img.style.display = "block";
    reader.appendChild(img);

    const pageIndicator = document.createElement("div");
    pageIndicator.className = "page-indicator";
    pageIndicator.textContent = `Trang ${currentPage + 1} / ${
      currentImages.length
    }`;
    reader.appendChild(pageIndicator);

    const hammer = new Hammer(reader);
    hammer.on("swipeleft", nextPage);
    hammer.on("swiperight", prevPage);

    document.onkeydown = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };

    img.addEventListener("click", (e) => {
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) prevPage();
      else nextPage();
    });
  }

  app.appendChild(reader);
}

function updatePage() {
  const reader = document.querySelector(".reader");
  const img = reader.querySelector("img");

  img.src = currentImages[currentPage];

  const pageIndicator = document.querySelector(".page-indicator");
  if (pageIndicator) {
    pageIndicator.textContent = `Trang ${currentPage + 1} / ${
      currentImages.length
    }`;
  }
}

function nextPage() {
  if (currentPage < currentImages.length - 1) {
    currentPage++;
    updatePage();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    updatePage();
  }
}

function goBack() {
  const parts = currentPath.split("/");
  parts.pop();
  loadFolder(parts.join("/"));
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function toggleReaderMode() {
  readerMode = readerMode === "vertical" ? "horizontal" : "vertical";
  renderReader(currentImages);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").addEventListener("input", filterManga);
  const search = document.querySelector(".search");
  if (search) {
    search.style.display = "block";
    search.style.margin = "0 auto";
  }
  const modeBtn = document.querySelector(".mode-toggle");
  if (modeBtn) modeBtn.style.display = "none";
  loadFolder();
});
