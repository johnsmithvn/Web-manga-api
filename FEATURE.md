# 📖 Tổng hợp tính năng Dự án Web Reader (2025-04-29)

---

## ✅ Các tính năng ĐÃ LÀM ĐƯỢC

### 📦 Reader Modes
- **Scroll Mode** (Vertical):
  - Phân trang: tối đa 200 ảnh mỗi page.
  - Lazy load: thêm 50 ảnh mỗi lần scroll đến gần cuối.
  - Modal chọn page: click Trang X/Y để nhảy nhanh tới trang.

- **Swipe Mode** (Horizontal):
  - Next/Prev ảnh từng cái.
  - Swipe trái/phải (Hammer.js) hoặc phím tắt ← →.
  - Click trái/phải vào ảnh để chuyển ảnh.

### 📡 Backend APIs
- `/api/list-folder`: Hỗ trợ folder giả `__self__` + phân trang ảnh.
- `/api/random-folders`: API lấy random folders.
- `/api/top-folders`: API lấy folders nhiều ảnh nhất.

### 🧩 Cấu trúc tách module
- `reader-scroll.js`: Scroll mode.
- `reader-horizontal.js`: Horizontal mode.
- `folder.js`, `storage.js`, `sidebar.js`, `ui.js`: Load folder + sidebar + UI helper.
- `reader.js`: Điều phối render scroll/horizontal mode.

### 🎨 Frontend tối ưu hóa
- Styles riêng biệt: base.css, reader.css, folder.css, sidebar.css.
- Lazy load scroll mode: giảm load ảnh ngay từ đầu.
- Tách rõ các component frontend.

---

## 🚧 Các tính năng CẦN PHẢI LÀM TIẾP

### 🧠 Preload Scroll Mode
- Khi user gần hết page hiện tại ➔ preload ảnh page tiếp theo trước.
- Giúp next page trong scroll mode mượt hơn.

### 🧹 Cleanup DOM Scroll Mode
- Khi scroll dài (quá nhiều ảnh), cần remove ảnh cũ khỏi DOM.
- Giảm RAM, tránh lag khi đọc bộ lớn (>5000 ảnh).

### 📦 Prefetch Chapter Tiếp Theo
- Khi đọc gần hết chương ➔ load trước ảnh chapter kế tiếp.
- Next Chapter mượt, không phải đợi load mới.

### 🧊 RAM Cache ảnh đã xem
- Với horizontal mode, cache ảnh đã load để prev/next nhanh hơn.

### 🧪 Debug & Load Time Measure
- Đo thời gian load từng ảnh ➔ phát hiện ảnh nặng, optimize bộ ảnh.

### 🔥 Loading spinner cho reader-horizontal
- Hiện tại horizontal reader **KHÔNG có loading spinner** khi đổi ảnh.
- Cần bổ sung nhẹ (opacity loading) để UX đẹp hơn.

### ⚙️ Chức năng FAILED hoặc chưa hoàn thiện
- Preload ảnh kế tiếp trong scroll mode: ❌ Chưa làm.
- Spinner loading horizontal mode: ❌ Chưa có.
- Virtual scroll scroll-mode: ❌ Chưa có cleanup DOM ảnh đã scroll qua.

---

# 📋 Ghi chú thêm
- Đã xác nhận scroll mode lazy load + phân trang hoạt động đúng.
- Đã revert swipe mode về đơn giản, hoạt động ổn định.
- APIs backend đã hỗ trợ phân trang đầy đủ.

---

✅ Đã tổng hợp đủ thực tế 2025-04-29.
🚧 Các phần tối ưu sẽ làm sau khi confirm đầy đủ.

