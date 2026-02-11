const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware ตรวจสอบ Login
const { Holiday } = require('../models'); // Import Model Holiday

// ====================================================================
// 1. GET / - ดึงรายการวันหยุดทั้งหมด (ทุกคนดูได้)
// ====================================================================
router.get('/', auth, async (req, res) => {
    try {
        // ดึงข้อมูลวันหยุดทั้งหมด เรียงตามวันที่ (ASC)
        const holidays = await Holiday.findAll({
            order: [['date', 'ASC']]
        });

        res.json(holidays);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ====================================================================
// 2. POST / - เพิ่มวันหยุดใหม่ (Admin/HR เท่านั้น)
// ====================================================================
router.post('/', auth, async (req, res) => {
    try {
        // ตรวจสอบสิทธิ์: ต้องเป็น Admin หรือ HR เท่านั้น
        if (req.user.role !== 'admin' && req.user.role !== 'HR' && req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Forbidden: คุณไม่มีสิทธิ์เพิ่มวันหยุด' });
        }

        const { date, name } = req.body;

        // Validation พื้นฐาน
        if (!date || !name) {
            return res.status(400).json({ message: 'กรุณาระบุวันที่และชื่อวันหยุด' });
        }

        // สร้างวันหยุดใหม่
        const newHoliday = await Holiday.create({
            date,
            name
        });

        res.json(newHoliday);

    } catch (err) {
        // ดักจับ Error กรณีวันที่ซ้ำ (เพราะใน Model เราตั้ง unique: true ไว้)
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'วันนี้ถูกบันทึกเป็นวันหยุดไปแล้ว' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ====================================================================
// 3. DELETE /:id - ลบวันหยุด (Admin/HR เท่านั้น)
// ====================================================================
router.delete('/:id', auth, async (req, res) => {
    try {
        // ตรวจสอบสิทธิ์
        if (req.user.role !== 'admin' && req.user.role !== 'HR' && req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Forbidden: คุณไม่มีสิทธิ์ลบวันหยุด' });
        }

        const holiday = await Holiday.findByPk(req.params.id);

        if (!holiday) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลวันหยุด' });
        }

        await holiday.destroy();

        res.json({ message: 'ลบวันหยุดเรียบร้อยแล้ว' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;