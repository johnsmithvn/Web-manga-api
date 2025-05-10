
# ✅ MyLocalManga - Tối ưu HDD / RAM / SSD - Checklist Tổng Hợp

## 🧠 1. LocalStorage (Frontend)
- ✅ Đã có `getFolderCache()` → tránh gọi API khi folder đã cache
- ❗ Chỉ giúp giảm request, **không liên quan HDD**

---

## ⚡ 2. RAM Cache Map (Backend)
> Cần triển khai tại `backend/utils/folder-loader.js`

- [ ] Tạo `global.folderCache = new Map()`
- [ ] Cache kết quả API `/api/folder-cache?mode=path` theo key `root:path`
- [ ] Lưu: `{ data, mtime, expiresAt }`
- [ ] Khi load: gọi `fs.stat()` kiểm tra `mtime`
- [ ] TTL cache = 5 phút (có thể tùy chỉnh)
- [ ] Limit tối đa 10.000 folder → ~1–2GB RAM
- [ ] Tự xoá cache nếu quá hạn hoặc vượt limit

---

## 🌀 3. Tối ưu đọc HDD

| Việc cần làm                    | File liên quan             | Ghi chú                         |
|--------------------------------|-----------------------------|----------------------------------|
| [ ] Đổi `fs.readdirSync`, `fs.statSync` → `fs.promises.*` | `cache-scan.js`, `folder-loader.js` | Giảm block I/O, nhanh hơn |
| [ ] Giới hạn depth trong `findFirstImageRecursively()`    | `imageUtils.js`                 | VD: `if (depth > 3) return null` |
| [ ] Tránh quét HDD toàn bộ nếu không cần                  | `reset-cache.js`               | Tránh spin disk |
| [ ] Cho HDD tự sleep sau X phút                           | OS/BIOS                         | BIOS hoặc `hdparm` (Linux) |

---

## 💾 4. SSD an toàn
- ✅ SQLite chỉ lưu folder info → không ghi ảnh, không log nhiều → không mòn SSD

---

## 🖼 5. Reader tối ưu preload
- ✅ Scroll mode: chia page, lazy load mỗi 50 ảnh
- ✅ Horizontal: preload ±10 ảnh
- ✅ Không đọc toàn bộ → tránh sốc HDD

---

## 📱 6. Responsive Mobile
- [ ] Kiểm tra layout `.folder-card`, `.slider`, `.reader-footer`
- [ ] Thêm `meta viewport` nếu thiếu
- [ ] Cân chỉnh padding / zoom / full-screen reader mobile

---

## 🧼 7. Dọn cache
- [ ] Frontend: thêm nút clear `localStorage`
- [ ] Backend: API clear `global.folderCache` (dev tool)
"""
