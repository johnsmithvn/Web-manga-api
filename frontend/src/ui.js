// ➕ BỔ SUNG UI FRONTEND RENDER BANNER RANDOM
// 📁 frontend/src/ui.js ➜ renderRandomBanner()

import {
  renderFolderGrid,
  state,
  loadFolder,
  ensureAllFoldersList,
} from "/src/folder.js"; // 🆕 Import ensureAllFoldersList
import { toggleReaderMode as toggleMode } from "/src/reader.js";
import { changeRootFolder } from "./storage.js";

/**
 * 🔙 Cập nhật trạng thái nút Back/Home tuỳ theo vị trí folder
 */

/** 🧩 Thêm tiêu đề cho các hàng slider */
function createSectionTitle(titleText) {
  const h = document.createElement('h3');
  h.textContent = titleText;
  h.style.margin = '4px 16px';
  h.style.fontSize = '18px';
  h.style.fontWeight = 'bold';
  return h;
}
export function updateBackButtonUI() {
  const backButton = document.getElementById("back-button");
  if (!backButton) return;

  backButton.style.display = "inline-block";

  if (!state.currentPath || state.currentPath.trim() === "") {
    backButton.textContent = "🏠";
    backButton.setAttribute("aria-label", "Về chọn bộ");
  } else {
    backButton.textContent = "⬅";
    backButton.setAttribute("aria-label", "Back về thư mục cha");
  }
}

/**
 * 🔍 Lọc danh sách truyện theo từ khóa
 */
export async function filterManga() {
  const keyword =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  if (!keyword) {
    renderFolderGrid(state.allFolders);
    return;
  }

  const allFoldersList = await ensureAllFoldersList(); // 🆕 lấy cache hoặc fetch
  const filtered = allFoldersList.filter((f) =>
    f.name.toLowerCase().includes(keyword)
  );
  renderFolderGrid(filtered);
}

/**
 * 🌙 Bật / tắt chế độ dark mode
 */
export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/**
 * ⬅️ Xử lý hành động Back (về root hoặc folder cha)
 */
export function goBack() {
  if (!state.currentPath || state.currentPath.trim() === "") {
    changeRootFolder();
  } else {
    const parts = state.currentPath.split("/").filter(Boolean);
    parts.pop();
    loadFolder(parts.join("/"));
  }
}

/**
 * 📖 Đổi chế độ đọc (scroll <-> swipe)
 */
export function toggleReaderMode() {
  toggleMode();
}

/**
 * 📄 Cập nhật UI phân trang
 */
export function updateFolderPaginationUI(currentPage, totalItems, perPage) {
  const totalPages = Math.ceil(totalItems / perPage);
  const app = document.getElementById("app");

  const nav = document.createElement("div");
  nav.className = "reader-controls";

  const prev = document.createElement("button");
  prev.textContent = "⬅ Trang trước";
  prev.disabled = currentPage <= 0;
  prev.onclick = () => loadFolder(state.currentPath, currentPage - 1);
  nav.appendChild(prev);

  const jumpForm = document.createElement("form");
  jumpForm.style.display = "inline-block";
  jumpForm.style.margin = "0 10px";
  jumpForm.onsubmit = (e) => {
    e.preventDefault();
    const inputPage = parseInt(jumpInput.value) - 1;
    if (!isNaN(inputPage) && inputPage >= 0) {
      loadFolder(state.currentPath, inputPage);
    }
  };

  const jumpInput = document.createElement("input");
  jumpInput.type = "number";
  jumpInput.min = 1;
  jumpInput.max = totalPages;
  jumpInput.placeholder = `Trang...`;
  jumpInput.title = `Tổng ${totalPages} trang`;
  jumpInput.style.width = "60px";

  const jumpBtn = document.createElement("button");
  jumpBtn.textContent = "⏩";

  jumpForm.appendChild(jumpInput);
  jumpForm.appendChild(jumpBtn);
  nav.appendChild(jumpForm);

  const next = document.createElement("button");
  next.textContent = "Trang sau ➡";
  next.disabled = currentPage + 1 >= totalPages;
  next.onclick = () => loadFolder(state.currentPath, currentPage + 1);
  nav.appendChild(next);

  app.appendChild(nav);

  const info = document.createElement("div");
  info.textContent = `Trang ${currentPage + 1} / ${totalPages}`;
  info.style.textAlign = "center";
  info.style.marginTop = "10px";
  app.appendChild(info);
}

