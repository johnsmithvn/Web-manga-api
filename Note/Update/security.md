# 🛡️ MyLocalManga - Bảo Mật Truy Cập Từ Xa (Tailscale + App riêng)

## 📦 Mô hình tổng quát

* Web app chạy local tại máy riêng, port `3000`
* Truy cập từ xa qua Tailscale VPN (100.x.x.x)
* Android App riêng được build bằng WebView
* Chỉ đúng **thiết bị đó** được phép truy cập (qua hostname)
* **Không public internet**, không expose IP, không dùng cloud

---

## ✅ Các lớp bảo vệ hiện tại

| Lớp bảo mật           | Trạng thái       | Ghi chú                                                          |
| --------------------- | ---------------- | ---------------------------------------------------------------- |
| Tailscale VPN         | ✅                | Toàn bộ truy cập mã hóa, peer-to-peer                            |
| Giới hạn hostname     | ✅                | Chỉ hostname Android được phép vào (`xiaomi-redmi-k30-5g-speed`) |
| Giới hạn token bí mật | ❌ Đã bỏ          | Có thể bật lại sau này nếu cần thêm lớp                          |
| Token qua URL         | ❌ Không dùng nữa | Tránh lỗi fetch từ WebView                                       |
| Expose Internet       | ❌ Không          | Chỉ mạng nội bộ VPN                                              |

---

## 🔧 Cách cấu hình hostname chặn

Trong `server.js`:

```js
const allowedHostnames = ["xiaomi-redmi-k30-5g-speed"]; lưu dạng mảng nhé lấy trong tailscle thay cho ip vì cái này bảo mật hơn
```

Middleware kiểm tra client IP và resolve hostname:

```js
let clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
if (clientIP.startsWith("::ffff:")) {
  clientIP = clientIP.replace("::ffff:", "");
}
const resolved = await dns.reverse(clientIP);
const hostname = resolved[0] || "";
```

Nếu hostname không khớp ➜ `403 Forbidden`

---

## 📱 Android App cấu hình

Trong `MainActivity.java`:

```java
web.loadUrl("http://<hostname>:3000");
```

* Không dùng header/token nữa
* `hostname` là Tailscale DNS của máy chủ (`mypc.tailxyz.ts.net`) hoặc IP nội bộ (100.x.x.x)

---

## 🔐 Các bước đã làm để bảo vệ

1. Bật Tailscale trên cả server và điện thoại
2. App Android chỉ mở WebView tới đúng địa chỉ
3. Server chặn toàn bộ truy cập không đúng hostname
4. Tắt token do hạn chế fetch header trong WebView

---

## ⚠️ Rủi ro nếu không dùng token

| Rủi ro                              | Có thể xảy ra khi nào?                  | Mức độ     |
| ----------------------------------- | --------------------------------------- | ---------- |
| Thiết bị khác cùng tailnet truy cập | Nếu login nhầm tài khoản Tailscale khác | Trung bình |
| Spoof hostname                      | Rất khó, chỉ khi bug DNS nội bộ         | Thấp       |
| App bị leak URL có token            | Không áp dụng (vì đã tắt token)         | Không      |

➡ **Tóm lại:** Hiện tại đủ an toàn với setup 1 thiết bị – 1 user

---

## 🔁 Cách bật lại `token`

1. Tạo `.env` trong `backend/`:

```
SECRET_TOKEN=abc123@super_secret
```

2. Middleware `checkToken.js`:

```js
const token = req.query.token || req.headers["x-app-token"];
if (!token || token !== process.env.SECRET_TOKEN) {
  return res.status(403).send("Forbidden");
}
```

3. App Android thêm `?token=...` vào URL
4. Trong `frontend`, auto đính token vào mọi API:

```js
window.fetch = (url, opts) => {
  const token = new URLSearchParams(location.search).get("token");
  if (token) url += url.includes("?") ? `&token=${token}` : `?token=${token}`;
  return fetch(url, opts);
};
```

---

## 🧰 Gợi ý bảo trì/backup sau này

* Backup `.env` riêng, không push git
* Theo dõi hostname trong Tailscale → nếu hostname đổi thì phải sửa lại whitelist
* Nếu thêm thiết bị khác → chỉ cần thêm hostname vào `allowedHostnames`
* Nếu muốn cấm toàn bộ thiết bị trừ app ➜ bật lại `token`

---

## 📝 File liên quan:

| File                          | Vai trò                                    |
| ----------------------------- | ------------------------------------------ |
| `backend/server.js`           | Main server express, bảo vệ hostname/token |
| `middleware/checkToken.js`    | Middleware kiểm tra token (nếu dùng)       |
| `.env`                        | Chứa token bí mật nếu bật lại              |
| `MainActivity.java` (Android) | App riêng để chạy webview                  |

---

✅ Cấu hình hiện tại đủ mạnh cho 1 người dùng, riêng tư tuyệt đối, không ai ngoài Tailscale truy cập được.
