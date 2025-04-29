// 📁 frontend/src/reader-horizontal.js

/**
 * 📖 Horizontal/Swipe Mode Reader
 * @param {Array} images - danh sách ảnh
 * @param {HTMLElement} container - DOM reader
 * @param {function} updatePageInfo - callback để cập nhật Trang X/Y
 */
export function renderHorizontalReader(images, container, updatePageInfo) {
  let currentPage = 0;

  const img = document.createElement("img");
  img.src = images[currentPage];
  img.style.display = "block";

  container.appendChild(img);
  img.onload = () => {
    img.classList.remove("loading");
  };

  updatePageInfo(currentPage + 1, images.length);

  const hammer = new Hammer(container);
  hammer.on("swipeleft", () => nextPage());
  hammer.on("swiperight", () => prevPage());

  document.onkeydown = (e) => {
    if (e.key === "ArrowRight") nextPage();
    if (e.key === "ArrowLeft") prevPage();
  };

  img.addEventListener("click", (e) => {
    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 3) return prevPage();
    if (clickX > (rect.width * 2) / 3) return nextPage();
    toggleReaderUI();
  });

  function nextPage() {
    if (currentPage < images.length - 1) {
      currentPage++;
      img.classList.add("loading");
      img.src = images[currentPage];
      updatePageInfo(currentPage + 1, images.length);
      preloadAroundCurrentPage(currentPage, images); // 🆕 preload 10 ảnh xung quanh

    }
  }

  function prevPage() {
    if (currentPage > 0) {
      currentPage--;
      img.classList.add("loading");
      img.src = images[currentPage];
      updatePageInfo(currentPage + 1, images.length);
      preloadAroundCurrentPage(currentPage, images); // 🆕 preload 10 ảnh xung quanh

    }
  }
  function setCurrentPage(page) {
    if (page >= 0 && page < images.length) {
      currentPage = page;
      img.classList.add("loading");
      img.src = images[currentPage];
      updatePageInfo(currentPage + 1, images.length);
      preloadAroundCurrentPage(currentPage, images); // 🆕 preload 10 ảnh xung quanh

    }
  }

  return { setCurrentPage }; // 🆕 Return hàm setCurrentPage
}

// 🖱 Toggle header/footer UI khi click ảnh
function toggleReaderUI() {
  ["site-header", "reader-footer"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("hidden");
  });
}


function preloadAroundCurrentPage(currentPage, images, range = 10) {
  const start = Math.max(0, currentPage - range);
  const end = Math.min(images.length - 1, currentPage + range);

  for (let i = start; i <= end; i++) {
    if (i === currentPage) continue; // bỏ qua trang hiện tại đã load
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = images[i];
    if (!document.head.querySelector(`link[rel="preload"][href="${images[i]}"]`)) {
      document.head.appendChild(link);
    }
  }
}
