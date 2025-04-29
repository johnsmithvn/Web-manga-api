// 📁 frontend/src/reader-scroll.js

/**
 * 📖 Scroll Mode Reader (phân trang ảnh lớn + lazy load từng nhóm)
 * @param {Array} images - danh sách toàn bộ ảnh trong chapter
 * @param {HTMLElement} container - DOM reader
 */
export function renderScrollReader(images, container) {
    const imagesPerPage = 200; // Mỗi page hiển thị tối đa 200 ảnh
    const lazyBatchSize = 50;  // Mỗi lần lazy load thêm 50 ảnh
    let currentPageIndex = 0;
  
    // Chia ảnh theo từng page (array các array)
    const totalPages = Math.ceil(images.length / imagesPerPage);
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(images.slice(i * imagesPerPage, (i + 1) * imagesPerPage));
    }
  
    // Khởi tạo container cho page hiện tại
    const pageWrapper = document.createElement("div");
    pageWrapper.className = "reader scroll-mode"; // ✅ đúng chuẩn CSS cũ
    container.appendChild(pageWrapper);
  
    // Hiện page đầu tiên
    renderScrollPage(pages[currentPageIndex], pageWrapper);
  
    // Gắn lại hành vi toggle UI khi click ảnh
    pageWrapper.addEventListener("click", toggleReaderUI);
  
    // Gắn scroll để lazy load ảnh từng batch
    setupScrollLazyLoad(pageWrapper, pages[currentPageIndex]);
  
    // Gắn xử lý click Trang X/Y ➝ modal chọn page
    const pageInfo = document.getElementById("page-info");
    if (pageInfo) {
      pageInfo.style.cursor = "pointer";
      pageInfo.onclick = () => showPageSelectModal();
      updateScrollPageInfo(currentPageIndex + 1, totalPages);
    }
  
    // ➕ Tạo modal chọn page + prev/next
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
      box.style.background = "white";
      box.style.padding = "20px";
      box.style.borderRadius = "10px";
      box.style.maxHeight = "80vh";
      box.style.overflowY = "auto";
      box.style.display = "grid";
      box.style.gridTemplateColumns = "repeat(auto-fit, minmax(60px, 1fr))";
      box.style.gap = "10px";
      box.style.maxWidth = "400px";
  
      for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = `${i + 1}`;
        btn.onclick = () => {
          currentPageIndex = i;
          pageWrapper.innerHTML = "";
          renderScrollPage(pages[currentPageIndex], pageWrapper);
          setupScrollLazyLoad(pageWrapper, pages[currentPageIndex]);
          updateScrollPageInfo(currentPageIndex + 1, totalPages);
          modal.remove();
          scrollToReader(pageWrapper); // 🆕 thêm dòng này

        };
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
        if (currentPageIndex > 0) {
          currentPageIndex--;
          pageWrapper.innerHTML = "";
          renderScrollPage(pages[currentPageIndex], pageWrapper);
          setupScrollLazyLoad(pageWrapper, pages[currentPageIndex]);
          updateScrollPageInfo(currentPageIndex + 1, totalPages);
          modal.remove();
          scrollToReader(pageWrapper); // 🆕 thêm dòng này

        }
      };
      next.onclick = () => {
        if (currentPageIndex < totalPages - 1) {
          currentPageIndex++;
          pageWrapper.innerHTML = "";
          renderScrollPage(pages[currentPageIndex], pageWrapper);
          setupScrollLazyLoad(pageWrapper, pages[currentPageIndex]);
          updateScrollPageInfo(currentPageIndex + 1, totalPages);
          modal.remove();
          scrollToReader(pageWrapper); // 🆕 thêm dòng này

        }
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
  }
  
  // 🧩 Render 1 page ảnh vào wrapper
  function renderScrollPage(imageList, wrapper) {
    wrapper.innerHTML = "";
    for (let i = 0; i < Math.min(imageList.length, 50); i++) {
      const img = document.createElement("img");
      img.src = imageList[i];
      img.className = "scroll-img loading"; // ➔ thêm class "loading"
      img.loading = "lazy";
      img.onload = () => img.classList.remove("loading"); // ➔ khi load xong thì gỡ "loading"
      wrapper.appendChild(img);
      
    }
  }
  
  // 🔃 Scroll lazy load thêm 50 ảnh 1 lần
  function setupScrollLazyLoad(wrapper, images) {
    let loadedCount = wrapper.children.length;
    window.onscroll = () => {
      const lastImg = wrapper.lastElementChild;
      if (!lastImg) return;
      const rect = lastImg.getBoundingClientRect();
      if (rect.bottom < window.innerHeight + 300) {
        const toLoad = images.slice(loadedCount, loadedCount + 50);
        for (const src of toLoad) {
          const img = document.createElement("img");
          img.src = src;
          img.className = "scroll-img";
          img.loading = "lazy";
          wrapper.appendChild(img);
        }
        loadedCount += toLoad.length;
      }
    };
  }
  
  // 🧮 Cập nhật Trang X/Y scroll mode
  function updateScrollPageInfo(current, total) {
    const pageInfo = document.getElementById("page-info");
    if (pageInfo) pageInfo.textContent = `Trang ${current} / ${total}`;
  }
  
  // 🖱 Toggle header/footer UI khi click ảnh
  function toggleReaderUI() {
    ["site-header", "reader-footer"].forEach((id) => {
      document.getElementById(id)?.classList.toggle("hidden");
    });
  }

  function scrollToReader(pageWrapper) {
    const rect = pageWrapper.getBoundingClientRect();
    const offsetTop = rect.top + window.scrollY;
    window.scrollTo({
      top: offsetTop,
      behavior: 'instant' // hoặc 'smooth' nếu mày muốn mượt
    });
  }
  