## ✅ Các chức năng backend Cần Thêm cho MyLocalManga

### 1. API: `GET /api/refresh-folder?root=xxx&path=yyy`

**Lý do cần:**
- Tránh reset toàn bộ root khi chỉ muốn quét lại 1 folder duy nhất
- Tránh xoá cache vô tình, hại disk (SSD)

**Tác dụng:**
- Quét lại folder, cập nhật thumbnail/ảnh trong DB
- Nếu folder không còn tồn tại: xoá khỏi cache

---

### 2. Ghi `mtime` (modified time) folder vào DB

**Lý do cần:**
- Dễ nhận biết folder nào vừa bị thay đổi
- Hạn chế việc quét disk liên tục

**Tác dụng:**
- Lưu `mtime` khi quét folder
- Khi truy cập lại, so sánh `mtime` hiện tại với DB trước khi dùng cache

---

### 3. Bỏ qua folder có quá nhiều ảnh

**Lý do cần:**
- Tránh load 15k+ ảnh vào RAM => crash
- Tránh lûu cache DB bị overflow hoặc corrupt

**Tác dụng:**
- Nếu folder ảnh > 10000: bỏ qua không cache
- Trả về `{ type: 'folder', tooLarge: true }`

---

### 4. (Tuùy chọn) Index `fullPath` cho folder

**Lý do cần:**
- Tìm kiếm thông minh hơn, nhận dạng Naruto/Chap 1

**Tác dụng:**
- Lưu `fullPath` và `name` tách riêng => search đủ hơn

---

### Tổng kết:
| Tính năng | Bắt buộc | Lý do |
|-------------|------------|--------|
| `refresh-folder` API | ✅ | Update folder nhanh, tiết kiệm I/O |
| Ghi `mtime` | ✅ | Cache folder chuẩn xác |
| Bỏ qua folder quá to | ✅ | Tránh crash RAM/disk |
| Index `fullPath` | ⚫ | Search nâng cao |

