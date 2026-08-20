import dbConnect from '../utils/dbConnect';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import emailjs from '@emailjs/nodejs';

export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

try {
await dbConnect();
const { name, email, password } = req.body;

if (!name || !email || !password) {
return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
}

const existingUser = await User.findOne({ email });
if (existingUser) {
return res.status(400).json({ message: 'Email đã được sử dụng' });
}

const hashedPassword = await bcrypt.hash(password, 10);
const verifyToken = crypto.randomBytes(32).toString('hex');

// 1. Lưu người dùng vào MongoDB
await User.create({
name,
email,
password: hashedPassword,
isVerified: false,
verifyToken
});

// 2. Tạo link kích hoạt
const activationUrl = `https://${req.headers.host}/api/verify?token=${verifyToken}`;

// 3. Gửi Email qua EmailJS ngay tại Server
await emailjs.send(
'service_ls96dja', // YOUR_SERVICE_ID
'template_reno0s7', // YOUR_TEMPLATE_ID
{
to_name: name,
to_email: email,
action_url: activationUrl
},
{
publicKey: 'Ymp4CsZ6EhJtaDT-k', // YOUR_PUBLIC_KEY
privateKey: 'cimxyJG6MkYNZMxL_B-kb' // Lấy trong EmailJS Account Settings
}
);

return res.status(201).json({
message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.'
});

} catch (error) {
return res.status(500).json({ message: 'Lỗi server: ' + error.message });
}
}