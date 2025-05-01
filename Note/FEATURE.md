# 📖 Tổng hợp tính năng Dự án Web Reader (2025-04-29)

---

### ⚙️ ISSUE

| Issue                         | Ghi chú hiện tại                          | Định hướng xử lý sau                                                        |
| :---------------------------- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| LocalStorage Limit (~5MB)     | Đã fix bằng kiểm tra size trước khi cache | Nếu cần cache cực lớn ➔ chuyển IndexedDB                                    |
| Folder quá nặng ➔ Không cache | Đã skip cache folder lớn > 4MB            | Có thể warning user đẹp hơn (UI alert nhỏ)                                  |
| Lazy load scroll mode         | Đã lazy 50 ảnh 1 batch                    | Có thể tối ưu bằng **virtual scroll** sau này (chỉ giữ ảnh trong vùng nhìn) |
| Scroll performance mobile     | Fix touch-action, pan-y rồi               | Có thể optimize thêm smooth-scroll animation sau                            |
| Preload ảnh horizontal mode   | Đã preload trước 10-20 ảnh                | Nếu cần, preload thông minh hơn theo swipe speed                            |
| Search/Random folders nhiều   | Đang dùng cache local search              | Nếu cần hỗ trợ triệu folders ➔ indexing cache (trick nhỏ speed-up)          |

| Vấn đề cache/performance | Trạng thái hiện tại | Hướng cải thiện tương lai         |
| :----------------------- | :------------------ | :-------------------------------- |
| LocalStorage limit 5MB   | ✅ Đã check size    | ➔ Nếu muốn: IndexedDB             |
| Folder lớn               | ✅ Skip cache       | ➔ Cảnh báo UI nhẹ                 |
| Scroll lazy load         | ✅ Ok hiện tại      | ➔ Có thể nâng cấp VirtualScroll   |
| Preload ảnh              | ✅ Mượt             | ➔ Tối ưu preload theo hướng swipe |


## ✅ Các tính năng ĐÃ LÀM ĐƯỢC

### 📦 Reader Modes

- **Scroll Mode** (Vertical):

  - Phân trang: tối đa 200 ảnh mỗi page.
  - Lazy load: thêm 50 ảnh mỗi lần scroll đến gần cuối.
  - Modal chọn page: click Trang X/Y để nhảy nhanh tới trang.
  - select page
- **Swipe Mode** (Horizontal):
  - Next/Prev ảnh từng cái.
  - Swipe trái/phải (Hammer.js) hoặc phím tắt ← →.
  - Click trái/phải vào ảnh để chuyển ảnh.
  - Preload ảnh kế tiếp
  - Spinner loading
  - select page

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


### 🧊 RAM Cache ảnh đã xem

- Với horizontal mode, cache ảnh đã load để prev/next nhanh hơn.

### 🧪 Debug & Load Time Measure (may be)

- Đo thời gian load từng ảnh ➔ phát hiện ảnh nặng, optimize bộ ảnh.

---
