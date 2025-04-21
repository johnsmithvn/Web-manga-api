// 📁 backend/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const { getFolderData } = require("./utils/fileUtils");
const { MANGA_DIR } = require("./config");

const app = express();

app.use("/manga", express.static(MANGA_DIR));
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/src", express.static(path.join(__dirname, "../frontend/src")));

app.get("/api/folder", (req, res) => {
  const relativePath = req.query.path || "";
  const fullPath = path.join(MANGA_DIR, relativePath);
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const items = fs.readdirSync(fullPath, { withFileTypes: true });
  const imageFiles = items.filter(f => f.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(f.name));
  const folders = items.filter(f => f.isDirectory());

  // 🔁 Đệ quy tìm ảnh đầu tiên làm thumbnail
  function findFirstImageRecursively(dirPath, baseUrl) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const entryUrl = path.join(baseUrl, entry.name).replace(/\\/g, "/");

      if (entry.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(entry.name)) {
        return `/manga/${entryUrl}`;
      }

      if (entry.isDirectory()) {
        const found = findFirstImageRecursively(entryPath, entryUrl);
        if (found) return found;
      }
    }
    return null;
  }

  // 🔁 Kiểm tra xem folder con có ảnh không
  function hasImageRecursively(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(entry.name)) return true;
      if (entry.isDirectory() && hasImageRecursively(entryPath)) return true;
    }
    return false;
  }

  const foldersWithImage = folders.filter((f) => {
    const subPath = path.join(fullPath, f.name);
    return hasImageRecursively(subPath);
  });

  const total = foldersWithImage.length;
  const paginated = foldersWithImage.slice(offset, offset + limit);

  const folderData = paginated.map((item) => {
    const folderPath = path.join(fullPath, item.name);
    const relativeFolderPath = path.join(relativePath, item.name).replace(/\\/g, "/");
    const thumbnail = findFirstImageRecursively(folderPath, relativeFolderPath);

    return {
      name: item.name,
      path: relativeFolderPath,
      thumbnail,
    };
  });

  const images = imageFiles.map(img =>
    `/manga/${relativePath}/${img.name}`.replace(/\\/g, "/")
  );

  // Trả về folder + images (không vào reader ngay)
  if (imageFiles.length > 0 && foldersWithImage.length === 0) {
    // 📌 Trường hợp chỉ có ảnh, không có folder con → vào reader luôn
    return res.json({
      type: "reader",
      images,
    });
  }
  
  // 📌 Trường hợp còn lại: có folder con (hoặc cả ảnh)
  res.json({
    type: "folder",
    name: path.basename(fullPath),
    folders: folderData,
    total,
    images: foldersWithImage.length > 0 ? images : [], // chỉ trả về images nếu có folder con
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
