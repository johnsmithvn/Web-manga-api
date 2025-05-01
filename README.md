# 📚 MyLocalManga – Web đọc truyện local

MyLocalManga là một ứng dụng web giúp bạn đọc truyện tranh từ thư mục trên ổ cứng cá nhân. Giao diện đẹp, nhẹ, dễ sử dụng, tối ưu cho cả máy tính và điện thoại.

---

## 🚀 Tính năng nổi bật

- 📂 Duyệt thư mục truyện từ ổ cứng
- 📖 Chế độ đọc:
  - Scroll dọc (webtoon, one-shot)
  - Trượt ngang từng trang (manga)
- 👆 Hỗ trợ vuốt trái/phải trên mobile (dùng [Hammer.js](https://hammerjs.github.io))
- 🔍 Tìm truyện theo tên
- 🔙 Nút back, chuyển chế độ, dark mode dễ bấm
- 📱 Giao diện responsive, tối ưu mobile
- 🔁 Chuyển chương: Next / Prev Chapter dễ dàng ngay trong chế độ đọc truyện
- 📄 Số trang hiển thị rõ ràng ở footer reader, hỗ trợ cả scroll và swipe
- 🎯 Click giữa ảnh hoặc cuộn trang để ẩn/hiện header/footer mượt mà
- Clear cache khi đổi rootFolder: Đổi bộ đọc khác ➔ clear sạch cache bộ cũ.
- Random truyện cực nhanh: Random trong cache local.
- Tìm kiếm folder siêu nhanh: Search trong cache local không cần gọi server.
- Phân trang folders nhẹ: Slice cache local ➔ hiển thị 20 folders mỗi lần ➔ cực mượt.
- Cache danh sách folders: Cache toàn bộ {name, path} folders local để search và random nhanh.
- Tự động clear cache sau 24h: Đảm bảo cache không lỗi thời nếu thư viện truyện thay đổi.





---

## 🛠️ Cấu trúc dự án

```txt
📦 MyLocalManga
├── backend/
│   ├── api/                   # 📡 Các route API chính (RESTful)
│   │   ├── list-folder.js         # API lấy folders và ảnh (hỗ trợ __self__)
│   │   ├── all-subfolders.js      # API random folders (30 folder có ảnh)
│   │   ├── top-view.js            # API trả về 20 folder có lượt view cao nhất
│   │   ├── search.js              # API tìm kiếm folder theo từ khoá
│   │   ├── increase-view.js       # Ghi lượt xem (POST /api/increase-view)
│   │   └── reset-cache.js         # Reset toàn bộ cache DB
│
│   ├── data/
│   │   └── cache.db               # 🔸 SQLite DB cache folders/views (RAM + ổ cứng)
│
│   ├── utils/                 # 🧠 Hàm tiện ích dùng chung
│   │   ├── config.js              # BASE_DIR, timeout cache, v.v.
│   │   ├── db.js                  # Kết nối & xử lý SQLite
│   │   ├── imageUtils.js          # Tìm ảnh thumbnail, check file hợp lệ
│   │   ├── pathToUrl.js           # Chuyển path vật lý ➝ URL cho web
│   │   └── views-manager.js       # Ghi/lấy view count, logic top folders
│
│   └── server.js              # 🎯 Node.js server chính (Express + router)
│
├── frontend/
│   ├── public/
│   │   ├── public/     
│   │   │   ├── default-cover.jpg  # Ảnh cover fallback nếu folder không có ảnh
│   │   ├── index.html             # Trang chính hiển thị thư mục
│   │   └── select.html            # Trang chọn rootFolder lần đầu
│
│   ├── src/
│   │   ├── styles/                # 🎨 CSS chia theo component/page
│   │   │   ├── base.css           # CSS chung toàn hệ thống
│   │   │   ├── layout.css         # Lưới folder + layout trang
│   │   │   ├── folder.css         # Style riêng cho card folder
│   │   │   ├── reader.css         # Style cho chế độ đọc truyện
│   │   │   ├── sidebar.css        # Style thanh menu bên trái
│   │   │   ├── dark.css           # Dark mode CSS override
│   │   │   └── select.css         # Trang chọn root (select.html)
│   │
│   │   ├── folder.js              # 📂 Load folders + phân trang + xử lý __self__
│   │   ├── main.js                # 🧠 Entry chính cho index.html (mount UI, render)
│   │   ├── preload.js             # 🚀 Preload thumbnail qua <link preload>
│   │   ├── reader.js              # Điều phối chế độ đọc scroll/swipe
│   │   ├── reader-scroll.js       # 📜 Scroll mode (phân trang, lazy load)
│   │   ├── reader-horizontal.js   # 📖 Swipe mode (next/prev, gesture)
│   │   ├── sidebar.js             # Hiển thị menu chọn folder bên trái
│   │   ├── select.js              # Logic xử lý UI chọn root folder (select.html)
│   │   ├── storage.js             # Lưu thông tin rootFolder, recentViewed, cache key
│   │   └── ui.js                  # Các hàm render UI: random banner, top view, search

```
### ✅ TỔNG KẾT CHỨC NĂNG

| Thư mục / File     | Vai trò chính                                |
|--------------------|-----------------------------------------------|
| `api/`             | Cung cấp toàn bộ API (random, search, views) |
| `data/cache.db`    | Lưu thông tin folders/views dạng SQLite      |
| `utils/`           | Tái sử dụng hàm logic – không trùng lặp      |
| `src/`             | Toàn bộ logic client-side UI                 |
| `styles/`          | Chia từng file nhỏ theo page/component       |
| `reader-*.js`      | Tách biệt logic đọc theo mode                |
| `select.js`        | Setup root folder ban đầu                    |
---

## 🔧 Cài đặt & chạy

### 1. Cài Node.js

- Tải [Node.js](https://nodejs.org/en) nếu chưa có

### 2. Cài thư viện

```bash
npm install express
```

> *Hammer.js đã được load từ CDN trong `index.html`*

### 3. Chạy server

```bash
node backend/server.js
```

Mặc định sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Cấu hình thư mục truyện

```js
// backend/utils/config.js
module.exports = {
  MANGA_DIR: 'E:/File/Manga' // Thay bằng đường dẫn truyện của bạn
};
```

---

## 📸 Cấu trúc thư mục truyện

```txt
E:/File/Manga/
```

---

## 📜 License

MIT – Free to use & customize ✌️