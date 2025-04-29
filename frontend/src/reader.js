// 📁 frontend/src/reader.js

import { state, loadFolder } from "./folder.js";
import { getRootFolder } from "./storage.js";

export let currentImages = [];
let currentPage = 0;
let readerMode = "horizontal"; // "horizontal" hoặc "vertical"

/**
 * 📖 Render giao diện reader mode (main)
 */

export function renderReader(images) {
  currentImages = images;
  currentPage = 0;

  const app = document.getElementById("app");
  app.innerHTML = "";

  const reader = document.createElement("div");
  reader.className = "reader";
  reader.classList.toggle("scroll-mode", readerMode === "vertical");

  setupReaderUI();
  setupReaderModeButton();

  if (readerMode === "vertical") {
    import("./reader-scroll.js").then(({ renderScrollReader }) => {
      renderScrollReader(images, reader);
    });
  } else {
    import("./reader-horizontal.js").then(({ renderHorizontalReader }) => {
      const { setCurrentPage } = renderHorizontalReader(
        images,
        reader,
        updateReaderPageInfoReal
      ); // ✅ lấy đúng
      window.setHorizontalPage = setCurrentPage; // 🆕 Gán vào window tạm để xài ngoài
    });
  }

  setupChapterNavigation();
  app.appendChild(reader);
  updateReaderPageInfo();
  setupPageInfoClick();
}

/** 📈 Ẩn header/footer gốc khi vào reader mode */
function setupReaderUI() {
  document.body.classList.add("reader-mode");
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("main-footer")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
}

/** 📖 Gắn nút đổi chế độ đọc nếu chưa có */
function setupReaderModeButton() {
  const headerIcons = document.querySelector(".header-icons");
  if (headerIcons && !document.getElementById("readerModeButton")) {
    const readerBtn = document.createElement("button");
    readerBtn.id = "readerModeButton";
    readerBtn.textContent = "📖";
    readerBtn.onclick = toggleReaderMode;
    headerIcons.appendChild(readerBtn);
  }
}

/** 📷 Render ảnh reader scroll/slide */
function renderImages(reader) {
  if (readerMode === "vertical") {
    currentImages.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Page ${index + 1}`;
      img.className = "scroll-img";
      img.loading = "lazy"; // ✅ lazy load từng ảnh
      img.addEventListener("click", toggleReaderUI);
      reader.appendChild(img);
    });
    setupScrollHandler();
  } else {
    const img = document.createElement("img");
    img.src = currentImages[currentPage];
    img.style.display = "block";
    reader.appendChild(img);
  }
}

/** 👆 Scroll ẩn/hiện UI */
function setupScrollHandler() {
  let lastScrollTop = 0;
  const scrollThreshold = 10;
  window.addEventListener("scroll", () => {
    const st = window.scrollY;
    const delta = st - lastScrollTop;
    if (Math.abs(delta) < scrollThreshold) return;
    delta > 0 ? hideReaderUI() : showReaderUI();
    lastScrollTop = st;
    updateReaderPageInfo(); // cập nhật số trang khi scroll
  });
}

/** 🧮 Cập nhật lại nút Trang X/Y */
function updateReaderPageInfo() {
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;

  if (readerMode === "horizontal") {
    pageInfo.textContent = `Trang ${currentPage + 1} / ${currentImages.length}`;
  } else {
    const imagesPerPage = 100;
    const totalPages = Math.ceil(currentImages.length / imagesPerPage);

    const scrollImgs = document.querySelectorAll(".scroll-img");
    let currentScrollPage = 0;
    for (let i = 0; i < scrollImgs.length; i++) {
      const rect = scrollImgs[i].getBoundingClientRect();
      if (rect.top > 100) {
        currentScrollPage = Math.floor(i / imagesPerPage);
        break;
      }
    }
    pageInfo.textContent = `Trang ${currentScrollPage + 1} / ${totalPages}`;
  }
}

/** ➡️ Trang tiếp */
function nextPage() {
  if (currentPage < currentImages.length - 1) {
    currentPage++;
    updatePage();
  }
}

/** ⬅️ Trang trước */
function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    updatePage();
  }
}

/** ⏩ Gắn nút Prev/Next chương */
function setupChapterNavigation() {
  const prevBtn = document.getElementById("prev-chapter-btn");
  const nextBtn = document.getElementById("next-chapter-btn");
  if (!prevBtn || !nextBtn) return;

  const newPrev = prevBtn.cloneNode(true);
  const newNext = nextBtn.cloneNode(true);

  prevBtn.parentNode.replaceChild(newPrev, prevBtn);
  nextBtn.parentNode.replaceChild(newNext, nextBtn);

  newPrev.onclick = () => moveChapter("prev");
  newNext.onclick = () => moveChapter("next");
}

/** 🔄 Chuyển chương tiếp theo hoặc trước */
function moveChapter(direction = "next") {
  const targetPath = getAdjacentChapterPath(direction);
  if (!targetPath) {
    alert(
      direction === "next"
        ? "🚫 Đây là chương cuối cùng!"
        : "🚫 Đây là chương đầu tiên!"
    );
    return;
  }

  const root = getRootFolder();
  if (!root) return;

  const cleanPath = targetPath.replace(/\/__self__$/, "");

  fetch(
    `/api/list-folder?root=${encodeURIComponent(
      root
    )}&path=${encodeURIComponent(cleanPath)}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.type === "reader" && data.images.length > 0) {
        state.currentPath = cleanPath;
        renderReader(data.images);
      } else if (data.type === "folder") {
        loadFolder(cleanPath);
      } else {
        alert("🚫 Không tìm thấy chương hợp lệ!");
      }
    })
    .catch((err) => {
      console.error("❌ Lỗi khi load chapter:", err);
      alert("🚫 Lỗi khi chuyển chương!");
    });
}

