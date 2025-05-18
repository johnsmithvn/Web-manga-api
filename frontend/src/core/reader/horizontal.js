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
  if (!images || images.length === 0) return;

  let currentPage = initialPage;
  container.innerHTML = "";
  container.classList.add("reader");

  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  const VISIBLE_RANGE = 5;

  images.forEach((src, index) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    if (Math.abs(index - currentPage) <= VISIBLE_RANGE) {
      const zoomWrapper = document.createElement("div");
      zoomWrapper.className = "pinch-zoom";

      const img = document.createElement("img");
      img.src = src;
      img.classList.add("loading");
      img.onload = () => img.classList.remove("loading");

      zoomWrapper.appendChild(img);
      slide.appendChild(zoomWrapper);
    } else {
      slide.innerHTML = `<div style="height:100%;background:#000"></div>`;
    }

    swiperWrapper.appendChild(slide);
  });

  swiperContainer.appendChild(swiperWrapper);
  container.appendChild(swiperContainer);

  let swiper = null;

  // ✅ Delay khởi tạo Swiper để DOM ổn định hoàn toàn
  setTimeout(() => {
    // ✅ Ensure swiper element and wrapper exist
    const swiperEl = container.querySelector(".swiper");
    const wrapperEl = container.querySelector(".swiper-wrapper");
    if (!swiperEl || !wrapperEl) return;

    swiper = new Swiper(swiperEl, {
      loop: false,
      initialSlide: currentPage,
      on: {
        slideChange: () => {
          if (!swiper || !swiper.slides || !swiper.slides.length) return;
          currentPage = swiper.activeIndex;

          preloadAroundPage(currentPage, images);
          updateReaderPageInfo(currentPage + 1, images.length);
          onPageChange(currentPage);

          const VISIBLE_RANGE = 1;
          swiper.slides.forEach((slide, index) => {
            const isInRange = Math.abs(index - currentPage) <= VISIBLE_RANGE;

            if (isInRange && !slide.querySelector("img")) {
              const zoomWrapper = document.createElement("div");
              zoomWrapper.className = "pinch-zoom";

              const img = document.createElement("img");
              img.src = images[index];
              img.classList.add("loading");
              img.onload = () => img.classList.remove("loading");

              zoomWrapper.appendChild(img);
              zoomWrapper.addEventListener("click", toggleReaderUI);

              slide.innerHTML = "";
              slide.appendChild(zoomWrapper);

              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  new window.PinchZoom.default(zoomWrapper, {
                    draggableUnzoomed: false,
                    tapZoomFactor: 2,
                  });
                });
              });
            } else if (!isInRange && slide.querySelector("img")) {
              slide.innerHTML = `<div style="height:100%;background:#000"></div>`;
            }
          });
        },
      },
    });

    // preload & info
    preloadAroundPage(currentPage, images);
    updateReaderPageInfo(currentPage + 1, images.length);
    onPageChange(currentPage);

    setTimeout(() => {
      document.querySelectorAll(".pinch-zoom").forEach((el) => {
        new window.PinchZoom.default(el, {
          draggableUnzoomed: false,
          tapZoomFactor: 2,
        });
      });
    }, 100);

    // ✅ cho phép jumpPage hoạt động
    container.__readerControl = {
      setCurrentPage: (pageIndex) => {
        if (swiper) swiper.slideTo(pageIndex);
      },
    };
  }, 50); // ✅ Delay tối thiểu giúp ổn định layout

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


// function createImageElement(src) {
//   const img = document.createElement("img");
//   img.src = src;
//   img.classList.add("loading");
//   img.style.display = "block";
//   img.onload = () => img.classList.remove("loading");
//   return img;
// }

// function setupReaderInteraction(img, onNext, onPrev) {
//   // 🖱️ Click trái/giữa/phải ảnh
//   img.addEventListener("click", (e) => {
//     const rect = img.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     if (x < rect.width / 3) return onPrev();
//     if (x > (rect.width * 2) / 3) return onNext();
//     toggleReaderUI();
//   });

//   // 🎹 Phím tắt
//   document.onkeydown = (e) => {
//     if (e.key === "ArrowRight") onNext();
//     if (e.key === "ArrowLeft") onPrev();
//   };
// }

// function updateReaderImage({
//   index,
//   images,
//   img,
//   onPageChange,
//   onIndexChange,
// }) {
//   if (index < 0 || index >= images.length) return;
//   onIndexChange(index);
//   img.classList.add("loading");
//   img.src = images[index];
//   img.onload = () => img.classList.remove("loading");
//   updateReaderPageInfo(index + 1, images.length);
//   preloadAroundPage(index, images);
//   onPageChange(index);
// }

/**
 * 📱 Bắt gesture swipe trái/phải đơn giản không cần thư viện
 * @param {HTMLElement} container
 * @param {function} onSwipeLeft
 * @param {function} onSwipeRight
 */
// function enableSwipeGesture(container, onSwipeLeft, onSwipeRight) {
//   let touchStartX = 0;
//   let touchEndX = 0;

//   container.addEventListener("touchstart", (e) => {
//     if (e.touches.length === 1) {
//       touchStartX = e.touches[0].clientX;
//     }
//   });

//   container.addEventListener("touchend", (e) => {
//     touchEndX = e.changedTouches[0].clientX;
//     const deltaX = touchEndX - touchStartX;

//     if (Math.abs(deltaX) > 50) {
//       if (deltaX < 0) onSwipeLeft?.();
//       else onSwipeRight?.();
//     }
//   });
// }
