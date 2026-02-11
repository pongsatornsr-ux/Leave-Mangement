const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User, PersonalLeave, VacationLeave } = require('../models'); // Import Models
const bcrypt = require('bcryptjs'); // เผื่อกรณีแก้รหัสผ่าน

// ====================================================================
// 1. GET / - ดึงรายชื่อพนักงานทั้งหมด (Admin/HR)
// ====================================================================
router.get('/', auth, async (req, res) => {
    try {
        // ตรวจสอบสิทธิ์ (เฉพาะ Admin และ HR เท่านั้นที่ดูได้)
        // if (req.user.role !== 'admin' && req.user.role !== 'HR' && req.user.role !== 'hr') {
        //     return res.status(403).json({ message: 'Forbidden: คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้' });
        // }

        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // ❌ ไม่ส่งรหัสผ่านกลับไป
            order: [['createdAt', 'DESC']] // เรียงจากใหม่ไปเก่า
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ====================================================================
// 2. GET /:id - ดึงข้อมูลพนักงานรายคน (สำหรับหน้าแก้ไข)
// ====================================================================
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ====================================================================
// 3. PUT /:id - แก้ไขข้อมูลพนักงาน (Admin/HR)
// ====================================================================
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'HR' && req.user.role !== 'user') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { name, email, phone, position, department, role, password } = req.body;
        
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // อัปเดตข้อมูลทั่วไป
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.position = position || user.position;
        user.department = department || user.department;
        user.role = role || user.role;

        // ถ้ามีการส่ง password มาใหม่ ให้ Hash ก่อนบันทึก
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({ message: 'อัปเดตข้อมูลสำเร็จ', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ====================================================================
// 4. DELETE /:id - ลบพนักงาน (Admin เท่านั้น)
// ====================================================================
router.delete('/:id', auth, async (req, res) => {
    try {
        // เฉพาะ Admin เท่านั้นที่ลบได้
        if (req.user.role !== 'HR') {
            return res.status(403).json({ message: 'Forbidden: Admin Only' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // ป้องกันไม่ให้ลบตัวเอง
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'ไม่สามารถลบบัญชีตัวเองได้' });
        }

        // (Optional) ลบใบลาที่เกี่ยวข้องด้วย หรือจะเก็บไว้เป็นประวัติก็ได้
        // await PersonalLeave.destroy({ where: { userId: user.id } });
        // await VacationLeave.destroy({ where: { userId: user.id } });

        await user.destroy(); // ลบ User

        res.json({ message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;