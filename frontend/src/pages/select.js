// 📁 frontend/src/select.js
import { clearAllFolderCache } from "../core/storage.js";
import { getRootFolder } from "../core/storage.js"; // nếu chưa có

/**
 * 📂 Fetch danh sách folder gốc và render ra giao diện
 */

async function loadRootFolders() {
  clearAllFolderCache(); // 🧹 Clear cache folder mỗi lần vào select.html
  document.getElementById("loading-overlay")?.classList.remove("hidden");

  try {
    // 🔄 Show loading
    const res = await fetch("/api/list-roots");
    const folders = await res.json();

    const list = document.getElementById("folder-list");

    folders.forEach((folder) => {
      const card = document.createElement("div");
      card.className = "select-card";

      const thumbnail = document.createElement("img");
      thumbnail.className = "select-thumbnail";
      thumbnail.src = `/manga/${encodeURIComponent(folder)}/cover.jpg`; // ✅ Ảnh cover
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
      card.onclick = async () => {
        localStorage.setItem("rootFolder", folder);

        // ⚠️ Check nếu DB rỗng thì auto scan
        const res = await fetch(
          `/api/folder-cache?mode=folders&root=${encodeURIComponent(folder)}`
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length === 0) {
          console.log("📂 DB rỗng, tiến hành scan...");

          await fetch(`/api/reset-cache?root=${encodeURIComponent(folder)}`, {
            method: "DELETE",
          });

          alert("✅ Đã quét cache cho root folder.");
        }

        window.location.href = "/"; // ✅ Redirect về index.html
      };

      list.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Lỗi load root folders:", err);
  }
  document.getElementById("loading-overlay")?.classList.add("hidden");

}

window.addEventListener("DOMContentLoaded", loadRootFolders);
