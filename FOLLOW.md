# 📘 FLOW HỆ THỐNG - MY LOCAL MANGA READER

## 1. Flow tổng quát hệ thống

# 📚 FLOW TỔNG QUÁT - MY LOCAL MANGA READER

```
User mở website (index.html)
        ↓
Kiểm tra LocalStorage "rootFolder"
        ↓
Có rootFolder?
    ├—— Có:
    │     ↓
    │  Load allFoldersList từ LocalStorage
    │     ↓
    │  Có allFoldersList cache?
    │     ├—— Có:
    │     │    ↓
    │     │ Render list folders (state.allFolders)
    │     │    ↓
    │     │ Phân trang 20 folders mỗi page
    │     │    ↓
    │     │ Hiển thị thumbnail, tên folder
    │     │    ↓
    │     │ User tương tác: Search / Random / Click folder
    │     │    ↓
    │     │ User click 1 folder
    │     │    ↓
    │     │ Kiểm tra loại folder
    │     │       ├—— Folder ảnh (__self__) ➔ Render reader-scroll/horizontal
    │     │       └—— Folder con ➔ Load folder con
    │     │
    │     │ Trong Reader:
    │     │    ↓
    │     │  Scroll hoặc Swipe đọc ảnh
    │     │    ↓
    │     │  Có click Prev/Next chapter?
    │     │    ↓
    │     │  Load chapter mới
    │
    │     
    └—— Không:
          ↓
       Redirect về select.html để chọn root folder
```




---
Trường hợp đặc biệt:
- Nếu user đổi bộ ➔ Gọi `changeRootFolder()`:
  - Xóa `rootFolder`
  - Clear cache `folderCache`, `allFoldersList`
  - Redirect lại `/select.html`

---

Trường hợp đặc biệt:

- Nếu user đổi bộ ➔ Gọi `changeRootFolder()`:
  - Xóa `rootFolder`
  - Clear cache `folderCache`, `allFoldersList`
  - Redirect lại `/select.html`

---

📚 Bổ sung các CƠ CHẾ nội bộ

| Thành phần                 | Cách hoạt động                                                                                            |
| :------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Cache folders**          | `folderCache::root:path` lưu JSON data 24h timeout                                                        |
| **Cache all folders list** | `allFoldersList::root` lưu danh sách `{name, path}`                                                       |
| **Preload thumbnail**      | Gắn `<link rel="preload" as="image" href="...">` vào `<head>`                                             |
| **Phân trang folder**      | slice array `state.allFolders` ➔ mỗi trang 20 card                                                        |
| **Search folder**          | filter `allFoldersList` local, không gọi API                                                              |
| **Random folder**          | chọn ngẫu nhiên từ `allFoldersList`                                                                       |
| **API backend chính**      | `/api/list-folder`, `/api/list-all-folders`, `/api/top-folders`, `/api/random-folders`, `/api/list-roots` |
| **Scroll Mode**            | Phân page 200 ảnh, lazy load 50 ảnh/batch, click Trang X/Y để chọn                                        |
| **Swipe Mode**             | Next/Prev từng ảnh, swipe gesture, phím ← →                                                               |

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

| API                     | Mục đích                                         |
| :---------------------- | :----------------------------------------------- |
| `/api/list-folder`      | Lấy danh sách folders + ảnh trong 1 path         |
| `/api/list-all-folders` | Lấy toàn bộ `{name, path}` folders theo root     |
| `/api/top-folders`      | Lấy 20 folder có lượt view cao nhất              |
| `/api/random-folders`   | Random 10 folders bất kỳ trong root              |
| `/api/list-roots`       | Trả về danh sách root folder (`1`, `2`, `3`,...) |

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
