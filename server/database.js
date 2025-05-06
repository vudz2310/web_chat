require("dotenv").config();
const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});
module.exports = connection;

// Kết nối MySQL
connection.connect((err) => {
    if (err) {
        console.error("❌ Lỗi kết nối MySQL:", err.message);
        process.exit(1);
    }
    console.log("✅ Kết nối MySQL thành công!");
});

module.exports = connection;
