const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

// Chỉ load register.js nếu người dùng bấm nút đăng ký
document.querySelector('.register-btn')?.addEventListener('click', () => {
    const script = document.createElement('script');
    script.src = '/script_login/register.js';
    document.body.appendChild(script);
});
document.querySelector('.login-btn')?.addEventListener('click', () => {
    const script = document.createElement('script');
    script.src = '/script_login/login.js';
    document.body.appendChild(script);
});