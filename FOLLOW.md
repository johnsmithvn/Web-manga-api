
# 📘 FLOW HỆ THỐNG - MY LOCAL MANGA READER

## 1. Flow tổng quát hệ thống

[User mở website]
    ↓
[Kiểm tra LocalStorage rootFolder]
    ↳ Nếu chưa có ➔ Redirect về select.html để chọn bộ
    ↳ Nếu đã có ➔ Tiếp tục load allFoldersList

[Load allFoldersList từ LocalStorage hoặc fetch /api/list-all-folders]
    ↓
[Render folder giao diện, phân trang 20 folder/trang]
    ↓
[User Search hoặc Random]
    ↓
[Load reader view nếu chọn folder đọc ảnh]

---

## 2. Cơ chế cache & timeout

- Cache folders từng path: `folderCache::root:path`
- Cache toàn bộ danh sách folder `{name, path}`: `allFoldersList::root`
- Tự động clear cache folders sau **24h** (`CACHE_TIMEOUT = 24 * 60 * 60 * 1000` ms).
- Khi user đổi rootFolder ➔ clear toàn bộ cache liên quan root cũ.

---

## 3. Cách preload ảnh thumbnail

- Dùng `<link rel="preload" as="image" href="thumbnail.jpg">` chèn vào `<head>`.
- Chỉ preload những folder có thumbnail hợp lệ (check `folder.thumbnail` trước).
- Chrome có thể cảnh báo nhỏ nếu preload xong không dùng ngay (có thể bỏ qua).

---

## 4. Phân trang folders

- Slice cache `allFoldersList` để hiển thị từng trang.
- Mỗi trang tối đa `20 folders` (`foldersPerPage = 20`).
- Button "Trang sau", "Trang trước" điều khiển page.

---

## 5. Cách search và random truyện

- **Search**:
  - Search toàn bộ `allFoldersList::root` theo từ khóa.
  - Không cần gọi server.
- **Random**:
  - Random 1 folder bất kỳ trong cache `allFoldersList::root`.

---

## 6. Cách đổi rootFolder và clear cache

- Khi user click "Đổi bộ" ➔ Gọi `changeRootFolder()`.
- Tự động:
  - Xóa `rootFolder`
  - Xóa cache `allFoldersList::oldRoot`
  - Xóa cache `folderCache::oldRoot`
- Chuyển về `select.html` để chọn lại bộ mới.

---

## 7. API backend sử dụng

| API | Mục đích |
|:----|:---------|
| `/api/list-folder` | Lấy danh sách folders + ảnh trong 1 path |
| `/api/list-all-folders` | Lấy toàn bộ `{name, path}` folders theo root |
| `/api/top-folders` | Lấy 20 folder có lượt view cao nhất |
| `/api/random-folders` | Random 10 folders bất kỳ trong root |
| `/api/list-roots` | Trả về danh sách root folder (`1`, `2`, `3`,...) |

---

## 8. Các lưu ý kỹ thuật

- Nếu thay đổi thư mục trên ổ cứng (thêm, xóa, đổi tên):
  - Cache cũ sẽ bị sai ➔ Nên clear cache hoặc chờ 24h timeout.
- Nếu folder tên file chứa dấu cách cuối (`Mabarai-san cố gắng săn tôi .000.png`):
  - Có thể gây lỗi preload hoặc load ảnh.
  - Khuyến nghị chuẩn hóa tên file trước khi chạy web.
- Nếu preload thumbnail nhưng Chrome báo warning "not used":
  - Chỉ là cảnh báo tối ưu SEO nhẹ, không ảnh hưởng vận hành.
- Mobile RAM > 2GB sẽ chạy rất mượt, không cần tối ưu thêm preload lazy.

---

# ✅ Kết thúc
Flow đã được tối ưu full cho hệ thống đọc truyện local lớn (hàng chục nghìn folders) vận hành nhanh, ổn định và dễ mở rộng.
