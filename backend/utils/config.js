// 📁 backend/utils/config.js

const path = require("path");
const fs = require("fs");
// ❗ Đặt dòng này ở ngay đầu file
const dotenv = require("dotenv");
const envPath = path.join(__dirname, "../.env");
const parsedEnv = dotenv.parse(fs.readFileSync(envPath, "utf-8"));

// ✅ Debug log rõ ràng toàn bộ env đầu vào
const ROOT_PATHS = {};

for (const [key, value] of Object.entries(parsedEnv)) {
  if (typeof value === "string" && fs.existsSync(value)) {
    ROOT_PATHS[key] = value;
  }
}

/**
 * ✅ Trả về danh sách các key hợp lệ
 */
function getAllRootKeys() {
  return Object.keys(ROOT_PATHS);
}

/**
 * ✅ Trả về path thật từ root key
 * @param {string} rootKey 
 * @returns {string} absolute path
 */
function getRootPath(rootKey) {
  return ROOT_PATHS[rootKey.toUpperCase()];
}

module.exports = {
  ROOT_PATHS,
  getAllRootKeys,
  getRootPath
};
