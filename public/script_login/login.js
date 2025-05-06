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
  const el = document.getElementById(id);
  if (el) {
      el.style.display = "none";
  } else {
      console.warn(`Phần tử với ID "${id}" không tồn tại.`);
  }
}

// Gắn sự kiện đóng cho tất cả nút đóng (chung)
document.querySelectorAll(".closeBtn").forEach(btn => {
  btn.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target");
    hideMessage(targetId);

    if (targetId === "successMessage-login") {
      window.location.href = "/src/login_success/index.html";
    }
  });
});

// Xử lý sự kiện đăng nhập
document.getElementById("submit-login").addEventListener("click", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username_login").value.trim();
  const email = document.getElementById("username_login").value.trim();
  const password = document.getElementById("password_login").value.trim();


  if (!username || !email || !password) {
    showMessage("errorMessage"); // Hiển thị lỗi điền thiếu thông tin
    return;
  }
  
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });

    const result = await response.json();

    if (response.ok) {
      showMessage("successMessage-login");
    } else {
      showMessage("errorMessage"); // Thông báo sai tài khoản/mật khẩu
    }
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    showMessage("errorSystem"); // Lỗi server hoặc kết nối
  }
});
