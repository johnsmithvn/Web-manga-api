# 📦 CHANGELOG – v1.3.0  
📅 Ngày: 2025-05-01  
🔧 Dự án: **MyLocalManga**

---

## 1️⃣ TÍNH NĂNG MỚI

### 🔍 Search Folder theo Tên
- `GET /api/search?root=...&q=...` (LIKE '%keyword%')
- Kết quả: `[{"name": "...", "path": "...", "thumbnail": "..."}]`, giới hạn 50

### 🖼️ UI Dropdown Search
- Giao diện dạng list dưới ô `#floatingSearchInput`
- Hiển thị thumbnail, tên, click để `loadFolder`
- Có loader (`🔍`) và fallback (`❌ Không tìm thấy`)

---

## 2️⃣ UI & HIỆU ỨNG

### 🎲 Random Banner
- Slider ngang, tự chuyển sau 10s
- Chia slide theo chiều rộng màn hình
- Vuốt được (Hammer.js)

### 👑 Top View
- Slider top 20 folder có lượt xem nhiều nhất
- Lưu view khi vào reader (API `POST /api/increase-view`)

### 🕘 Recent View
- Lưu vào `localStorage.recentViewed::root`
- Tối đa 10 folder
- Render bên phải (desktop)

---

## 3️⃣ TỐI ƯU & CƠ CHẾ CACHE

| Thành phần     | Cơ chế            | RAM/DB | Khi nào ghi         |
|----------------|-------------------|--------|----------------------|
| Random View    | Cache 30 phút     | RAM+DB | Sau lần đầu load     |
| Top View       | Ghi vào SQLite    | DB     | Khi vào reader       |
| Recent View    | localStorage      | RAM    | Khi vào reader       |

---

## 4️⃣ CƠ CHẾ DB & RESET CACHE

### SQLite DB (`cache.db`)
- **folders**: root, name, path, thumbnail, lastModified
- **views**: path, count

### Cơ chế quét & update:
- Nếu folder chưa có → insert
- Nếu `mtime` thay đổi → update thumbnail

---

## 5️⃣ REFACTOR & BUGFIX

- `filterManga()` tách rõ logic search vs render UI
- `refresh-random-btn` chỉ gắn sau khi DOM có
- `showRandomUpdatedTime()` chạy đúng thời điểm
- UI mượt, không ghi đè `#app`, không trùng DOM

---

## ✅ ĐÃ TEST

- ✅ Search realtime, không lag
- ✅ Lazy load ảnh search
- ✅ Dropdown ẩn khi xoá input
- ✅ Không lỗi DOM / cache sai