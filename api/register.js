async function handleRegister() {
const name = document.getElementById('reg-name').value;
const email = document.getElementById('reg-email').value;
const password = document.getElementById('reg-password').value;

try {
const res = await fetch(`${API_URL}/register`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name, email, password })
});
const data = await res.json();

if (!res.ok) throw new Error(data.message);

// Gửi link kích hoạt qua EmailJS
const activationUrl = `${API_URL}/verify?token=${data.verifyToken}`;

await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
to_name: data.name,
to_email: data.email,
action_url: activationUrl
});

alert('Đăng ký thành công! Vui lòng kiểm tra hộp thư Email để kích hoạt tài khoản.');
} catch (err) {
alert(err.message || 'Lỗi đăng ký');
}
}