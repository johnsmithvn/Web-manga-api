import { getRootFolder } from "/src/core/storage.js";
import { renderReader } from "/src/core/reader/index.js";
import { setupSidebar,toggleSidebar,filterManga, toggleSearchBar } from "/src/core/ui.js";

/**
 * Fetch and render reader data based on the URL path.
 */
async function initializeReader() {
  document.getElementById("loading-overlay")?.classList.remove("hidden");
  const urlParams = new URLSearchParams(window.location.search);
  const rawPath = urlParams.get("path");
  if (!rawPath) {
    alert("❌ Thiếu path đọc truyện!");
    return;
  }

  const path = rawPath; // 🔥 Giữ nguyên path, backend tự lo /__self__
  const root = getRootFolder();
  if (!root) {
    window.location.href = "/select.html";
    return;
  }

  try {
    const response = await fetch(
      `/api/folder-cache?mode=path&root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`
    );
    const data = await response.json();

    if (data.type === "reader" && Array.isArray(data.images)) {
      document.getElementById("loading-overlay")?.classList.add("hidden"); // ✅ Ẩn overlay sau khi render

      renderReader(data.images);
      
      setupSidebar()
       // ✅ Gắn sự kiện toggle
       document.getElementById("sidebarToggle")?.addEventListener("click", toggleSidebar);
       document.getElementById("searchToggle")?.addEventListener("click", toggleSearchBar);
       document.getElementById("floatingSearchInput")?.addEventListener("input", filterManga);

    } else {
      alert("❌ Folder này không chứa ảnh hoặc không hợp lệ!");
    }
  } catch (error) {
    console.error("❌ Lỗi load reader:", error);
    alert("🚫 Không thể tải dữ liệu!");
  }
}

// 👉 Initialize reader on DOMContentLoaded
window.addEventListener("DOMContentLoaded", initializeReader);

