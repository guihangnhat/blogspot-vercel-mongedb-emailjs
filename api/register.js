import dbConnect from '../utils/dbConnect';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
// Cấu hình CORS cho phép Blogspot truy cập
res.setHeader('Access-Control-Allow-Credentials', true);
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
res.setHeader(
'Access-Control-Allow-Headers',
'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
);

// Xử lý request Preflight (OPTIONS)
if (req.method === 'OPTIONS') {
res.status(200).end();
return;
}

if (req.method !== 'POST') {
return res.status(405).json({ message: 'Method Not Allowed' });
}

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

await User.create({
name,
email,
password: hashedPassword,
isVerified: false,
verifyToken
});

return res.status(201).json({
message: 'Đăng ký thành công! Đang gửi email kích hoạt...',
verifyToken,
email,
name
});
} catch (error) {
return res.status(500).json({ message: 'Lỗi máy chủ: ' + error.message });
}
}