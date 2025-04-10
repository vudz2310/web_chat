function showMessage(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = "flex";
    } else {
        console.error(`Không tìm thấy phần tử với id: ${id}`);
    }
}

  // Ẩn thông báo
  function hideMessage(id) {
    document.getElementById(id).style.display = "none";
  }
  
  // Gắn sự kiện đóng cho tất cả nút đóng (chung)
  document.querySelectorAll(".closeBtn").forEach(btn => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      hideMessage(targetId);
  
      if (targetId === "successMessage") {
        window.location.href = "/src/login_success/index.html";
      }
    });
  });
document.getElementById("submit").addEventListener("click", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username_create").value.trim();
    const email = document.getElementById("email_create").value.trim();
    const password = document.getElementById("password_create").value.trim();
    const confirmPassword = document.getElementById("password_create_again").value.trim();
    const check = document.getElementById("terms_check").checked;

    if (!username || !email || !password || !confirmPassword|| !check) {
        if (!check) {
            showMessage("checkbox"); // Hiển thị lỗi chưa tick vào checkbox
          } else {
            showMessage("errorMessage"); // Hiển thị lỗi điền thiếu thông tin
          }
          return;
        }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("errorEmail"); // Hiển thị lỗi email không hợp lệ
        return;
    }
    if (password.length < 6) {
        showMessage("errorPassword"); // Hiển thị lỗi mật khẩu quá ngắn
        return;
    }

    if (password !== confirmPassword) {
        showMessage("password2"); // Hiển thị lỗi mật khẩu không khớp
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const result = await response.json();
        if (response.ok) {
            showMessage("successMessage");
            window.location.href = "/src/Login_register/login.html";
        } else {
            showMessage("errorEmail"); // Thông báo lỗi từ server
        }
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        showMessage("errorSystem"); // Lỗi server hoặc kết nối
    }
});