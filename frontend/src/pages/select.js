// 📁 frontend/src/select.js
import { clearAllFolderCache } from "../core/storage.js";
import { getRootFolder } from "../core/storage.js"; // nếu chưa có

/**
 * 📂 Fetch danh sách folder gốc và render ra giao diện
 */

async function loadRootFolders() {
  clearAllFolderCache(); // 🧹 Clear cache folder mỗi lần vào select.html

  try {
    const res = await fetch("/api/list-roots");
    const folders = await res.json();

    const list = document.getElementById("folder-list");
    list.innerHTML = "";

    folders.forEach((folder) => {
      const card = document.createElement("div");
      card.className = "select-card";

      const thumbnail = document.createElement("img");
      thumbnail.className = "select-thumbnail";
      thumbnail.src = `/manga/${encodeURIComponent(folder)}/cover.jpg`;      // ✅ Ảnh cover
      thumbnail.alt = folder;
      thumbnail.loading = "lazy"; // ✅ Lazy load cho nhanh

      // ✅ Nếu lỗi load cover ➔ fallback ảnh mặc định
      thumbnail.onerror = () => {
        thumbnail.src = "/default/default-cover.jpg";
      };

      const label = document.createElement("div");
      label.className = "select-label";
      label.textContent = folder; // ✅ Bỏ chữ "Bộ" rồi

      card.appendChild(thumbnail);
      card.appendChild(label);

      card.onclick = () => {
        localStorage.setItem("rootFolder", folder);
        window.location.href = "/"; // ✅ Redirect về index.html
      };

      list.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Lỗi load root folders:", err);
  }
}

window.addEventListener("DOMContentLoaded", loadRootFolders);



