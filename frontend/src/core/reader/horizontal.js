import { toggleReaderUI,preloadAroundPage, updateReaderPageInfo } from "./utils.js";

/**
 * 📖 Horizontal/Swipe Mode Reader
 * @param {Array} images
 * @param {HTMLElement} container
 * @param {function} onPageChange - callback để sync lại currentPage bên reader chính
 * @param {number} initialPage
 * @returns {{ setCurrentPage: function }}
 */
export function renderHorizontalReader(
  images,
  container,
  onPageChange = () => {},
  initialPage = 0
) {
  let currentPage = initialPage;

  const img = document.createElement("img");
  img.src = images[currentPage];
  img.classList.add("loading");
  img.style.display = "block";
  container.appendChild(img);
  img.onload = () => img.classList.remove("loading");

  updateReaderPageInfo(currentPage + 1, images.length);
  preloadAroundPage(currentPage, images);

  // 🔁 Đổi ảnh
  function updateImage(index) {
    if (index < 0 || index >= images.length) return;
    currentPage = index;
    img.classList.add("loading");
    img.src = images[currentPage];
    img.onload = () => img.classList.remove("loading");
    updateReaderPageInfo(currentPage + 1, images.length);
    preloadAroundPage(currentPage, images);
    onPageChange(currentPage);
  }

  // 🖱️ Click trái/giữa/phải ảnh
  img.addEventListener("click", (e) => {
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) return updateImage(currentPage - 1);
    if (x > (rect.width * 2) / 3) return updateImage(currentPage + 1);
    toggleReaderUI();
  });

  // 🎹 Phím tắt
  document.onkeydown = (e) => {
    if (e.key === "ArrowRight") updateImage(currentPage + 1);
    if (e.key === "ArrowLeft") updateImage(currentPage - 1);
  };


  // 🧩 Cho phép set page từ bên ngoài
  function setCurrentPage(pageIndex) {
    updateImage(pageIndex);
  }

  return { setCurrentPage };
}
