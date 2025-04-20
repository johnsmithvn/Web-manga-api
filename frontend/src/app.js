// 📁 frontend/src/app.js
let currentPath = "";
let allFolders = [];
let currentImages = [];
let currentPage = 0;
let readerMode = "horizontal"; // hoặc 'vertical'

function loadFolder(path = "") {
  currentPath = path;
  fetch(`/api/folder?path=${encodeURIComponent(path)}`)
    .then((res) => res.json())
    .then((data) => {
      const app = document.getElementById("app");
      app.innerHTML = "";

      if (data.type === "folder") {
        allFolders = data.folders;
        renderFolderGrid(allFolders);
      } else if (data.type === "reader") {
        renderReader(data.images);
      }
    });
}

function renderFolderGrid(folders) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "grid";
  folders.forEach((f) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        ${f.thumbnail ? `<img src="${f.thumbnail}" alt="${f.name}">` : ""}
        <div>${f.name}</div>
    `;
    card.onclick = () => loadFolder(f.path);
    grid.appendChild(card);
  });
  document.querySelector(".search").style.display = "block";

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
  if (readerMode === "vertical") {
    reader.classList.add("scroll-mode");
  } else {
    reader.classList.remove("scroll-mode");
  }
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

    //  thêm chế click trái phải
    img.addEventListener("click", (e) => {
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 2) {
        prevPage();
      } else {
        nextPage();
      }
    });
  }

  //  ẩn tìm kiếm
  document.querySelector(".search").style.display = "none";

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
  console.log("Đã chuyển chế độ đọc sang:", readerMode);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").addEventListener("input", filterManga);
  loadFolder(); // chỉ giữ lại dòng này
});

// Trùm UX gọi đây là “Smart Hide UI” — tính năng kiểu YouTube, Facebook: scroll xuống thì nút ẩn đi, scroll lên thì hiện lại.
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > lastScrollY;

  document.querySelectorAll(".btn-fab").forEach((btn) => {
    btn.style.opacity = isScrollingDown ? "0" : "1";
    btn.style.pointerEvents = isScrollingDown ? "none" : "auto";
  });

  lastScrollY = currentScrollY;
});
