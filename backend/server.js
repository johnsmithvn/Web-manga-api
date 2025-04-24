// 📁 backend/server.js (Refactored)
const express = require("express");
const path = require("path");
const fs = require("fs");
const { getFolderData } = require("./utils/fileUtils");
const { MANGA_DIR } = require("./utils/config");
const {
  hasImageRecursively,
  findFirstImageRecursively,
} = require("./utils/imageUtils");

const app = express();

// Serve static files (truyện ảnh + frontend)
app.use("/manga", express.static(MANGA_DIR));
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use("/src", express.static(path.join(__dirname, "../frontend/src")));

// 📦 API trả về danh sách folder + ảnh
app.get("/api/folder", (req, res) => {
  const relativePath = req.query.path || "";
  const fullPath = path.join(MANGA_DIR, relativePath);
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const items = fs.readdirSync(fullPath, { withFileTypes: true });
  const imageFiles = items.filter(f => f.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(f.name));
  const folders = items.filter(f => f.isDirectory());

  // 📁 Chỉ lấy folder con có ảnh
  const foldersWithImage = folders.filter((f) => {
    const subPath = path.join(fullPath, f.name);
    return hasImageRecursively(subPath);
  });

  const total = foldersWithImage.length;
  const paginated = foldersWithImage.slice(offset, offset + limit);

  // 📸 Lấy thumbnail cho mỗi folder
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

  // Nếu chỉ có ảnh → vào reader luôn
  if (imageFiles.length > 0 && foldersWithImage.length === 0) {
    return res.json({
      type: "reader",
      images,
    });
  }

  // Nếu có folder hoặc có ảnh + folder → trả về cả hai
  res.json({
    type: "folder",
    name: path.basename(fullPath),
    folders: folderData,
    total,
    images: foldersWithImage.length > 0 ? images : [],
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
