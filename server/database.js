// server/database.js
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host:     process.env.DB_HOST,     // shuttle.proxy.rlwy.net
  port:     process.env.DB_PORT,     // 33636
  user:     process.env.DB_USER,     // root
  password: process.env.DB_PASS,     // jdKvyLPDYSeGcRHMgcTZVzVZKVVlyGQT
  database: process.env.DB_NAME      // railway
});

connection.connect(err => {
  if (err) {
    console.error("❌ Không thể kết nối MySQL:", err.message);
    process.exit(1);
  }
  console.log("✅ Kết nối MySQL thành công!");
});

module.exports = connection;
