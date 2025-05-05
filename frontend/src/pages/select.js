// 📁 frontend/src/select.js
import { clearAllFolderCache } from "../core/storage.js";
// import { getRootFolder } from "../core/storage.js"; // nếu chưa có
import { withLoading } from "/src/core/ui.js";

/**
 * 📂 Fetch danh sách folder gốc và render ra giao diện
 */

/**
 * 📦 Tạo thẻ card cho folder root
 */
function createRootFolderCard(folder) {
  const card = document.createElement("div");
  card.className = "select-card";

  const thumbnail = document.createElement("img");
  thumbnail.className = "select-thumbnail";
  thumbnail.src = `/manga/${encodeURIComponent(folder)}/cover.jpg`;
  thumbnail.alt = folder;
  thumbnail.loading = "lazy";

  thumbnail.onerror = () => {
    thumbnail.src = "/default/default-cover.jpg";
  };

  const label = document.createElement("div");
  label.className = "select-label";
  label.textContent = folder;

  card.appendChild(thumbnail);
  card.appendChild(label);

  card.onclick = withLoading(async () => {
    localStorage.setItem("rootFolder", folder);

    const res = await fetch(
      `/api/folder-cache?mode=folders&root=${encodeURIComponent(folder)}`
    );
    const data = await res.json();

    if (Array.isArray(data) && data.length === 0) {
      console.log("📂 DB rỗng, tiến hành scan...");
    
      await withLoading(async () => {
        await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: folder }),
        });
      })();
    
      alert("✅ Đã quét cache cho root folder.");
    }
    

    window.location.href = "/"; // ✅ Chuyển sang trang chính
  });

  return card;
}

/**
 * 📂 Load danh sách root folders
 */
async function loadRootFolders() {
  try {
    const res = await fetch("/api/list-roots");
    const folders = await res.json();

    const list = document.getElementById("folder-list");
    folders.forEach((folder) => {
      const card = createRootFolderCard(folder);
      list.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Lỗi load root folders:", err);
  }
}


window.addEventListener("DOMContentLoaded", loadRootFolders);
