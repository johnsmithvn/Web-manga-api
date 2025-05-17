// 📁 frontend/src/select.js
import { withLoading } from "/src/core/ui.js";
import { requireSourceKey,getSourceKey } from "/src/core/storage.js";
/**
 * 📂 Fetch danh sách folder gốc và render ra giao diện
 */

/**
 * 📦 Tạo thẻ card cho folder root
 */
function createRootFolderCard(folder) {
  const sourceKey = getSourceKey();
  requireSourceKey(); // 🔐 Kiểm tra sourceKey
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
      `/api/folder-cache?mode=folders&key=${encodeURIComponent(
        sourceKey
      )}&root=${encodeURIComponent(folder)}`
    );
    const data = await res.json();

    if (Array.isArray(data) && data.length === 0) {
      console.log("📂 DB rỗng, tiến hành scan...");

      await withLoading(async () => {
        await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: folder, key: sourceKey }),
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
  const dbkey = localStorage.getItem("sourceKey");
  if (!dbkey) {
    alert("❌ Chưa chọn nguồn manga!");
    return (window.location.href = "/home.html");
  }
  try {
    const res = await fetch(`/api/list-roots?key=${encodeURIComponent(dbkey)}`);
    if (!res.ok) {
      const errText = await res.text(); // đọc lỗi thô để debug
      throw new Error(`Server ${res.status}: ${errText}`);
    }
    const folders = await res.json();
    const list = document.getElementById("folder-list");
    list.innerHTML = ""; // Clear cũ nếu có

    folders.forEach((folder) => {
      const card = createRootFolderCard(folder);
      list.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Lỗi load root folders:", err);
  }
}

window.addEventListener("DOMContentLoaded", loadRootFolders);
