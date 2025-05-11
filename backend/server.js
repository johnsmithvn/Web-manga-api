// 📁 backend/server.js

const express = require("express");
const path = require("path");
const fs = require("fs");
const { ROOT_PATHS } = require("./utils/config");
const { getAllRootKeys } = require("./utils/config");

const app = express();
const PORT = 3000; // PORT = process.env.PORT || 3000; // ✅ Lấy từ biến môi trường
const allowedHostnames = [
  "xiaomi-redmi-k30-5g-speed",
  "desktop-v88j9e0", // ✅ mảng hostname được truy cập hoặc dung ip của tailscale
];
// ✅ Middleware parse JSON body
app.use(express.json());

// 🛡️ CHẶN IP KHÔNG ĐƯỢC PHÉP (trừ đúng IP Tailscale điện thoại)
// 🛡️ CHẶN HOSTNAME TAILSCALE KHÔNG PHẢI ĐIỆN THOẠI
const dns = require("dns").promises;

function isAllowedClient(clientIP) {
  // ✅ BỎ COMMENT dòng sau để cho phép toàn bộ nội bộ (LAN + localhost)
  // return true;

  // ✅ Nếu là localhost
  if (
    clientIP === "127.0.0.1" ||
    clientIP === "192.168.1.111" ||
    clientIP === "192.168.1.1"
  )
    return true;

 // ✅ Nếu IP là mạng LAN (192.168.x.x / 10.x.x.x / 172.16.x.x - 172.31.x.x) → cho qua

  // const isLAN =
  //   clientIP.startsWith("192.168.") ||
  //   clientIP.startsWith("10.") ||
  //   /^172\.(1[6-9]|2\d|3[0-1])\./.test(clientIP);

  // return isLAN;
}

app.use(async (req, res, next) => {
  let clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (clientIP.startsWith("::ffff:")) {
    clientIP = clientIP.replace("::ffff:", "");
  }

  // 🛡️ Cho phép IP nội bộ
  if (isAllowedClient(clientIP)) {
    return next();
  }

  // ✅ Nếu không phải LAN → kiểm tra hostname Tailscale
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
app.use("/api", require("./api/folder-cache")); // 🌟 API gộp random, top, search, path, folders
app.use("/api", require("./api/increase-view")); // 📈 Ghi lượt xem
app.use("/api", require("./api/reset-cache")); // 🔁 Reset cache DB
// ✅ Đăng ký route /api/scan trong server.js:
app.use("/api/scan", require("./api/scan"));

// ✅ Serve static images từ 
for (const [key, absPath] of Object.entries(ROOT_PATHS)) {
  app.use("/manga", express.static(absPath));
}
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

// 📂 API: Trả về danh sách key nguồn từ .env
app.get("/api/list-roots", (req, res) => {
  res.json(getAllRootKeys()); // ✅ Trả về ["FANTASY", "ANIME", ...]
});


// 🔥 Fallback tất cả route không match ➔ trả về index.html (SPA mode)
// ✅ Trả đúng file cho từng trang tĩnh
app.get("/select.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/select.html"));
});

app.get("/reader.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/reader.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/home.html"));
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
