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

// ✅ CORS cấu hình 1 lần duy nhất
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
};
app.use(cors(corsOptions));

// ✅ Khởi tạo socket.io
const io = new Server(server, {
    cors: corsOptions
});

// ✅ Kết nối MySQL
db.connect((err) => {
    if (err) {
        console.error("❌ Không thể kết nối MySQL:", err.message);
        process.exit(1);
    }
    console.log("✅ Kết nối MySQL thành công!");
});

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Cấu hình session
const sessionStore = new MySQLStore({}, db);
const sessionMiddleware = session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { secure: false, httpOnly: true, sameSite: "lax" }
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware); // Cho socket.io dùng session

// ✅ Gắn static files (frontend)
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Route mặc định
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "home.html"));
});

// ✅ API router có dùng io
const apiRoutes = require("./api")(io);
app.use("/api", apiRoutes);

// ✅ Socket.IO event (ví dụ)
io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);
    // thêm logic ở đây nếu cần
});

// ✅ Khởi động server
server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
