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

// Xử lý sự kiện đăng nhập
document.getElementById("submit").addEventListener("click", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username_login").value.trim();
  const email = document.getElementById("username_login").value.trim();
  const password = document.getElementById("password_login").value.trim();
  const check = document.getElementById("terms_check").checked;

  if (!username || !email || !password || !check) {
    if (!check) {
      showMessage("checkbox"); // Hiển thị lỗi chưa tick vào checkbox
    } else {
      showMessage("errorMessage"); // Hiển thị lỗi điền thiếu thông tin
    }
    return;
  }
  
  try {
    const response = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });

    const result = await response.json();

    if (response.ok) {
      showMessage("successMessage");
    } else {
      showMessage("errorMessage"); // Thông báo sai tài khoản/mật khẩu
    }
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    showMessage("errorSystem"); // Lỗi server hoặc kết nối
  }
});
