# 📚 MyLocalManga – Web đọc truyện local

MyLocalManga là một ứng dụng web giúp bạn đọc truyện tranh từ thư mục trên ổ cứng cá nhân. Giao diện đẹp, nhẹ, dễ sử dụng, tối ưu cho cả máy tính và điện thoại.

---
App view bên này
https://github.com/johnsmithvn/AndroidApp

---
## 🛠️ Cấu trúc dự án

```txt
📦 MyLocalManga
├── backend/
│   ├── api/                       # 📡 Các route API chính
│   │   ├── folder-cache.js           # API duy nhất (mode = path | folders | random | top | search)
│   │   ├── increase-view.js          # Ghi lượt xem
│   │   ├── reset-cache.js            # Reset cache DB theo root
│   │   ├── folder-scan.js            # Hàm quét thủ công riêng
│
│   ├── utils/
│   │   ├── cache-scan.js             # Đệ quy scan thư mục, lưu folder vào DB
│   │   ├── folder-loader.js          # Đọc ảnh/folder trực tiếp từ ổ cứng
│   │   ├── imageUtils.js             # Hàm xử lý ảnh (check, tìm ảnh)
│   │   ├── views-manager.js          # Ghi & lấy lượt xem
│   │   ├── config.js                 # BASE_DIR, timeout cache,...
│   │   ├── db.js                     # Kết nối SQLite
│   │   └── pathToUrl.js              # Chuyển path → URL
│
│   └── server.js                     # 🎯 Server Express.js chính
│   ├── data/
│   │   └── cache.db               # 🔸 SQLite DB cache folders/views (RAM + ổ cứng)
│   │   
│   └── server.js              # 🎯 Node.js server chính (Express + router)
│
📁 frontend/
├── public/
│   ├── index.html           # Trang chính (hiển thị folder, banner)
│   ├── reader.html          # Trang đọc truyện (scroll / horizontal)
│   └── select.html          # Trang chọn thư mục root
│
├── src/
│   ├── styles/
│   │   ├── base.css         # CSS reset + style dùng chung
│   │   ├── pages/
│   │   │   ├── home.css           # style cho index.html
│   │   │   ├── reader.css         # style cho reader.html
│   │   │   └── select.css         # style cho select.html
│   │   └── dark/
│   │       ├── home-dark.css      # dark mode riêng cho index
│   │       └── reader-dark.css    # dark mode riêng cho reader
│   ├── pages/
│   │   ├── home.js           # logic cho index.html (load folder, sidebar, banner...)
│   │   ├── reader.js         # logic cho reader.html (gọi renderReader)
│   │   └── select.js         # logic cho select.html
│   ├── core/
│   │   ├── folder.js         # Load folder từ API hoặc cache
│   │   ├── storage.js        # Lưu rootFolder, allFoldersList, cache
│   │   ├── ui.js             # Giao diện folder, search, sidebar, back
│   │   ├── preload.js        # preload ảnh
│   │   ├── reader/
│   │   │   ├── index.js         # renderReader(), toggle mode, move chapter
│   │   │   ├── horizontal.js     # swipe mode
│   │   │   ├── scroll.js         # scroll mode
│   │   │   └── utils.js          # toggle UI, preload, jump page modal

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