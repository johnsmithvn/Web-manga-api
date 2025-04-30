// 📁 frontend/src/reader-scroll.js
import { toggleReaderUI } from "./ui.js";

const imagesPerPage = 200; // Mỗi page hiển thị tối đa 200 ảnh
const lazyBatchSize = 50; // Mỗi lần lazy load thêm 50 ảnh

/**
 * 📖 Scroll Mode Reader (phân trang ảnh lớn + lazy load từng nhóm)
 * @param {Array} images - danh sách toàn bộ ảnh trong chapter
 * @param {HTMLElement} container - DOM reader
 * @param {number} currentPageIndex - page hiện tại
 * @param {function} onImageChange - callback khi ảnh thay đổi (gán currentPage)
 */
export function renderScrollReader(
  images,
  container,
  currentPageIndex = 0,
  onImageChange = () => {}
) {
  console.log("🔍 ScrollPage Index:", currentPageIndex);

  const totalPages = Math.ceil(images.length / imagesPerPage);
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(images.slice(i * imagesPerPage, (i + 1) * imagesPerPage));
  }

  const pageWrapper = document.createElement("div");
  pageWrapper.className = "reader scroll-mode";
  container.appendChild(pageWrapper);

  // Hiện page đầu tiên
  renderScrollPage(pages[currentPageIndex], pageWrapper);
  // 🧠 Cập nhật ngay sau render để đảm bảo currentPage đúng (kể cả chưa scroll)
  updateCurrentImageCount(
    pageWrapper,
    pages[currentPageIndex],
    images,
    currentPageIndex,
    onImageChange
  );
  // ✅ Gọi update ngay lần đầu render (không chờ scroll)
  requestAnimationFrame(() => {
    setTimeout(() => {
      updateCurrentImageCount(
        pageWrapper,
        pages[currentPageIndex],
        images,
        currentPageIndex,
        onImageChange
      );
    }, 0); // ✅ delay thêm 1 vòng event loop
  });

  pageWrapper.addEventListener("click", toggleReaderUI);

  setupScrollLazyLoad(
    pageWrapper,
    pages[currentPageIndex],
    lazyBatchSize,
    currentPageIndex,
    images,
    onImageChange
  );

  const pageInfo = document.getElementById("page-info");
  if (pageInfo) {
    pageInfo.style.cursor = "pointer";
    pageInfo.onclick = () => showPageSelectModal();
    updateScrollPageInfo(currentPageIndex + 1, totalPages);
  }

  /**
   * 🧩 Giao diện chọn page dạng modal (cho scroll mode)
   */
  function showPageSelectModal() {
    const modal = document.createElement("div");
    modal.className = "scroll-page-modal";
    Object.assign(modal.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      maxHeight: "80vh",
      overflowY: "auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
      gap: "10px",
      maxWidth: "400px",
    });

    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = `${i + 1}`;
      btn.onclick = () => switchScrollPage(i);
      box.appendChild(btn);
    }

    const nav = document.createElement("div");
    nav.style.textAlign = "center";
    nav.style.marginTop = "12px";

    const prev = document.createElement("button");
    const next = document.createElement("button");
    prev.textContent = "⬅ Prev";
    next.textContent = "Next ➡";

    prev.onclick = () => {
      if (currentPageIndex > 0) switchScrollPage(currentPageIndex - 1);
    };
    next.onclick = () => {
      if (currentPageIndex < totalPages - 1)
        switchScrollPage(currentPageIndex + 1);
    };

    nav.appendChild(prev);
    nav.appendChild(next);

    const wrapper = document.createElement("div");
    wrapper.appendChild(box);
    wrapper.appendChild(nav);
    modal.appendChild(wrapper);

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  }

  /**
   * 🔁 Thay đổi trang scroll hiện tại (gộp logic dùng lại nhiều chỗ)
   */
  function switchScrollPage(index) {
    currentPageIndex = index;
    pageWrapper.innerHTML = "";
    renderScrollPage(pages[currentPageIndex], pageWrapper);
    setupScrollLazyLoad(
      pageWrapper,
      pages[currentPageIndex],
      lazyBatchSize,
      currentPageIndex,
      images,
      onImageChange
    );
    updateScrollPageInfo(currentPageIndex + 1, totalPages);
    scrollToReader(pageWrapper);
  }
}

/**
 * 🖼️ Render ảnh trong 1 page scroll
 */
function renderScrollPage(imageList, wrapper) {
  wrapper.innerHTML = "";
  for (let i = 0; i < imageList.length; i++) {
    const img = document.createElement("img");
    img.src = imageList[i];
    img.className = "scroll-img loading";
    img.loading = "lazy";
    img.onload = () => img.classList.remove("loading");
    wrapper.appendChild(img);
  }
  console.log("📸 Rendering", imageList.length, "images on this scroll page");

}

/**
 * 🐢 Lazy load ảnh khi user scroll gần cuối
 */
function setupScrollLazyLoad(
  wrapper,
  imagesInPage,
  lazyBatchSize,
  currentScrollPage,
  fullImages,
  onImageChange = () => {}
) {
  const getLoadedCount = () => wrapper.querySelectorAll("img").length;

  window.onscroll = () => {
    const lastImg = wrapper.lastElementChild;
    if (!lastImg) return;
    const rect = lastImg.getBoundingClientRect();
    if (rect.bottom < window.innerHeight + 300) {
      const alreadyLoaded = getLoadedCount();
      const toLoad = imagesInPage.slice(
        alreadyLoaded,
        alreadyLoaded + lazyBatchSize
      );
      for (const src of toLoad) {
        const img = document.createElement("img");
        img.src = src;
        img.className = "scroll-img";
        img.loading = "lazy";
        wrapper.appendChild(img);
      }
    }

    updateCurrentImageCount(
      wrapper,
      imagesInPage,
      fullImages,
      currentScrollPage,
      onImageChange
    );
  };
}

function updateScrollPageInfo(current, total) {
  const pageInfo = document.getElementById("page-info");
  if (pageInfo) pageInfo.textContent = `Trang ${current} / ${total}`;
}

function scrollToReader(pageWrapper) {
  const rect = pageWrapper.getBoundingClientRect();
  const offsetTop = rect.top + window.scrollY;
  window.scrollTo({ top: offsetTop, behavior: "instant" });
}

/**
 * 🧮 Tính ảnh gần tâm màn hình nhất để sync currentPage
 */
function updateCurrentImageCount(
  wrapper,
  imagesInPage,
  fullImages = [],
  currentScrollPage = 0,
  onImageChange = () => {}
) {
  if (!fullImages || !Array.isArray(fullImages)) return;

  const imgElements = wrapper.querySelectorAll(".scroll-img");
  const totalImages = fullImages.length;

  // 🆕 Tìm ảnh gần trung tâm nhất
  let minDistance = Infinity;
  let nearestIndex = 0;

  const screenCenter = window.innerHeight / 2;

  for (let i = 0; i < imgElements.length; i++) {
    const rect = imgElements[i].getBoundingClientRect();
    const imgCenter = rect.top + rect.height / 2;
    const distance = Math.abs(imgCenter - screenCenter);

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  const globalIndex = currentScrollPage * imagesPerPage + nearestIndex;
  const loadedCount = imgElements.length;

  const countInfo = document.getElementById("image-count-info");
  if (countInfo && !isNaN(globalIndex)) {
    countInfo.textContent = `Ảnh ${
      globalIndex + 1
    } / ${totalImages} (Hiện: ${loadedCount})`;
    onImageChange(globalIndex); // ✅ Gọi về reader.js để sync currentPage
  }
}
