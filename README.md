# 📚 MyLocalManga – Web đọc truyện local

MyLocalManga là một ứng dụng web giúp bạn đọc truyện tranh từ thư mục trên ổ cứng cá nhân. Giao diện đẹp, nhẹ, dễ sử dụng, tối ưu cho cả máy tính và điện thoại.

---
App view bên này
https://github.com/johnsmithvn/AndroidApp

---
## 🛠️ Cấu trúc dự án
```
📦 MyLocalManga/
├── backend/
│   ├── api/                # 📡 API chính
│   │   ├── folder-cache.js      ⇨ API duy nhất xử lý: path, folders, random, top, search
│   │   ├── increase-view.js     ⇨ Ghi lượt xem (views)
│   │   ├── reset-cache.js       ⇨ Xoá hoặc scan lại DB cache
│   │   └── scan.js              ⇨ Scan rootFolder nếu chưa có DB
│   │   └── favorite.js          ⇨ favorite
│
│   ├── utils/
│   │   ├── config.js            ⇨ Đọc .env, map sourceKey → path gốc (ROOT_PATHS)
│   │   ├── db.js                ⇨ Mỗi dbkey tạo 1 file .db riêng (better-sqlite3)
│   │   ├── cache-scan.js       ⇨ Đệ quy quét thư mục, insert/update folder vào DB
│   │   ├── folder-loader.js    ⇨ Đọc thư mục thực (subfolder + ảnh)
│   │   ├── imageUtils.js       ⇨ Tìm ảnh đầu tiên (thumbnail), check folder có ảnh
│   │   └── views-manager.js    ⇨ (optional) xử lý view count nâng cao (chưa dùng)

│   └── .env                     file env disk
│   └── server.js               ⇨ Khởi tạo server, cấu hình static + API, middleware chặn IP
│
├── frontend/
│   ├── public/
│   │   ├── home.html            ⇨ Chọn source (.env)
│   │   ├── select.html          ⇨ Chọn rootFolder
│   │   └── index.html           ⇨ Trang chính (folder + banner)
│   │   └── reader.html          ⇨ Trang đọc ảnh (swipe/scroll)
│   │   └── favorites.html       ⇨ Trang favorite
│
│
│   ├── src/
│   │   ├── styles/
│   │   │   ├── base.css               ⇨ Global style + reset
│   │   │   ├── pages/home.css        ⇨ Giao diện home.html
│   │   │   ├── pages/index.css       ⇨ UI trang index
│   │   │   ├── pages/reader.css      ⇨ UI reader
│   │   │   ├── pages/select.css      ⇨ UI trang chọn rootFolder
│   │   │   ├── dark/home-dark.css    ⇨ dark mode cho index
│   │   │   └── dark/reader-dark.css  ⇨ dark mode cho reader
│   │   │
│   │   ├── components/
│   │   │   ├── folderCard.js         ⇨ 1 card folder (ảnh, tên, click vào)
│   │   │   └── folderSlider.js       ⇨ slider banner cho random, top, recent
│   │   │
│   │   ├── core/
│   │   │   ├── folder.js             ⇨ Load folder từ API/cache + render
│   │   │   ├── preload.js            ⇨ preload ảnh
│   │   │   ├── storage.js            ⇨ localStorage: root, cache, recentViewed
│   │   │   ├── ui.js                 ⇨ sidebar, toast, confirm modal, darkmode, pagination
│   │   │   └── reader/
│   │   │       ├── index.js          ⇨ renderReader(), toggle scroll/swipe
│   │   │       ├── horizontal.js     ⇨ swipe mode (1 ảnh/trang)
│   │   │       ├── scroll.js         ⇨ scroll mode (lazy load)
│   │   │       └── utils.js          ⇨ preload quanh trang, toggle UI, jump page
│   │   │
│   │   ├── pages/
│   │   │   ├── home.js               ⇨ chọn sourceKey
│   │   │   ├── select.js             ⇨ chọn rootFolder
│   │   │   ├── index.js              ⇨ load random, top, folder
│   │   │   └── reader.js             ⇨ gọi renderReader + fetch ảnh từ API
│   │   │   └── favorites.js          ⇨ gọi favorite list
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