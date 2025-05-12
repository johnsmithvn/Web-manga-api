import { withLoading, showToast, showConfirm } from "/src/core/ui.js";
import { getSourceKey } from "/src/core/storage.js";
/**
 * 📦 Tạo card cho từng folder con
 * @param {string} folder - Tên folder (VD: Naruto)
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

  // ✅ Khi click folder: lưu rootFolder, gọi API kiểm tra DB, rồi vào index.html
  card.onclick = withLoading(async () => {
    localStorage.setItem("rootFolder", folder);

    const sourceKey = localStorage.getItem("sourceKey");
    if (!sourceKey) {
      alert("❌ Không có sourceKey, về lại trang chọn nguồn");
      return (window.location.href = "/home.html");
    }

    // ⚠️ Kiểm tra folder này đã có trong DB chưa
    const res = await fetch(
      `/api/folder-cache?mode=folders&root=${encodeURIComponent(
        sourceKey
      )}&path=${encodeURIComponent(folder)}`
    );

    const data = await res.json();

    // Nếu DB rỗng → scan
    if (Array.isArray(data) && data.length === 0) {
      console.log(`📂 DB rỗng, tiến hành scan ${sourceKey}/${folder}...`);

      await withLoading(async () => {
        await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ root: sourceKey, path: folder }), // ✅ FIX
        });
      })();

      alert("✅ Đã quét cache cho folder này.");
    }

    // ➡️ Chuyển vào trang chính
    window.location.href = "/index.html";
  });

  return card;
}

/**
 * 📂 Load danh sách folder trong root hiện tại
 */
async function loadRootFolders() {
  const sourceKey = localStorage.getItem("sourceKey");

  if (!sourceKey) {
    alert("❌ Chưa chọn nguồn manga!");
    return (window.location.href = "/home.html");
  }

  try {
    const res = await fetch(
      `/api/folder-cache?mode=root-folders&root=${encodeURIComponent(
        sourceKey
      )}`
    );
    const folders = await res.json();

    const list = document.getElementById("folder-list");
    folders.forEach((folder) => {
      const card = createRootFolderCard(folder.name);
      list.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Lỗi load folder trong nguồn:", err);
  }
}

document
  .getElementById("reset-all-db-btn")
  ?.addEventListener("click", async () => {
    const ok = await showConfirm("Bạn có chắc muốn xoá toàn bộ DB không?", {
      loading: true,
    });
    if (!ok) return;

    try {
      const sourceKey = getSourceKey();
      if (!sourceKey) return showToast("❌ Thiếu sourceKey");

      const res = await fetch(
        `/api/reset-cache/all?root=${encodeURIComponent(sourceKey)}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      showToast(data.message || "✅ Đã xoá toàn bộ DB thành công!");
    } catch (err) {
      showToast("❌ Lỗi khi xoá DB");
      console.error("❌ reset-all-db:", err);
    } finally {
      const overlay = document.getElementById("loading-overlay");
      overlay?.classList.add("hidden");
    }
  });

window.addEventListener("DOMContentLoaded", loadRootFolders);
