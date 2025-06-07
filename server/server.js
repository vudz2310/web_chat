require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./database"); // đảm bảo đây là connection mysql2 đã tạo

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

// Cấu hình session store MySQL
const sessionStore = new MySQLStore({}, db);

// Cấu hình session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { secure: false, httpOnly: true, sameSite: "lax" },
});

// CORS options
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  methods: ["GET", "POST"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "home.html"));
});

// Initialize socket.io with cors options
const io = new Server(server, {
  cors: corsOptions,
});

// Allow socket.io to use express-session middleware
io.engine.use(sessionMiddleware);

// API routes with io passed
const apiRoutes = require("./api")(io);
app.use("/api", apiRoutes);

// MySQL connection test
db.connect((err) => {
    if (err) {
      console.error("❌ Không thể kết nối MySQL:", err.message);
      process.exit(1);
    }
    console.log("✅ Kết nối MySQL thành công!");
  });

// Socket.io event example
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Bạn có thể thêm sự kiện socket ở đây

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
