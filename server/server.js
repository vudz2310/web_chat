require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

// ✅ Khởi tạo socket.io sau khi có server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001", // hoặc http://localhost:3000 nếu frontend chạy port khác
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ✅ Kết nối MySQL
db.connect((err) => {
    if (err) {
        console.error("❌ Không thể kết nối MySQL:", err.message);
        process.exit(1);
    }
    console.log("✅ Kết nối MySQL thành công!");
});

// ✅ Cấu hình CORS
app.use(cors({
    origin: "http://localhost:3001", // sửa nếu cần
    methods: ["GET", "POST"],
    credentials: true
}));

// ✅ Đọc JSON và dữ liệu form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Lưu session vào MySQL
const sessionStore = new MySQLStore({}, db);
const sessionMiddleware = session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" }
});

app.use(sessionMiddleware);

// ✅ Cho socket.io dùng chung session
io.engine.use(sessionMiddleware);

// ✅ Gắn static files (frontend) — phải **trước** các route
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Route mặc định
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "home.html"));
});

// ✅ Import router có sử dụng `io`
const apiRoutes = require("./api")(io);
app.use("/api", apiRoutes);

// ✅ Khởi động server
server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
