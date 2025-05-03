# 📘 FLOW HỆ THỐNG - MY LOCAL MANGA READER

> Cập nhật theo phiên bản v1.3.0 – Ngày: 2025-05-01

---

## 1️⃣ FLOW TỔNG QUÁT

```
User mở website (index.html)
        ↓
Kiểm tra LocalStorage "rootFolder"
        ↓
Có rootFolder?
    ├—— Có:
    │     ↓
    │  Load allFoldersList từ cache (hoặc gọi API nếu chưa có)
    │     ↓
    │  Render list folders (state.allFolders)
    │     ↓
    │  Phân trang 20 folders mỗi page
    │     ↓
    │  Hiển thị thumbnail, tên folder
    │     ↓
    │  User tương tác: Search / Random / Click folder
    │     ↓
    │  Click folder:
    │     ├── Nếu có ảnh: đọc bằng reader (scroll/swipe)
    │     └── Nếu là folder con: load tiếp folder con
    │
    │  Trong reader:
    │     ↓
    │  Scroll hoặc Swipe đọc ảnh
    │     ↓
    │  Ghi view (POST /api/increase-view)
    │     ↓
    │  Có click Prev/Next chapter?
    │     ↓
    │  Load chương mới
    │
    └—— Không:
          ↓
       Redirect về select.html để chọn root folder
```
---
```
                ┌────────────────────────────┐
                │   Frontend gọi API HTTP    │
                └────────────┬───────────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │         Express Router (API)        │
          └──────────────────┬──────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
  📁 /api/folder-cache.js   📁 /api/folder-scan.js 📁 /api/reset-cache.js
  → GET ?mode=...           → GET /api/folder-scan → DELETE /api/reset-cache
                             │                    │
                             └────────┬───────────┘
                                      ▼
                         📁 /utils/cache-scan.js
                         → scanFolderRecursive(root)
                         → Ghi vào DB table `folders`


```

| API Route           | Gọi file                           | Vai trò                           |
| ------------------- | ---------------------------------- | --------------------------------- |
| `/api/folder-cache` | `folder-cache.js`                  | Gọi DB: `SELECT ... FROM folders` |
| `/api/folder-scan`  | `folder-scan.js` → `cache-scan.js` | Quét thật từ ổ đĩa, lưu vào DB    |
| `/api/reset-cache`  | `reset-cache.js` → `cache-scan.js` | Xoá DB rồi quét lại               |


| Table     | Dữ liệu                                                              |
| --------- | -------------------------------------------------------------------- |
| `folders` | Toàn bộ folder đã cache: tên, path, thumbnail, số ảnh, số folder con |
| `views`   | Lượt xem reader (ghi khi load truyện)                                |


| Tác vụ                           | API gọi                       | Ổ đĩa đụng tới không? | Cache DB dùng không? |
| -------------------------------- | ----------------------------- | --------------------- | -------------------- |
| Load thư mục random/search/top   | `/api/folder-cache`           | ❌ Không               | ✅ Có                 |
| Load folder cụ thể (reader/home) | `/api/folder-cache?mode=path` | ❌ Không               | ✅ Có                 |
| Quét cache ban đầu               | `/api/folder-scan`            | ✅ Có                  | ✅ Có                 |
| Reset toàn bộ cache              | `/api/reset-cache`            | ✅ Có                  | ✅ Có                 |

---

## 2️⃣ CƠ CHẾ CACHED + FLOW NỘI BỘ

| Thành phần                 | Cơ chế hoạt động                                                                 |
|---------------------------|----------------------------------------------------------------------------------|
| **folderCache**           | `folderCache::root:path` chứa JSON cache folder cụ thể (timeout 24h)           |
| **allFoldersList**        | `allFoldersList::root` chứa `{name, path}` toàn bộ folders trong root          |
| **Search folder**         | Gọi API `/api/search?root=...&q=...` (LIKE `%keyword%`)                        |
| **Search UI**             | Hiển thị dropdown kết quả: thumbnail + tên + click để đọc                      |
| **Random folders**        | Gọi API `/api/all-subfolders` ➜ chọn 30 folder ngẫu nhiên có ảnh               |
| **Top View**              | Gọi `/api/top-view`, hiển thị top 20 theo lượt xem DB                          |
| **Recent View**           | Lưu vào `localStorage.recentViewed::root`, hiển thị bên phải                   |
| **Preload thumbnail**     | `<link rel="preload" as="image" href="...">` vào head                          |
| **Scroll Mode**           | Phân page 200 ảnh, lazy load 50/batch, jump page qua modal                     |
| **Swipe Mode**            | Next/Prev từng ảnh, swipe hoặc ← →                                              |
| **Timestamp random**      | Hiển thị số phút trước cache random được tạo (auto hoặc thủ công làm mới)     |

---

## 3️⃣ CƠ CHẾ TIMEOUT VÀ CLEAR CACHE

- Cache timeout mặc định: `24h` (theo `Date.now()`)
- Clear khi:
  - User đổi root ➜ gọi `changeRootFolder()`
  - Bấm "Reset Cache" trong select.html hoặc footer
- Tự clear toàn bộ key liên quan: folderCache, allFoldersList, randomView...

---

## 4️⃣ API BACKEND SỬ DỤNG

| API                    | Mục đích                                |
|------------------------|-----------------------------------------|
| `/api/list-folder`     | Load folder + ảnh trong 1 path cụ thể   |
| `/api/list-all-folders`| Trả toàn bộ `{name, path}` trong root   |
| `/api/search`          | Search folder theo keyword (LIKE)       |
| `/api/all-subfolders`  | Trả 30 folder có ảnh (random base)      |
| `/api/top-view`        | Trả 20 folder có nhiều lượt xem nhất    |
| `/api/increase-view`   | Ghi lượt view (reader vào là tăng)      |
| `/api/list-roots`      | Danh sách root folders ban đầu          |
| `/api/reset-cache`     | Xoá cache DB toàn bộ theo root          |

---

## 5️⃣ GHI NHỚ & KỸ THUẬT

- ⚠️ Nếu sửa đổi folder ngoài ổ cứng ➜ clear cache để đồng bộ
- ⚠️ Nếu folder có ảnh rác/ảnh không load được ➜ check file name hoặc normalize lại tên
- ✅ Chrome warning preload "not used" có thể bỏ qua
- ✅ RAM từ 2GB có thể chạy mượt hàng chục nghìn folder

---

✅ FLOW HOÀN CHỈNH v1.3.0 – sẵn sàng mở rộng thêm Favorite, Tag, Genre, Cloud Sync.