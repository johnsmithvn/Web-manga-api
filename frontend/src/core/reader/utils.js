/**
 * ⚡ Preload ảnh quanh currentPage
 */
export function preloadAroundPage(currentPage, images, range = 10) {
  const start = Math.max(0, currentPage - range);
  const end = Math.min(images.length - 1, currentPage + range);

  for (let i = start; i <= end; i++) {
    if (i === currentPage) continue;
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

/**
 * 🧮 Cập nhật Trang X/Y trong reader-footer
 */
export function updateReaderPageInfo(currentPage, totalPages) {
  const pageInfo = document.getElementById("page-info");
  if (pageInfo) pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
}

/**
 * 🔢 Tạo input nhập trang cho horizontal mode
 */
export function showJumpPageInput(currentPage, totalPages, onChange) {
  const pageInfo = document.getElementById("page-info");
  if (!pageInfo) return;

  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = totalPages;
  input.placeholder = "Nhập trang...";
  input.style.width = "60px";
  input.style.fontSize = "14px";
  input.style.textAlign = "center";

  pageInfo.innerHTML = "";
  pageInfo.appendChild(input);
  input.focus();

  input.onblur = input.onchange = () => {
    const page = parseInt(input.value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onChange(page - 1); // callback nhận page mới (index)
    }
    updateReaderPageInfo(currentPage + 1, totalPages);
  };
}

/**
 * 👆 Toggle hiển/ẩn header và reader-footer
 * Dùng chung cho mọi chế độ reader (horizontal, scroll...)
 */
export function toggleReaderUI() {
  ["site-header", "reader-footer", "readerModeButton"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("hidden");
  });
}

/**
 * 👆 Show lại UI nếu đang ẩn
 */
export function showReaderUI() {
  document.getElementById("site-header")?.classList.remove("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
  document.getElementById("readerModeButton")?.classList.remove("hidden"); // ✅ thêm dòng này
}

/**
 * 👇 Hide toàn bộ UI để tập trung đọc
 */
export function hideReaderUI() {
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");
  document.getElementById("readerModeButton")?.classList.add("hidden"); // ✅ thêm dòng này
}
