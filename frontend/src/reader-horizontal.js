// 📁 frontend/src/reader-horizontal.js
import { toggleReaderUI } from "./ui.js";

/**
 * 📖 Horizontal/Swipe Mode Reader
 * @param {Array} images - danh sách ảnh
 * @param {HTMLElement} container - DOM reader
 * @param {function} updatePageInfo - callback để cập nhật Trang X/Y
 * @param {number} initialPage - trang khởi đầu (default 0)
 * @returns {{ setCurrentPage: function }}
 */
export function renderHorizontalReader(
  images,
  container,
  updatePageInfo,
  initialPage = 0,
  onPageChange = () => {}
) {
  let currentPage = initialPage; // 🆕 set đúng trang ban đầu

  const img = document.createElement("img");
  img.src = images[currentPage];
  img.style.display = "block";
  img.classList.add("loading");

  container.appendChild(img);
  img.onload = () => img.classList.remove("loading");

  // Cập nhật trang ban đầu
  updatePageInfo(currentPage + 1, images.length);

  // Swipe bằng Hammer.js
  const hammer = new Hammer(container);
  hammer.on("swipeleft", () => updateImage(currentPage + 1));
  hammer.on("swiperight", () => updateImage(currentPage - 1));

  // Keyboard support
  document.onkeydown = (e) => {
    if (e.key === "ArrowRight") updateImage(currentPage + 1);
    if (e.key === "ArrowLeft") updateImage(currentPage - 1);
  };

  // Click trái/phải ảnh để điều hướng
  img.addEventListener("click", (e) => {
    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 3) return updateImage(currentPage - 1);
    if (clickX > (rect.width * 2) / 3) return updateImage(currentPage + 1);
    toggleReaderUI();
  });

  /**
   * 🖼️ Cập nhật ảnh hiện tại và preload xung quanh
   */
  function updateImage(index) {
    if (index < 0 || index >= images.length) return;
    currentPage = index;
    img.classList.add("loading");
    img.src = images[currentPage];
    updatePageInfo(currentPage + 1, images.length);
    preloadAroundCurrentPage(currentPage, images); // 🆕 preload 10 ảnh xung quanh
    onPageChange(currentPage); // ✅ Trả page về cho reader.js

  }

  /**
   * 🔁 Cho phép bên ngoài thay đổi trang (ví dụ khi đổi chế độ đọc)
   */
  function setCurrentPage(page) {
    updateImage(page);
  }

  return { setCurrentPage }; // 🆕 Return hàm cho ngoài dùng
}

/**
 * ⚡ Preload ảnh gần trang hiện tại để tăng tốc load khi chuyển
 */
function preloadAroundCurrentPage(currentPage, images, range = 10) {
  const start = Math.max(0, currentPage - range);
  const end = Math.min(images.length - 1, currentPage + range);

  for (let i = start; i <= end; i++) {
    if (i === currentPage) continue; // bỏ qua trang hiện tại đã load
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = images[i];
    if (
      !document.head.querySelector(`link[rel="preload"][href="${images[i]}"]`)
    ) {
      document.head.appendChild(link);
    }
  }
}