/**
 * 🔍 Toggle thanh tìm kiếm nổi (slide xuống giống YouTube)
 */
export function toggleSearchBar() {
  const bar = document.getElementById("floating-search");
  bar?.classList.toggle("active");

  const input = document.getElementById("floatingSearchInput");
  if (bar?.classList.contains("active")) {
    input?.focus();
  } else {
    input.value = "";
    filterManga();
  }
}

/**
 * ⚙️ Setup menu đổi bộ truyện
 */
export function setupSettingsMenu() {
  const settingsMenu = document.getElementById("settings-menu");
  if (!settingsMenu) return;

  const changeFolderBtn = document.createElement("button");
  changeFolderBtn.textContent = "🔄 Đổi Manga Folder";
  changeFolderBtn.onclick = () => {
    localStorage.removeItem("rootFolder");
    window.location.href = "/select.html";
  };

  settingsMenu.appendChild(changeFolderBtn);
}

/**
 * 👆 Toggle hiển/ẩn header và reader-footer
 * Dùng chung cho mọi chế độ reader (horizontal, scroll...)
 */
export function toggleReaderUI() {
  ["site-header", "reader-footer"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("hidden");
  });
}

/**
 * 👆 Show lại UI nếu đang ẩn
 */
export function showReaderUI() {
  document.getElementById("site-header")?.classList.remove("hidden");
  document.getElementById("reader-footer")?.classList.remove("hidden");
}

/**
 * 👇 Hide toàn bộ UI để tập trung đọc
 */
export function hideReaderUI() {
  document.getElementById("site-header")?.classList.add("hidden");
  document.getElementById("reader-footer")?.classList.add("hidden");
}

/**
 * 🖼️ Render banner thư mục ngẫu nhiên dạng slider ngang
 * @param {Array} folders - Danh sách folder có thumbnail
 */
export function renderRandomBanner(folders) {
  const container = document.getElementById("section-random"); // 🆕 thay vì wrapper
  if (!container) return;

  // Xóa banner cũ nếu có
  container.innerHTML = ""; // 🧹 Clear luôn nội dung section

  // Tạo container chính
  const banner = document.createElement("div");
  banner.id = "random-banner";
  banner.style.overflow = "hidden";
  banner.style.position = "relative";
  banner.style.margin = "10px 0";

  const inner = document.createElement("div");
  inner.className = "banner-inner";
  inner.style.display = "flex";
  inner.style.transition = "transform 0.5s ease";

  const cardWidth = 180;
  const containerWidth = container.clientWidth || 1000;
  const perSlide = Math.max(2, Math.floor(containerWidth / cardWidth));
  const totalSlides = Math.ceil(folders.length / perSlide);

  for (let i = 0; i < totalSlides; i++) {
    const group = folders.slice(i * perSlide, (i + 1) * perSlide);
    const groupDiv = document.createElement("div");
    groupDiv.style.display = "flex";
    groupDiv.style.flex = `0 0 ${containerWidth}px`;

    for (const f of group) {
      const card = document.createElement("div");
      card.className = "card";
      card.style.width = `${cardWidth}px`;
      card.style.marginRight = "12px";
      card.style.cursor = "pointer";

      card.innerHTML = `
        <img src="${f.thumbnail}" alt="${f.name}" style="width:100%; height:120px; object-fit:cover; border-radius:8px">
        <div style="text-align:center; font-size:14px; font-weight:bold;">${f.name}</div>
      `;

      card.onclick = () => window.loadFolder(f.path);
      groupDiv.appendChild(card);
    }

    inner.appendChild(groupDiv);
  }

  banner.appendChild(inner);

  // Thêm nút ← →
  let currentSlide = 0;
  const updateSlide = () => {
    inner.style.transform = `translateX(-${currentSlide * containerWidth}px)`;
  };

  const prev = document.createElement("button");
  const next = document.createElement("button");
  [prev, next].forEach((btn) => {
    btn.style.position = "absolute";
    btn.style.top = "50%";
    btn.style.transform = "translateY(-50%)";
    btn.style.background = "rgba(0,0,0,0.5)";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.padding = "8px 12px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "10";
  });
  prev.textContent = "←";
  next.textContent = "→";
  prev.style.left = "0";
  next.style.right = "0";
  prev.onclick = () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide();
  };
  next.onclick = () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
  };

  banner.appendChild(prev);
  banner.appendChild(next);

  // Auto slide mỗi 10s
  setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
  }, 10000);

  // Vuốt (Hammer.js)
  const hammer = new Hammer(banner);
  hammer.on("swipeleft", () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
  });
  hammer.on("swiperight", () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide();
  });

  // Cuối cùng: gắn vào DOM
  container.appendChild(createSectionTitle("✨ Đề xuất ngẫu nhiên"));
  container.appendChild(banner);
}


