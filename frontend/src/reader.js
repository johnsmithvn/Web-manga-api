// 📁 frontend/src/reader.js

import { state, loadFolder } from "./folder.js";
import { getRootFolder } from "./storage.js";

export let currentImages = [];
let currentPage = 0;
let readerMode = "horizontal"; // "horizontal" hoặc "vertical"

/**
 * 📖 Render giao diện reader mode (main)
 */

export function renderReader(
  images,
  preserveCurrentPage = false,
  scrollPage = 0
) {
  currentImages = images;
  // 🧠 Đừng reset currentPage nếu đang ở horizontal mode (đã tính sẵn bên toggle)
  if (!preserveCurrentPage) {
    currentPage = 0;
  }

  const app = document.getElementById("app");
  app.innerHTML = "";

  const reader = document.createElement("div");
  reader.className = "reader";
  reader.classList.toggle("scroll-mode", readerMode === "vertical");

  setupReaderUI();
  setupReaderModeButton();

  if (readerMode === "vertical") {
    import("./reader-scroll.js").then(({ renderScrollReader }) => {
      // ✅ truyền page đúng
      renderScrollReader(images, reader, scrollPage, (newPage) => {
        currentPage = newPage; // 🧠 Cập nhật biến toàn cục ở đây
      });
    });
  } else {
    import("./reader-horizontal.js").then(({ renderHorizontalReader }) => {
      const { setCurrentPage } = renderHorizontalReader(
        images,
        reader,
        updateReaderPageInfoReal,
        currentPage,
        (page) => {
          currentPage = page; // ✅ Nhận lại page đúng từ reader-horizontal.js
        }
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

/** 🧮 Cập nhật lại nút Trang X/Y */
function updateReaderPageInfo() {
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;

  if (readerMode === "horizontal") {
    pageInfo.textContent = `Trang ${currentPage + 1} / ${currentImages.length}`;
  }
  // scroll-mode nên để reader-scroll.js tự update
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

/** 🔄 Đổi chế độ dọc/ngang */
export function toggleReaderMode() {
  let scrollPage = 0;

  if (readerMode === "vertical") {
    // Scroll ➜ Single
    const countInfo = document.getElementById("image-count-info");
    if (countInfo) {
      const match = countInfo.textContent.match(/Ảnh (\d+)/); // 🧠 regex tách số ảnh
      if (match) {
        currentPage = parseInt(match[1], 10) - 1; // 🧠 cập nhật currentPage
      }
    }
    readerMode = "horizontal";
  } else {
    const imagesPerPage = 200; // Số ảnh tối đa trên 1 page scroll
    // Single ➜ Scroll
    scrollPage = Math.floor(currentPage / imagesPerPage);
    readerMode = "vertical";
  }
  // 🧠 Gọi lại set page đúng ảnh sau khi render xong
  renderReader(currentImages, true, scrollPage); // ✅ chỉ gọi 1 lần
  // ✅ Delay để chắc chắn window.setHorizontalPage đã được gán xong
  setTimeout(() => {
    if (typeof window.setHorizontalPage === "function") {
      window.setHorizontalPage(currentPage);
    }
  }, 0);
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
