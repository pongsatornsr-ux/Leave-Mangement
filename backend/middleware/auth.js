const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // รองรับทั้ง decoded.id และ decoded.user.id
    const userId = decoded.id || decoded.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    // ✅ ปรับปรุงการจัดการ Error ตรงนี้
    if (err.name === 'TokenExpiredError') {
        // กรณี Token หมดอายุ: ไม่ต้อง log error ยาวๆ ให้รก Terminal
        // และส่งข้อความบอก Frontend ชัดเจนว่า 'Token expired'
        return res.status(401).json({ message: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
        // กรณี Token ไม่ถูกต้อง (เช่น โดนแก้ไข)
        return res.status(401).json({ message: 'Invalid token' });
    }

    // กรณี Error อื่นๆ (เช่น Database error) ค่อย log ออกมาดู
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};