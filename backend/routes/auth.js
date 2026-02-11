const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // ใช้ bcryptjs
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// =======================
// Register Route
// =======================
router.post('/register', async (req, res) => {
  const { name, email, password, role, position, department, phone } = req.body;

  try {
    // ตรวจสอบว่าอีเมลถูกใช้งานแล้วหรือยัง
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    // เข้ารหัสรหัสผ่าน
    const hashed = await bcrypt.hash(password, 10);

    // สร้าง User ใหม่ (เพิ่มฟิลด์ใหม่ทั้งหมด)
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      position,
      department,
      phone
    });

    // สร้าง token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ส่งข้อมูลกลับ frontend
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        department: user.department,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// =======================
// Login Route
// =======================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // สร้าง JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // ส่ง response กลับ
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