/**
 * 📈 Render hàng TOP VIEW bên dưới banner random
 * @param {Array} folders - Có dạng {name, path, thumbnail, count}
 */

// ✅ Cập nhật renderTopView để thêm tiêu đề
export function renderTopView(folders) {
  const container = document.getElementById("section-topview"); // ✅ thay vì wrapper
  if (!container) return;

  container.innerHTML = ""; // 🧹 xoá sạch trước khi render

  const title = createSectionTitle("👑 Xem nhiều nhất");
  container.appendChild(title);

  const scrollWrapper = document.createElement("div");
  scrollWrapper.id = "top-view";
  scrollWrapper.style.overflowX = "auto";
  scrollWrapper.style.margin = "12px 0";

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "12px";
  row.style.padding = "8px";

  for (const f of folders) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.position = "relative";
    card.style.width = "160px";
    card.style.flex = "0 0 auto";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <img src="${f.thumbnail}" alt="${f.name}" loading="lazy"
        style="width:100%; height:120px; object-fit:cover; border-radius:8px">
      <div style="padding:6px; font-size:14px; font-weight:bold; text-align:center">${f.name}</div>
      <div style="position:absolute; top:6px; right:6px; background:#000a; color:white;
        font-size:12px; padding:2px 6px; border-radius:6px;">
        👁 ${f.count}
      </div>
    `;

    card.onclick = () => window.loadFolder(f.path);
    row.appendChild(card);
  }

  scrollWrapper.appendChild(row);
  container.appendChild(scrollWrapper);
}


// ➕ BỔ SUNG UI FRONTEND - TIÊU ĐỀ + RECENT VIEW


/** ✅ Ghi lại folder vừa đọc vào localStorage */
export function saveRecentViewed(folder) {
  try {
    const key = 'recentViewed';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];

    // Bỏ item cũ nếu trùng path
    const filtered = list.filter(item => item.path !== folder.path);

    // Thêm lên đầu
    filtered.unshift({ name: folder.name, path: folder.path, thumbnail: folder.thumbnail });

    // Giới hạn 10
    const limited = filtered.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(limited));
  } catch (err) {
    console.warn('❌ Không thể lưu recentViewed:', err);
  }
}

/** 🧠 Danh sách truy cập gần đây – hiển thị bên phải, vuốt được */
export function renderRecentViewed(folders = []) {
  const wrapper = document.getElementById('wrapper');
  if (!wrapper) return;

  const old = document.getElementById('recent-view');
  if (old) old.remove();

  const box = document.createElement('div');
  box.id = 'recent-view';
  box.style.position = 'fixed';
  box.style.top = '100px';
  box.style.right = '0';
  box.style.width = '200px';
  box.style.maxHeight = 'calc(100vh - 150px)';
  box.style.overflowY = 'auto';
  box.style.background = '#fff';
  box.style.borderLeft = '1px solid #ddd';
  box.style.padding = '8px';
  box.style.boxShadow = '-2px 0 6px rgba(0,0,0,0.1)';
  box.style.zIndex = '999';

  const title = document.createElement('div');
  title.textContent = '🕘 Mới đọc';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '6px';
  box.appendChild(title);

  for (const f of folders.slice(0, 10)) {
    const item = document.createElement('div');
    item.style.marginBottom = '8px';
    item.style.cursor = 'pointer';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.innerHTML = `
      <img src="${f.thumbnail}" alt="thumb" style="width:40px;height:40px;object-fit:cover;margin-right:6px;border-radius:4px;">
      <span style="font-size:14px;">${f.name}</span>
    `;
    item.onclick = () => window.loadFolder(f.path);
    box.appendChild(item);
  }

  // ✅ Chỉ hiện trên màn desktop
  box.style.display = window.innerWidth < 768 ? 'none' : 'block';
  window.addEventListener('resize', () => {
    box.style.display = window.innerWidth < 768 ? 'none' : 'block';
  });

  document.body.appendChild(box);
}

