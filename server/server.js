require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");

// Kết nối MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Kiểm tra kết nối MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Không thể kết nối MySQL:", err.message);
    process.exit(1);
  }
  console.log("✅ Kết nối MySQL thành công!");
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

// Session store MySQL
const sessionStore = new MySQLStore({}, db);

// Middleware session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: false, // đổi thành true nếu dùng HTTPS
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

// Static files (frontend)
app.use(express.static(path.join(__dirname, "..", "public")));

// Route cơ bản
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

// Kết nối socket.io dùng chung session
io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // socket event demo
  socket.on("chat-message", (msg) => {
    console.log("📨 Message:", msg);
    io.emit("chat-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// Import route API nếu có (ví dụ /api/login/register)
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
