require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");

// --- Tạo connection pool để quản lý kết nối MySQL ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Không thể kết nối MySQL:", err.message);
    process.exit(1);
  }
  console.log("✅ Kết nối MySQL thành công (pool)!");
  if (connection) connection.release();
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Cấu hình session store với connection pool
const sessionStore = new MySQLStore({}, pool.promise());

// Middleware session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: false, // true nếu dùng HTTPS
    httpOnly: true,
    sameSite: "lax",
  },
});

// Middleware chung
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

// Kết nối socket.io dùng chung session
io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("chat-message", (msg) => {
    console.log("📨 Message:", msg);
    io.emit("chat-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// Import API routes (nếu có)
try {
  const apiRoutes = require("./api")(io);
  app.use("/api", apiRoutes);
} catch (err) {
  console.warn("⚠️ Không có file ./api hoặc lỗi khi import:", err.message);
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
