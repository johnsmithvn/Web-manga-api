// 📁 backend/server.js

const express = require("express");
const path = require("path");
const fs = require("fs");
const { BASE_DIR } = require("./utils/config");

const app = express();
const PORT = 3000;  // PORT = process.env.PORT || 3000; // ✅ Lấy từ biến môi trường
const allowedHostnames = [
  "xiaomi-redmi-k30-5g-speed" // ✅ mảng hostname được truy cập hoặc dung ip của tailscale
];
// ✅ Middleware parse JSON body
app.use(express.json());

// 🛡️ CHẶN IP KHÔNG ĐƯỢC PHÉP (trừ đúng IP Tailscale điện thoại)
// 🛡️ CHẶN HOSTNAME TAILSCALE KHÔNG PHẢI ĐIỆN THOẠI
const dns = require("dns").promises;



app.use(async (req, res, next) => {
  let clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (clientIP.startsWith("::ffff:")) {
    clientIP = clientIP.replace("::ffff:", ""); // ✅ Fix IPv6-mapped IPv4
  }

  try {
    const resolved = await dns.reverse(clientIP);
    const hostname = resolved[0] || "";

    if (!allowedHostnames.includes(hostname)) {
      console.warn("❌ Truy cập bị chặn từ hostname:", hostname);
      return res.status(403).send("Forbidden (blocked)");
    }

    next();
  } catch (err) {
    console.error("❌ Reverse DNS failed:", err.message);
    return res.status(403).send("Forbidden (lookup failed)");
  }
});




// ✅ API chính
app.use("/api", require("./api/folder-cache"));      // 🌟 API gộp random, top, search, path, folders
app.use("/api", require("./api/folder-scan"));       // 🔍 Quét toàn bộ DB
app.use("/api", require("./api/increase-view"));     // 📈 Ghi lượt xem
app.use("/api", require("./api/reset-cache"));       // 🔁 Reset cache DB

// ✅ Serve static images từ BASE_DIR (E:/File/Manga)
app.use("/manga", express.static(BASE_DIR));

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/src", express.static(path.join(__dirname, "../frontend/src")));

// ✅ Middleware fix lỗi URL encode (dấu () [] {} ...) khi load ảnh
app.use("/manga", (req, res, next) => {
  try {
    req.url = decodeURIComponent(req.url);
  } catch (e) {
    console.error("❌ Error decoding URL:", e);
    return res.status(400).send("Bad Request");
  }
  next();
});

// 📂 API: Trả về danh sách folder gốc (1,2,3,...)
app.get("/api/list-roots", (req, res) => {
  if (!fs.existsSync(BASE_DIR)) {
    return res.status(500).json({ error: "BASE_DIR không tồn tại" });
  }

  const entries = fs.readdirSync(BASE_DIR, { withFileTypes: true });
  const roots = entries.filter(e => e.isDirectory()).map(e => e.name);

  res.json(roots);
});

// 🔥 Fallback tất cả route không match ➔ trả về index.html (SPA mode)
app.get(/^\/(?!api|src|manga).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});