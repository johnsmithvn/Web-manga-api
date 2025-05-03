import { state, loadFolder } from "/src/core/folder.js";
import { getRootFolder } from "/src/core/storage.js";
import { updateReaderPageInfo, showJumpPageInput } from "./utils.js";
import { saveRecentViewed } from "/src/core/ui.js";

let currentImages = [];
let currentPage = 0;
let readerMode = "horizontal"; // or "vertical"
let controller = null; // object: { setCurrentPage(page) }

/**
 * 📖 Gọi từ reader.html – render chế độ đọc
 */
export function renderReader(
  images,
  preserveCurrentPage = false,
  scrollPage = 0
) {
  // tang view
  const urlParams = new URLSearchParams(window.location.search);
  const path = urlParams.get("path");

  const parts = path.split("/");
  const folderName = parts[parts.length - 1] || "Xem ảnh";

  saveRecentViewed({
    name: folderName,
    path,
    thumbnail: images[0] || null,
  });

  fetch("/api/increase-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });

  //
  currentImages = images;
  if (!preserveCurrentPage) currentPage = 0;

  const app = document.getElementById("app");
  app.innerHTML = "";

  const reader = document.createElement("div");
  reader.className = "reader";
  reader.classList.toggle("scroll-mode", readerMode === "vertical");

  setupReaderUI();
  setupReaderModeButton();
  setupPageInfoClick();
  setupChapterNavigation();

  // Import dynamic mode
  const load =
    readerMode === "vertical"
      ? import("./scroll.js")
      : import("./horizontal.js");

  load.then(({ renderScrollReader, renderHorizontalReader }) => {
    const renderFn =
      readerMode === "vertical" ? renderScrollReader : renderHorizontalReader;
    controller = renderFn(
      images,
      reader,
      (newPage) => {
        currentPage = newPage;
      },
      readerMode === "vertical" ? scrollPage : currentPage
    );
  });

  app.appendChild(reader);
  updateReaderPageInfo(currentPage + 1, currentImages.length);
}

/**
 * 🧩 Setup ban đầu khi vào reader
 */
function setupReaderUI() {
  document.body.classList.add("reader-mode");
  document.getElementById("site-header")?.classList.remove("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
}

/**
 * 🧩 Gắn nút đổi chế độ đọc 📖
 */
function setupReaderModeButton() {
  const box = document.querySelector(".header-icons");
  if (!box || document.getElementById("readerModeButton")) return;

  const btn = document.createElement("button");
  btn.id = "readerModeButton";
  btn.textContent = "📖";
  btn.onclick = toggleReaderMode;
  box.appendChild(btn);
}

/**
 * 🔁 Toggle giữa scroll/horizontal
 */
export function toggleReaderMode() {
  let scrollPage = 0;

  if (readerMode === "vertical") {
    // scroll ➜ horizontal
    const count = document.getElementById("image-count-info");
    const match = count?.textContent?.match(/Ảnh (\d+)/);
    if (match) currentPage = parseInt(match[1]) - 1;
    readerMode = "horizontal";
  } else {
    // horizontal ➜ scroll
    scrollPage = Math.floor(currentPage / 200);
    readerMode = "vertical";
  }

  renderReader(currentImages, true, scrollPage);

  // delay set lại trang
  setTimeout(() => {
    if (controller?.setCurrentPage) {
      controller.setCurrentPage(currentPage);
    }
  }, 0);
}

/**
 * ⏩ Nút Next/Prev chapter
 */
function setupChapterNavigation() {
  const prevBtn = document.getElementById("prev-chapter-btn");
  const nextBtn = document.getElementById("next-chapter-btn");
  if (!prevBtn || !nextBtn) return;

  prevBtn.onclick = () => moveChapter("prev");
  nextBtn.onclick = () => moveChapter("next");
}

function moveChapter(direction = "next") {
  const targetPath = getAdjacentChapterPath(direction);
  if (!targetPath) {
    alert(direction === "next" ? "🚫 Hết chương!" : "🚫 Đây là chương đầu!");
    return;
  }

  const root = getRootFolder();
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
        alert("❌ Không tìm thấy chương!");
      }
    })
    .catch((err) => {
      console.error("❌ Lỗi load chapter:", err);
      alert("❌ Không thể chuyển chương!");
    });
}

function getAdjacentChapterPath(direction = "next") {
  const index = state.allFolders.findIndex(
    (f) =>
      f.path === state.currentPath || f.path === state.currentPath + "/__self__"
  );
  if (index === -1) return null;
  const target = direction === "next" ? index + 1 : index - 1;
  return state.allFolders[target]?.path || null;
}

/**
 * 🧩 Click vào Trang X/Y để chuyển nhanh
 */
function setupPageInfoClick() {
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;

  pageInfo.onclick = () => {
    if (readerMode === "vertical") return; // scroll mode có modal riêng
    showJumpPageInput(currentPage, currentImages.length, (newPage) => {
      currentPage = newPage;
      if (controller?.setCurrentPage) {
        controller.setCurrentPage(newPage);
      }
    });
  };
}
