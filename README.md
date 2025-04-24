# 📚 MyLocalManga – Web đọc truyện local mượt như Netflix

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

---

## 🛠️ Cấu trúc dự án

```txt
MyLocalManga/
├── backend/
│   ├── server.js              # Node.js + Express server
│   └── utils/
│       ├── config.js          # Đường dẫn thư mục truyện
│       ├── fileUtils.js       # Đọc folder, ảnh thumbnail
│       └── imageUtils.js      # Các hàm đệ quy tìm ảnh
├── frontend/
│   ├── public/
│   │   └── index.html         # Giao diện chính
│   └── src/
│       ├── main.js            # Entry point JS
│       ├── folder.js          # Hiển thị thư mục
│       ├── reader.js          # Hiển thị ảnh đọc truyện
│       ├── ui.js              # Điều khiển UI, filter, dark mode
│       └── styles/
│           ├── base.css       # Style nền
│           ├── folder.css     # Style thẻ folder
│           ├── reader.css     # Style reader
│           └── dark.css       # Style dark mode
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
├── Naruto/
│   ├── 01.jpg, 02.jpg, ...
├── One Piece/
│   ├── 01.jpg, 02.jpg, ...
```

---

## 📜 License

MIT – Free to use & customize ✌️