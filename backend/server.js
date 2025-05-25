// 📁 backend/server.js

const express = require("express");
const path = require("path");
const fs = require("fs");
const { getAllMangaKeys, getAllMovieKeys,getRootPath } = require("./utils/config");
const { ROOT_PATHS } = require("./utils/config");
const authMiddleware = require("./middleware/auth"); // 🆕 Middleware kiểm tra IP/hostname

const app = express();
const PORT = 3000; // PORT = process.env.PORT || 3000; // ✅ Lấy từ biến môi trường

// ✅ Middleware parse JSON body
app.use(express.json());

// 🛡️ Middleware kiểm tra IP/hostname (tách riêng ra file middleware/auth.js)
app.use(authMiddleware);

// ✅ API chính
app.use("/api", require("./api/folder-cache")); // 🌟 API gộp random, top, search, path, folders
app.use("/api", require("./api/increase-view")); // 📈 Ghi lượt xem
app.use("/api", require("./api/reset-cache")); // 🔁 Reset cache DB
// ✅ Đăng ký route /api/scan trong server.js:
app.use("/api/scan", require("./api/scan"));
app.use("/api", require("./api/favorite")); // ⭐ API đánh dấu yêu thích

// // ✅ Serve static images từ BASE_DIR (E:/File/Manga)
// app.use("/manga", express.static(BASE_DIR));
for (const [key, absPath] of Object.entries(ROOT_PATHS)) {
  app.use(`/manga`, express.static(absPath));
}
// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/src", express.static(path.join(__dirname, "../frontend/src")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/home.html"));
});

// ✅ Middleware fix lỗi URL encode (dấu () [] {} ...) khi load ảnh
app.use("/manga", (req, res, next) => {
  try {
    const decodedPath = req.url
      .split("/")
      .map((part) => {
        try {
          return decodeURIComponent(part);
        } catch {
          return part; // fallback nếu lỗi
        }
      })
      .join("/");

    req.url = decodedPath;
  } catch (e) {
    console.error("❌ Error decoding URL:", e);
    return res.status(400).send("Bad Request");
  }
  next();
});

// 📂 API: Trả về danh sách folder gốc (1,2,3,...)
app.get("/api/list-roots", (req, res) => {
  const dbkey = req.query.key?.toUpperCase();
  const rootDir = getRootPath(dbkey);
  if (!dbkey) {
    return res.status(400).json({ error: "Thiếu key trong query" });
  }
  if (!rootDir || !fs.existsSync(rootDir)) {
    return res.status(400).json({ error: "Root path không tồn tại" });
  }

  try {
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    const roots = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    res.json(roots);
  } catch (err) {
    console.error("❌ Lỗi đọc thư mục:", err);
    res.status(500).json({ error: "Lỗi đọc thư mục", detail: err.message });
  }
});

// 🔥 Fallback tất cả route không match ➔ trả về index.html (SPA mode)
app.get(/^\/(?!api|src|manga).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// API get source keys
app.get("/api/source-keys.js", (req, res) => {
  const manga = getAllMangaKeys();  // ROOT_
  const movie = getAllMovieKeys();  // V_
  const js = `window.mangaKeys = ${JSON.stringify(manga)};\nwindow.movieKeys = ${JSON.stringify(movie)};`;
  res.type("application/javascript").send(js);
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});


app.use("/api", require("./api/movie-folder"));
// Thêm dòng này vào server.js
app.use("/api", require("./api/video"));