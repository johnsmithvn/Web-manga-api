# 📒 MyLocalManga - Changelog

Tổng hợp các cập nhật, nâng cấp và sửa lỗi theo từng ngày phát triển.

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
