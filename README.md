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
- 🎯 Ẩn nút khi cuộn – như YouTube/Facebook

---

## 🛠️ Cấu trúc dự án

```
MyLocalManga/
├── backend/
│   └── server.js          # Node.js + Express server
├── frontend/
│   ├── public/
│   │   └── index.html     # Giao diện chính
│   ├── src/
│   │   ├── app.js         # Logic client
│   │   └── styles.css     # Giao diện
├── utils/
│   ├── config.js          # Đường dẫn thư mục truyện
│   └── fileUtils.js       # Đọc folder, ảnh thumbnail
```

---

## 🔧 Cài đặt & chạy

### 1. Cài Node.js

- Tải [Node.js](https://nodejs.org/en) nếu chưa có

### 2. Cài thư viện

```bash
npm install express mime-types
```

> *Nếu có dùng `Hammer.js`, đã load từ CDN trong `index.html`.*

### 3. Chạy server

```bash
node backend/server.js
```

Mặc định sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Cấu hình thư mục truyện

Mặc định truyện nằm tại:

```js
// utils/config.js
module.exports = {
  MANGA_DIR: 'E:/File/Manga'
};
```

➡ Thay bằng đường dẫn thư mục truyện của bạn trên máy.

---

## 📸 Cấu trúc thư mục truyện

```
MANGA_DIR/
├── Naruto/
│   └── 01.jpg, 02.jpg, ...
├── One Piece/
│   └── 01.jpg, 02.jpg, ...
```

---

## 📌 Ghi chú

- Ứng dụng chỉ dùng **cục bộ (local)**, không chia sẻ lên mạng
- Không yêu cầu cơ sở dữ liệu
- Dễ dàng mở rộng: bookmark, ghi nhớ trang, phân loại...

---

## 📜 License

MIT – Free to use & customize ✌️
