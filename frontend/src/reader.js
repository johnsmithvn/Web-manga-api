// 📁 frontend/src/reader.js
import { allFolders, currentPath } from "./folder.js";

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

  // ✅ Khi vào reader: ẩn UI chính, hiện reader mode
  document.body.classList.add("reader-mode");
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("main-footer")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");

  if (readerMode === "vertical") {
    // 📜 Scroll mode: hiển thị toàn bộ ảnh
    images.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Page ${index + 1}`;
      img.className = "scroll-img";

      // ✅ Click ảnh để toggle UI đồng bộ
      img.addEventListener("click", () => toggleReaderUI());
      reader.appendChild(img);
    });

    // ✅ Scroll để ẩn/hiện UI
    let lastScrollTop = 0;
    const scrollThreshold = 10;

    window.addEventListener("scroll", () => {
      const st = window.scrollY;
      const delta = st - lastScrollTop;

      if (Math.abs(delta) < scrollThreshold) return;

      if (delta > 0) {
        // Cuộn xuống → ẩn
        hideReaderUI();
      } else {
        // Cuộn lên → hiện
        showReaderUI();
      }

      lastScrollTop = st;
    });
  } else {
    // 📖 Swipe mode: chỉ hiện 1 ảnh
    const img = document.createElement("img");
    img.src = currentImages[currentPage];
    img.style.display = "block";
    reader.appendChild(img);

    // đếm trang luôn hiện
    // const pageIndicator = document.createElement("div");
    // pageIndicator.className = "page-indicator";
    // pageIndicator.textContent = `Trang ${currentPage + 1} / ${
    //   currentImages.length
    // }`;
    // reader.appendChild(pageIndicator);

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
      const isLeft = clickX < rect.width / 3;
      const isRight = clickX > (rect.width * 2) / 3;

      if (isLeft) return prevPage();
      if (isRight) return nextPage();

      // ✅ Click giữa ảnh → toggle UI
      toggleReaderUI();
    });
  }

  // ✅ Hiện đúng số trang ban đầu
  updateReaderPageInfo();

  // ✅ Nút Prev Chapter
document.getElementById("prev-chapter-btn")?.addEventListener("click", () => {
  const prevPath = getAdjacentChapterPath("prev");
  if (prevPath) {
    window.loadFolder(prevPath); // ← Chuyển sang chương trước
  } else {
    alert("🚫 Đây là chương đầu tiên!");
  }
});

// ✅ Nút Next Chapter
document.getElementById("next-chapter-btn")?.addEventListener("click", () => {
  const nextPath = getAdjacentChapterPath("next");
  if (nextPath) {
    window.loadFolder(nextPath); // ← Chuyển sang chương kế tiếp
  } else {
    alert("🚫 Không có chương tiếp theo!");
  }
});


  app.appendChild(reader);
}
/**
 * 🔁 Toggle hiển thị UI (header + footer reader)
 * Dùng khi click giữa ảnh hoặc chạm trong reader
 */
function toggleReaderUI() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("reader-footer");

  // Kiểm tra xem header hiện tại có đang bị ẩn không
  const isHidden = header?.classList.contains("hidden");

  if (isHidden) {
    // 👉 Nếu đang ẩn thì hiện lại cả header và footer
    header?.classList.remove("hidden");
    footer?.classList.remove("hidden");
  } else {
    // 👉 Nếu đang hiện thì ẩn cả hai
    header?.classList.add("hidden");
    footer?.classList.add("hidden");
  }
}

/**
 * 👆 Hiện lại UI reader (header + reader footer)
 * Dùng khi cuộn lên trong chế độ scroll
 */
function showReaderUI() {
  document.getElementById("site-header")?.classList.remove("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
}

/**
 * 👇 Ẩn UI reader (header + reader footer)
 * Dùng khi cuộn xuống trong chế độ scroll
 */
function hideReaderUI() {
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");
}

/**
 * 📄 Cập nhật số trang hiện tại
 * Gọi lại sau khi đổi trang (next/prev) hoặc render ban đầu
 */
function updateReaderPageInfo() {
  const pageIndicator = document.querySelector(".page-indicator"); // phần trên ảnh (swipe mode)
  const pageInfo = document.getElementById("page-info"); // phần dưới footer reader

  if (pageIndicator) {
    pageIndicator.textContent = `Trang ${currentPage + 1} / ${
      currentImages.length
    }`;
  }

  if (pageInfo) {
    pageInfo.textContent = `Trang ${currentPage + 1} / ${currentImages.length}`;
  }
}

function updatePage() {
  const reader = document.querySelector(".reader");
  const img = reader?.querySelector("img");
  if (img) img.src = currentImages[currentPage];

  // đém trang luôn hiện
  // const pageIndicator = document.querySelector(".page-indicator");
  // if (pageIndicator) {
  //   pageIndicator.textContent = `Trang ${currentPage + 1} / ${
  //     currentImages.length
  //   }`;
  // }

  const pageInfo = document.getElementById("page-info");
  if (pageInfo) {
    pageInfo.textContent = `Trang ${currentPage + 1} / ${currentImages.length}`;
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

/**
 * 🔁 Đổi chế độ đọc ngang <-> dọc
 */
export function toggleReaderMode() {
  readerMode = readerMode === "vertical" ? "horizontal" : "vertical";
  renderReader(currentImages);
}

/**
 * 📚 Tìm chương kế tiếp hoặc trước đó dựa trên currentPath
 * @param {"next"|"prev"} direction
 */
function getAdjacentChapterPath(direction = "next") {
  const index = allFolders.findIndex(
    (f) => f.path === currentPath || f.path === currentPath + "/__self__"
  );
  if (index === -1) return null;

  const targetIndex = direction === "next" ? index + 1 : index - 1;
  if (targetIndex >= 0 && targetIndex < allFolders.length) {
    return allFolders[targetIndex].path;
  }

  return null;
}
