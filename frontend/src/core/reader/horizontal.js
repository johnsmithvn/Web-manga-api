import {
  toggleReaderUI,
  preloadAroundPage,
  updateReaderPageInfo,
} from "./utils.js";

/**
 * 📖 Horizontal/Swipe Mode Reader – Virtual Slide + Zoom + Preload
 */
export function renderHorizontalReader(
  images,
  container,
  onPageChange = () => {},
  initialPage = 0
) {
  if (!images || images.length === 0) return;
  console.log("✅ Swiper version:", window.Swiper?.version);

  container.innerHTML = "";
  container.classList.add("reader");

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";
  swiperContainer.appendChild(swiperWrapper);
  container.appendChild(swiperContainer);

  // ⚠️ Tránh renderSlide gây lỗi → dùng HTML chuỗi trực tiếp
  const slides = images.map(
    (src) => `
    <div class="swiper-slide" style="position: relative; z-index: 10;">
      <div class="pinch-zoom">
        <img src="${src}" class="loading" 
             onload="this.classList.remove('loading')" 
             style="z-index: 10; position: relative;" />
      </div>
    </div>`
  );

  let swiper = null;
  let currentPage = initialPage;

  setTimeout(() => {
    swiper = new Swiper(swiperContainer, {
      initialSlide: currentPage,
      loop: false,
      virtual: {
        slides, // HTML dạng string
      },
      on: {
        slideChange: () => {
          if (!swiper) return; // 👈 fix chắc chắn

          currentPage = swiper.activeIndex;
          preloadAroundPage(currentPage, images);
          updateReaderPageInfo(currentPage + 1, images.length);
          onPageChange(currentPage);

          setTimeout(initPinchZoom, 100);
        },
      },
    });

    // Đảm bảo render xong DOM
    setTimeout(() => {
      swiper.virtual.update();
      console.log(
        "🧩 DOM slide count:",
        document.querySelectorAll(".swiper-slide").length
      );
    }, 100);

    setTimeout(() => {
      const img = document.querySelector(".swiper-slide img");
      if (img) {
        img.onload = () => {
          document.getElementById("loading-overlay")?.classList.add("hidden");
        };
      }
    }, 1000);

    // Gọi lần đầu
    preloadAroundPage(currentPage, images);
    updateReaderPageInfo(currentPage + 1, images.length);
    onPageChange(currentPage);
    setTimeout(initPinchZoom, 100);

    container.__readerControl = {
      setCurrentPage: (pageIndex) => {
        if (swiper) swiper.slideTo(pageIndex);
      },
    };
  }, 50);
  // 🖱 Toggle UI khi click ảnh
  swiperContainer.addEventListener("click", (e) => {
    const scale = e.target.closest(".pinch-zoom")?.style?.transform;
    if (scale?.includes("scale") && !scale.includes("scale(1")) return;

    toggleReaderUI();
  });

  // 🖱 Click trái/phải để next/prev ảnh
  swiperContainer.addEventListener("click", (e) => {
    const { clientX } = e;
    const { width, left } = swiperContainer.getBoundingClientRect();
    const x = clientX - left;

    const THRESHOLD = width * 0.25; // 25% vùng bên trái/phải

    if (x < THRESHOLD) {
      swiper.slidePrev();
    } else if (x > width - THRESHOLD) {
      swiper.slideNext();
    }
  });

  return {
    setCurrentPage(pageIndex) {
      if (swiper) {
        currentPage = pageIndex;
        swiper.slideTo(pageIndex);
      } else {
        setTimeout(() => {
          container.__readerControl?.setCurrentPage?.(pageIndex);
        }, 100);
      }
    },
  };
}

/**
 * 🧠 Init lại pinch zoom cho ảnh hiển thị sau mỗi lần slide
 */
function initPinchZoom() {
  document.querySelectorAll(".pinch-zoom").forEach((el) => {
    if (!el.__pinchZoomInitialized) {
      el.__pinchZoomInitialized = true;
      new window.PinchZoom.default(el, {
        draggableUnzoomed: false,
        tapZoomFactor: 2,
      });
    }
  });
}
