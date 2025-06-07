const express = require("express");
const db = require("./database");
const session = require("express-session");

module.exports = function (io) {
    const router = express.Router();

    // ✅ Middleware kiểm tra đăng nhập
    const requireLogin = (req, res, next) => {
        if (!req.session?.user) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
        }
        next();
    };

    // ✅ Đăng nhập
    router.post("/login", (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Tên đăng nhập và mật khẩu không được để trống." });
        }

        db.query("SELECT * FROM login WHERE username = ?", [username], (err, results) => {
            if (err) return res.status(500).json({ message: "Lỗi hệ thống." });

            const user = results[0];
            if (!user || user.password !== password) {
                return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu." });
            }

            req.session.user = { id: user.id, username: user.username };
            res.cookie("sessionID", req.sessionID, { httpOnly: true, secure: false });
            return res.json({ success: true, user: req.session.user, redirect: "/chat.html" });
        });
    });

    // ✅ Kiểm tra phiên đăng nhập
    router.get("/check-session", (req, res) => {
        if (req.session.user) {
            res.json({ loggedIn: true, user: req.session.user });
        } else {
            res.json({ loggedIn: false });
        }
    });

    // ✅ Đăng ký
    router.post("/register", (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
        }

        db.query("SELECT * FROM register WHERE username = ? OR email = ?", [username, email], (err, results) => {
            if (err) return res.status(500).json({ message: "Lỗi hệ thống." });
            if (results.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại." });
            }

            db.query("INSERT INTO register (username, email, password) VALUES (?, ?, ?)",
                [username, email, password], (err) => {
                    if (err) return res.status(500).json({ message: "Lỗi khi tạo tài khoản." });
                    res.status(201).json({ message: "Đăng ký thành công!" });
                });
        });
    });

    // ✅ Đăng xuất
    router.post("/logout", (req, res) => {
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: "Không thể đăng xuất!" });
            res.clearCookie("sessionID");
            res.json({ success: true, message: "Đăng xuất thành công!" });
        });
    });

    // ✅ Lấy danh sách người dùng
    router.get("/users", requireLogin, (req, res) => {
        db.query("SELECT id, username FROM register", (err, results) => {
            if (err) return res.status(500).json({ message: "Lỗi hệ thống." });
            res.json(results);
        });
    });

    // ✅ Gửi tin nhắn
    router.post("/messages", requireLogin, (req, res) => {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
        }

        db.query("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
            [senderId, receiverId, message], (err) => {
                if (err) {
                    console.error("❌ Lỗi khi lưu tin nhắn:", err);
                    return res.status(500).json({ message: "Lỗi hệ thống." });
                }

                io.emit("newMessage", { senderId, receiverId, message });
                res.status(201).json({ success: true, message: "Tin nhắn đã gửi!" });
            });
    });

    // ✅ Nhận tin nhắn giữa 2 người
    router.get("/messages", requireLogin, (req, res) => {
        const { senderId, receiverId } = req.query;

        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Thiếu thông tin người gửi hoặc người nhận." });
        }

        const query = `
            SELECT 
                m.id, m.sender_id, m.receiver_id, m.message, m.created_at AS timestamp,
                u.username AS sender_username
            FROM messages m
            JOIN register u ON m.sender_id = u.id
            WHERE 
                (m.sender_id = ? AND m.receiver_id = ?) OR
                (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;

        db.query(query, [senderId, receiverId, receiverId, senderId], (err, results) => {
            if (err) {
                console.error("❌ Lỗi khi lấy tin nhắn:", err);
                return res.status(500).json({ message: "Lỗi hệ thống." });
            }
            res.json(results);
        });
    });

    // ✅ Cấu hình socket.io
    io.on("connection", (socket) => {
        console.log("🟢 Người dùng đã kết nối");

        socket.on("sendMessage", (data) => {
            db.query("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
                [data.senderId, data.receiverId, data.message], (err) => {
                    if (!err) io.emit("newMessage");
                });
        });

        socket.on("disconnect", () => console.log("🔌 Người dùng đã thoát"));
    });

    return router;
};
