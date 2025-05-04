import { getRootFolder } from "/src/core/storage.js";
import { renderReader } from "/src/core/reader/index.js";

/**
 * Fetch and render reader data based on the URL path.
 */
async function initializeReader() {
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
      renderReader(data.images);
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