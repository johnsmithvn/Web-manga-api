# 📚 MyLocalManga – Web đọc truyện local

MyLocalManga là một ứng dụng web giúp bạn đọc truyện tranh từ thư mục trên ổ cứng cá nhân. Giao diện đẹp, nhẹ, dễ sử dụng, tối ưu cho cả máy tính và điện thoại.

---

## 🚀 Tính năng nổi bật

- 📂 Duyệt thư mục truyện từ ổ cứng
- 📖 Chế độ đọc:
  - Scroll dọc (webtoon, one-shot)
  - Trượt ngang từng trang (manga)
- 🌙 Giao diện Dark Mode
- 👆 Hỗ trợ vuốt trái/phải trên mobile (dùng [Hammer.js](https://hammerjs.github.io))
- 🔍 Tìm truyện theo tên
- 🔙 Nút back, chuyển chế độ, dark mode dễ bấm
- 📱 Giao diện responsive, tối ưu mobile
- 🧱 Mã nguồn đã được refactor rõ ràng, dễ bảo trì
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
backend/
├── api/
│   ├── list-folder.js         // API list folders + images
│   ├── list-all-folders.js     // (mới) API trả về toàn bộ {name, path}
│   ├── random-folders.js       // API random folders
│   ├── top-folders.js          // API top folders theo lượt view
├── data/
│   ├── views.json              // File lưu lượt xem truyện
├── utils/
│   ├── config.js               // Đường dẫn BASE_DIR
│   ├── imageUtils.js           // Tìm ảnh đầu tiên trong folder
│   ├── pathToUrl.js            // Convert local path -> URL
│   ├── views-manager.js        // Quản lý view tăng khi đọc truyện
├── server.js                   // Server Express chính

frontend/
├── public/
│   ├── index.html              // Giao diện chính
│   ├── select.html             // Giao diện chọn bộ truyện
├── src/
│   ├── folder.js               // Load folder, phân trang
│   ├── reader.js               // Giao diện đọc truyện
│   ├── ui.js                   // Giao diện chung: nút back, dark mode, search
│   ├── storage.js              // Quản lý cache LocalStorage
│   ├── preload.js              // Preload ảnh thumbnail
│   ├── sidebar.js              // (nếu có) Sidebar menu
│   ├── main.js                 // Bootstrap trang chính
│   ├── config.js               // Cấu hình client
├── styles/
│   ├── base.css, layout.css, reader.css,... // Giao diện CSS


```

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