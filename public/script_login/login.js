// Hiển thị thông báo
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

// Gắn sự kiện đóng cho tất cả các nút đóng
document.querySelectorAll(".closeBtn").forEach(btn => {
  btn.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target");
    hideMessage(targetId);

    // Điều hướng sau khi đăng nhập thành công
    if (targetId === "successMessage-login") {
      window.location.href = "/src/login_success/index.html";
    }
  });
});

// Xử lý sự kiện đăng nhập
document.getElementById("submit-login").addEventListener("click", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username_login").value.trim();
  const password = document.getElementById("password_login").value.trim();

  if (!username || !password) {
    showMessage("errorMessage"); // Thiếu thông tin
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password }),
      credentials: "include" // Cho phép cookie session
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("successMessage-login");
    } else {
      console.warn("Đăng nhập thất bại:", result.message);
      showMessage("errorMessage");
    }
  } catch (error) {
    console.error("❌ Lỗi khi gọi API đăng nhập:", error);
    showMessage("errorSystem");
  }
});
