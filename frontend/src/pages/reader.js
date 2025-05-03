// 📄 frontend/src/pages/reader.js

import { getRootFolder } from "/src/core/storage.js";
import { renderReader } from "/src/core/reader.js";

// 👉 Auto render reader nếu có path trên URL
window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawPath = urlParams.get("path") || "";
  const path = rawPath.replace(/\/__self__$/, ""); // ✅ bỏ đuôi __self__ nếu có
  if (!path) {
    alert("❌ Thiếu path đọc truyện!");
    return;
  }

  const root = getRootFolder();
  if (!root) {
    window.location.href = "/select.html";
    return;
  }

  try {
    const res = await fetch(
      `/api/folder-cache?mode=path&root=${encodeURIComponent(
        root
      )}&path=${encodeURIComponent(path)}`
    );
    const data = await res.json();

    if (data.type === "reader" && Array.isArray(data.images)) {
      renderReader(data.images);
    } else {
      alert("❌ Folder này không chứa ảnh hoặc không hợp lệ!");
    }
  } catch (err) {
    console.error("❌ Lỗi load reader:", err);
    alert("🚫 Không thể tải dữ liệu!");
  }
});
