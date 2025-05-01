// 📁 backend/server.js

const express = require("express");
const path = require("path");
const fs = require("fs");
const { listFolder, listAllFolders } = require("./api/list-folder"); // 🆕 Import cả 2 hàm
const { BASE_DIR } = require("./utils/config");
const allSubfoldersApi = require("./api/all-subfolders");
const topViewApi = require("./api/top-view");

const app = express();
const PORT = 3000;

// ✅ Middleware parse JSON body
app.use(express.json());
app.use("/api", allSubfoldersApi);
app.use("/api", topViewApi);
app.use("/api", require("./api/increase-view"));
// ✅ Serve static images từ BASE_DIR (E:/File/Manga)
app.use("/manga", express.static(BASE_DIR));

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/src", express.static(path.join(__dirname, "../frontend/src")));
// api reset cache
app.use("/api", require("./api/reset-cache"));
app.use("/api", require("./api/search"));

// ✅ Middleware fix lỗi URL encode (dấu () [] {} ...) khi load ảnh
app.use("/manga", (req, res, next) => {
  try {
    req.url = decodeURIComponent(req.url); // 🔥 Decode chuẩn URL ảnh
  } catch (e) {
    console.error("❌ Error decoding URL:", e);
    return res.status(400).send("Bad Request");
  }
  next();
});


// 📂 API: Lấy danh sách folder + ảnh trong 1 folder (phân trang)
app.get("/api/list-folder", async (req, res) => {
  const { root, path: subPath = "", limit, offset } = req.query;
  if (!root) return res.status(400).json({ error: "Missing root parameter" });

  try {
    const result = await listFolder(root, subPath, parseInt(limit) || 0, parseInt(offset) || 0);
    res.json(result);
  } catch (err) {
    console.error("❌ Error in list-folder:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📂 API: Lấy toàn bộ folders {name, path} để cache search/random
app.get("/api/list-all-folders", async (req, res) => {
  const { root } = req.query;
  if (!root) return res.status(400).json({ error: "Missing root parameter" });

  try {
    const folders = await listAllFolders(root);
    res.json(folders);
  } catch (err) {
    console.error("❌ Error in list-all-folders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
