// 📁 frontend/src/reader.js

import { state, loadFolder } from "./folder.js"; // ✅ Import đúng: state + loadFolder
import { getRootFolder } from "./storage.js";

export let currentImages = [];
let currentPage = 0;
let readerMode = "horizontal"; // "horizontal" hoặc "vertical"

/**
 * 📖 Render giao diện reader mode (main)
 * @param {Array} images - Danh sách ảnh
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
  renderImages(reader);
  setupReaderNavigation(reader);
  setupChapterNavigation();

  app.appendChild(reader);
  updateReaderPageInfo();
}

/**
 * 📈 Thiết lập UI khi vào chế độ đọc
 */
function setupReaderUI() {
  document.body.classList.add("reader-mode");
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("main-footer")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");
}

/**
 * 📖 Thêm nút đổi chế độ đọc nếu chưa có
 */
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

/**
 * 📷 Render danh sách ảnh trong reader
 */
function renderImages(reader) {
  if (readerMode === "vertical") {
    currentImages.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Page ${index + 1}`;
      img.className = "scroll-img";
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

/**
 * 👆 Ẩn/hiện header/footer khi cuộn
 */
function setupScrollHandler() {
  let lastScrollTop = 0;
  const scrollThreshold = 10;

  window.addEventListener("scroll", () => {
    const st = window.scrollY;
    const delta = st - lastScrollTop;
    if (Math.abs(delta) < scrollThreshold) return;
    delta > 0 ? hideReaderUI() : showReaderUI();
    lastScrollTop = st;
  });
}

/**
 * 🛋 Swipe, bàn phím, click trái/phải để đổi trang
 */
function setupReaderNavigation(reader) {
  if (readerMode === "horizontal") {
    const hammer = new Hammer(reader);
    hammer.on("swipeleft", nextPage);
    hammer.on("swiperight", prevPage);

    document.onkeydown = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };

    const img = reader.querySelector("img");
    img?.addEventListener("click", (e) => {
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width / 3) return prevPage();
      if (clickX > (rect.width * 2) / 3) return nextPage();
      toggleReaderUI();
    });
  }
}

/**
 * ⏩ Gắn nút Prev/Next chương
 */
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

/**
 * 🔄 Chuyển chương tiếp theo hoặc chương trước
 */
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
        state.currentPath = cleanPath; // ✅ update đúng
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

/**
 * 🔎 Lấy path của chapter tiếp theo hoặc trước
 */
function getAdjacentChapterPath(direction = "next") {
  const index = state.allFolders.findIndex(
    (f) =>
      f.path === state.currentPath || f.path === state.currentPath + "/__self__"
  );
  if (index === -1) return null;

  const targetIndex = direction === "next" ? index + 1 : index - 1;
  return state.allFolders[targetIndex]?.path || null;
}

/**
 * 🧮 Update số trang trong footer
 */
function updateReaderPageInfo() {
  const pageInfo = document.getElementById("page-info");
  if (pageInfo) {
    pageInfo.textContent = `Trang ${currentPage + 1} / ${currentImages.length}`;
  }
}

/**
 * ➡️ Chuyển tới trang tiếp theo
 */
function nextPage() {
  if (currentPage < currentImages.length - 1) {
    currentPage++;
    updatePage();
  }
}

/**
 * ⬅️ Quay lại trang trước
 */
function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    updatePage();
  }
}

/**
 * 🔁 Cập nhật ảnh khi đổi trang
 */
function updatePage() {
  const reader = document.querySelector(".reader img");
  if (reader) reader.src = currentImages[currentPage];
  updateReaderPageInfo();
}

/**
 * 👆 Toggle hiển thị header/footer
 */
function toggleReaderUI() {
  ["site-header", "reader-footer"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("hidden");
  });
}

/**
 * 🔄 Đổi chế độ đọc scroll <-> swipe
 */
export function toggleReaderMode() {
  readerMode = readerMode === "vertical" ? "horizontal" : "vertical";
  renderReader(currentImages);
}

/**
 * 👆 Show Reader UI
 */
function showReaderUI() {
  document.getElementById("site-header")?.classList.remove("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
}

/**
 * 👇 Hide Reader UI
 */
function hideReaderUI() {
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");
}
