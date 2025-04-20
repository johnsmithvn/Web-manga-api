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
  const subPath = req.query.path || "";
  const targetPath = path.join(MANGA_DIR, subPath);

  if (!fs.existsSync(targetPath)) return res.status(404).send("Not found");

  const items = fs.readdirSync(targetPath, { withFileTypes: true });
  const imageFiles = items.filter(
    (f) => f.isFile() && /\.(jpe?g|png|gif)$/i.test(f.name)
  );
  const hasOnlyImages =
    imageFiles.length === items.length && imageFiles.length > 0;

  if (hasOnlyImages) {
    const images = imageFiles.map((img) =>
      `/manga/${subPath}/${img.name}`.replace(/\\/g, "/")
    );
    res.json({ type: "reader", images });
  } else {
    const folders = getFolderData(MANGA_DIR, targetPath);
    res.json({ type: "folder", folders });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
