// 📁 backend/server.js

const express = require("express");
const path = require("path");
const fs = require("fs");
const { getAllRootKeys, getRootPath } = require("./utils/config");
const { ROOT_PATHS } = require("./utils/config");

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
app.get("/api/source-keys-inline.js", (req, res) => {
  const keys = getAllRootKeys();
  const js = `window.sourceKeys = ${JSON.stringify(keys)};`;
  res.type("application/javascript").send(js);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