/** 🔍 Tìm chapter tiếp theo/trước */
function getAdjacentChapterPath(direction = "next") {
  const index = state.allFolders.findIndex(
    (f) =>
      f.path === state.currentPath || f.path === state.currentPath + "/__self__"
  );
  if (index === -1) return null;
  const targetIndex = direction === "next" ? index + 1 : index - 1;
  return state.allFolders[targetIndex]?.path || null;
}

/** 🔁 Cập nhật ảnh theo trang */
function updatePage() {
  const reader = document.querySelector(".reader img");
  if (reader) reader.src = currentImages[currentPage];
  updateReaderPageInfo();
}

/** 👆 Toggle UI */
function toggleReaderUI() {
  ["site-header", "reader-footer"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("hidden");
  });
}

/** 🔄 Đổi chế độ dọc/ngang */
export function toggleReaderMode() {
  readerMode = readerMode === "vertical" ? "horizontal" : "vertical";
  renderReader(currentImages);
}

/** 👆 Show UI */
function showReaderUI() {
  document.getElementById("site-header")?.classList.remove("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
}

/** 👇 Hide UI */
function hideReaderUI() {
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");
}

// 🖼️ Gọi hàm này từ bên ngoài để cập nhật số trang
function updateReaderPageInfoReal(
  currentPageParam = null,
  totalPagesParam = null
) {
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;

  if (readerMode === "horizontal") {
    const current =
      currentPageParam !== null ? currentPageParam : currentPage + 1;
    const total =
      totalPagesParam !== null ? totalPagesParam : currentImages.length;
    pageInfo.textContent = `Trang ${current} / ${total}`;
  } else {
    updateReaderPageInfo();
  }
}
/**
 * 🧩 Thiết lập lại click event cho Trang X/Y theo readerMode hiện tại
 * - vertical ➔ mở modal chọn page
 * - horizontal ➔ mở input nhập page
 */
function setupPageInfoClick() {
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;

  if (readerMode === "vertical") {
    // Scroll mode ➔ modal chọn page
    pageInfo.style.cursor = "pointer";
    pageInfo.onclick = () => showScrollPageModal();
  } else {
    // Horizontal mode ➔ mở input nhập page
    pageInfo.style.cursor = "text";
    pageInfo.onclick = () => showJumpPageInput();
  }
}
/**
 * 🧩 Show input nhỏ để nhập số trang (horizontal mode)
 * @returns {void}
 */
function showJumpPageInput() {
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;

  const totalPages = currentImages.length;

  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = totalPages;
  input.placeholder = "Nhập trang...";
  input.style.width = "60px";
  input.style.fontSize = "14px";
  input.style.textAlign = "center";

  pageInfo.innerHTML = "";
  pageInfo.appendChild(input);

  input.focus();

  input.onblur = input.onchange = () => {
    const page = parseInt(input.value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      currentPage = page - 1; // 🆕 Update biến currentPage GLOBAL reader.js
      if (typeof window.setHorizontalPage === "function") {
        window.setHorizontalPage(currentPage); // 🆕 Gửi luôn số mới qua reader-horizontal
      }
    }
    updateReaderPageInfo();
  };
}
