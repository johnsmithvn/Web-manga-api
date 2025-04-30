
# 📚 MyLocalManga - Hệ thống Top View, Random, Recent View, Cache

## 1. 🎲 Random Banner

- **API**: `GET /api/all-subfolders?root=...`
- **Dữ liệu**: Lấy 30 folder con có ảnh (recursive từ cache DB)
- **Render**: Slider ngang chia slide theo width, tự chuyển sau 10s, vuốt được
- **DOM**: Gắn vào `#section-random`

## 2. 👑 Top View

- **API**: `GET /api/top-view?root=...`
- **Dữ liệu**: Top 20 folder có lượt xem cao nhất (bảng `views` trong SQLite)
- **Ghi view**: `POST /api/increase-view { path }` khi `data.type === "reader"`
- **Render**: Slider ngang bên dưới Random
- **DOM**: Gắn vào `#section-topview`

## 3. 🕘 Recent View

- **Cơ chế**: Lưu vào `localStorage.recentViewed`, tối đa 10 folder
- **Trigger**: Khi vào reader mode
- **Render**: 1 cột dọc bên phải (chỉ desktop)
- **DOM**: Gắn vào `#recent-view` (body)

## 4. 💾 Cache (SQLite)

### File: `backend/data/cache.db`

### Bảng: `folders`
| Cột           | Mô tả                     |
|---------------|---------------------------|
| root          | Folder root               |
| name          | Tên folder                |
| path          | Đường dẫn trong root      |
| thumbnail     | URL ảnh đại diện          |
| lastModified  | Thời điểm mtime           |

### Bảng: `views`
| Cột   | Mô tả               |
|--------|---------------------|
| path   | Folder (VD: 1/Naruto) |
| count  | Số lượt đọc         |

## 5. 🔁 Cơ chế Quét / Reset Cache

- Khi gọi `/api/all-subfolders`:
    - Nếu folder chưa có trong DB ➜ quét
    - Nếu `mtime` folder mới hơn DB ➜ update thumbnail

## 6. ⚡ Hiệu năng & Ghi ổ

| Thành phần   | RAM/DB | Ghi đĩa        | Ghi khi nào        |
|--------------|--------|----------------|--------------------|
| Random View  | RAM+DB | Lần đầu         | Sau scan recursive |
| Top View     | DB     | Có, có kiểm soát| Khi vào reader     |
| Recent View  | RAM    | Không           | Ghi localStorage   |

## ✅ Tối ưu & Khả năng mở rộng

- Không ghi ảnh / JSON từng folder
- Toàn bộ DB dùng SQLite – load trong RAM nhanh
- Có thể mở rộng: tag, genre, search nâng cao, favorite...
