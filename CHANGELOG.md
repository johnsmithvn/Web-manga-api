# 📒 MyLocalManga - Changelog

Tổng hợp các cập nhật, nâng cấp và sửa lỗi theo từng ngày phát triển.

# 📒 MyLocalManga - CHANGELOG

> Theo chuẩn Semantic Versioning (SemVer)

---

## [1.2.1] - 2025-04-30

### ✨ Tính năng mới

- Áp dụng sort folder và ảnh theo đúng thứ tự tự nhiên giống Windows (StrCmpLogicalW).
- Switch giữ các view nhảy đến đúng page

### 🐞 Bug còn tồn tại

- Chuyển scroll ➔ single vẫn không nhảy đúng ảnh đang nhìn nếu chưa scroll đủ trong page.

---

## [1.2.0] - 2025-04-29

### ✨ Added

- Preload ảnh xung quanh currentPage cho horizontal reader (10–20 ảnh).
- Modal Jump Page cho scroll mode.
- Input Jump Page cho horizontal mode.
- Tự động reset scroll sau khi Next/Prev/Jump page trong scroll mode.
- Customize scrollbar đẹp, mỏ mỏ khi hover trong scroll mode.

### 🛠 Changed

- Cải thiện UX mobile: Đổi scroll theo touch pan-y.
- Cập nhật lazyload scroll mode: load batch 50 ảnh, mượt hơn.

### 🛠 Fixed

- Fix horizontal reader sau khi jump page: Trang X/Y update đúng.
- Fix scroll mode khi next page giữ bottom: Đã reset scroll top reader.
- Fix mobile không cầm scroll reader được: bổ sung touch-action, min-height.
- Fix lỗi `QuotaExceededError` khi cache folder lớn vượt quá giới hạn LocalStorage (5MB).
- Thêm kiểm tra size JSON trước khi lưu cache folder (`> 4MB` thì skip không lưu, log warning).
- Cải thiện độ ổn định load folder lớn (hàng trăm chapter) mà không crash browser.

---

## [1.1.0] - 2025-04-29

### ✨ Added

- Tách module `reader-scroll.js` và `reader-horizontal.js`.
- Modal chọn page trong scroll mode.

### 🛠 Fixed

- Xác nhận Scroll mode lazyload + modal page hoạt động OK.
- Xác nhận Swipe mode next/prev update Trang X/Y chuẩn.

---

## [1.0.0] - 2025-04-20 ~ 2025-04-28

### 🎉 Initial Project

- Hiển thị thư mục, ảnh từ ổ cứng.
- Dark Mode toggle.
- Responsive giao diện mobile.
- API backend đọc file manga local.
- Footer reader hiển thị Trang X/Y + Next Chapter.
- Random folder / Search folder nhanh dựa vào cache local.

### 🛠 Fixed

- Fix toggle header/footer khi đọc truyện.
- Fix cache folders sau 24h timeout.
- Fix lỗi swipe lật trang sai state ban đầu.

---

# 📈 Quy tắc đánh version

- 🔢 Major (2.0.0, 3.0.0): Big update thay đổi flow.
- 🔣 Minor (1.2.0, 1.3.0): Thêm tính năng mới.
- 🔤 Patch (1.2.1, 1.2.2): Sửa bug nhỏ, tối ưu performance.

---

## 2025-04-29

- 🛠️ Tách reader-scroll.js để xử lý phân trang Scroll mode (200 ảnh/page, lazy load 50 ảnh).
- 🛠️ Tách reader-horizontal.js để xử lý Swipe mode (Next/Prev ảnh).
- 🛠️ Thêm modal chọn trang (jump page) trong Scroll mode.
- ✅ Confirm Scroll mode hoạt động: lazy load, chọn trang OK.
- ✅ Confirm Swipe mode hoạt động: next/prev ảnh, Trang X/Y cập nhật đúng.

---

## 2025-04-27

- ✨ Thêm cơ chế cache toàn bộ folders list (`allFoldersList`) theo rootFolder.
- ✨ Phân trang folders nhẹ bằng slicing từ cache local, không query server mỗi lần.
- ✨ Search và Random cực nhanh dựa trên cache local.
- ✨ Thêm preload thumbnail chuẩn `<link rel="preload" as="image" as="image">`.
- ⚙️ Thêm tự động clear cache sau 24h (timeout 1 ngày).
- ⚙️ Khi đổi rootFolder, tự động clear cache cũ liên quan.
- 🆕 Thêm API mới `/api/list-all-folders` để lấy toàn bộ {name, path}.

---

## [2025-04-24]

### ✨ Tính năng mới

- ✅ Thêm footer reader riêng cố định khi đọc truyện (ẩn/hiện cùng header).
- ✅ Footer reader hiển thị số trang và nút "Next Chapter" / "Prev Chapter".
- ✅ Hỗ trợ click ảnh & scroll để ẩn/hiện UI trong cả chế độ swipe & scroll.
- ✅ Căn giữa số trang trong footer.
- ✅ Tự ẩn `main-footer` khi vào reader, hiện lại khi thoát.
- ✅ Toggle header/footer đồng bộ khi click hoặc scroll.

### 🛠️ Cải tiến kỹ thuật

- 🧱 Tách `toggleReaderUI`, `hideReaderUI`, `showReaderUI` và `updateReaderPageInfo` thành hàm riêng để dễ bảo trì.
- 🧠 Thêm logic xác định chương kế / trước thông qua biến `allFolders` và `currentPath`.

### 🐞 Bug Fixes

- 🐛 Sửa lỗi `Uncaught ReferenceError: allFolders is not defined` do thiếu import từ `folder.js`.
- 🐛 Sửa lỗi header/footer toggle bị lệch pha (cái ẩn, cái hiện).
- 🐛 Xoá số trang thừa trong swipe mode (đã có dưới footer).

---

## [2025-04-22]

### ✨ Tính năng mới

- ✅ Thêm "folder giả" nếu folder có cả ảnh và thư mục con chứa ảnh.
- ✅ Tự động bỏ qua "folder giả" nếu folder chỉ toàn ảnh.
- ✅ Phân trang folder (giới hạn 20 folder/trang), có thể chuyển trang bằng nút hoặc nhảy trang.
- ✅ Ẩn thanh tìm kiếm nếu đang trong chế độ reader.

### 🐞 Bug Fixes

- 🐛 Sửa lỗi không load được ảnh trong thư mục nếu folder cha có ảnh.
- 🐛 Sửa lỗi không gắn sự kiện cho nút ⏩.

---

## [2025-04-20]

- 🎉 Tạo project đọc truyện local bằng Node.js + HTML/JS.
- 🎬 Hiển thị thư mục và ảnh
- 🌙 Thêm dark mode chuyển thủ công.
- ✅ Nâng cấp giao diện CSS: responsive, đẹp hơn, thân thiện với mobile.
- ✅ Hỗ trợ click ảnh để lật trang, vuốt trang bằng Hammer.js.
