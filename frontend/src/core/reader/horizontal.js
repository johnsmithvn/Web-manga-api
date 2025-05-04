import {
  toggleReaderUI,
  preloadAroundPage,
  updateReaderPageInfo,
} from "./utils.js";

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

  const img = createImageElement(images[currentPage]);
  container.appendChild(img);

  enableSwipeGesture(
    container,
    () => updateImage(currentPage + 1),
    () => updateImage(currentPage - 1)
  );

  updateReaderPageInfo(currentPage + 1, images.length);
  preloadAroundPage(currentPage, images);

  // Gộp xử lý click và keyboard
  setupReaderInteraction(img, () => updateImage(currentPage + 1), () => updateImage(currentPage - 1));

  function updateImage(index) {
    updateReaderImage({
      index,
      images,
      img,
      onPageChange,
      onIndexChange: (i) => (currentPage = i),
    });
  }

  function setCurrentPage(pageIndex) {
    updateImage(pageIndex);
  }

  return { setCurrentPage };
}

function createImageElement(src) {
  const img = document.createElement("img");
  img.src = src;
  img.classList.add("loading");
  img.style.display = "block";
  img.onload = () => img.classList.remove("loading");
  return img;
}

function setupReaderInteraction(img, onNext, onPrev) {
  // 🖱️ Click trái/giữa/phải ảnh
  img.addEventListener("click", (e) => {
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) return onPrev();
    if (x > (rect.width * 2) / 3) return onNext();
    toggleReaderUI();
  });

  // 🎹 Phím tắt
  document.onkeydown = (e) => {
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft") onPrev();
  };
}

function updateReaderImage({ index, images, img, onPageChange, onIndexChange }) {
  if (index < 0 || index >= images.length) return;
  onIndexChange(index);
  img.classList.add("loading");
  img.src = images[index];
  img.onload = () => img.classList.remove("loading");
  updateReaderPageInfo(index + 1, images.length);
  preloadAroundPage(index, images);
  onPageChange(index);
}


/**
 * 📱 Bắt gesture swipe trái/phải đơn giản không cần thư viện
 * @param {HTMLElement} container
 * @param {function} onSwipeLeft
 * @param {function} onSwipeRight
 */
function enableSwipeGesture(container, onSwipeLeft, onSwipeRight) {
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
    }
  });

  container.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
  });
}
