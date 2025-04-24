// 📁 frontend/src/reader.js
export let currentImages = [];
let currentPage = 0;
let readerMode = "horizontal";

/**
 * 📖 Hiển thị ảnh đọc truyện
 * @param {Array} images
 */
export function renderReader(images) {
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
      reader.appendChild(img);
    });
  } else {
    const img = document.createElement("img");
    img.src = currentImages[currentPage];
    img.style.display = "block"; // ⚠️ THÊM DÒNG NÀY
    reader.appendChild(img);

    const pageIndicator = document.createElement("div");
    pageIndicator.className = "page-indicator";
    pageIndicator.textContent = `Trang ${currentPage + 1} / ${currentImages.length}`;
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
  const img = reader?.querySelector("img");
  if (img) img.src = currentImages[currentPage];

  const pageIndicator = document.querySelector(".page-indicator");
  if (pageIndicator) {
    pageIndicator.textContent = `Trang ${currentPage + 1} / ${currentImages.length}`;
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

export function toggleReaderMode() {
  readerMode = readerMode === "vertical" ? "horizontal" : "vertical";
  renderReader(currentImages);
}