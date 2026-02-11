const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Notification } = require('../models');

// ==========================================================
// 4. PUT /mark-all-read - ต้องมาไว้ก่อน /:id/read
// ==========================================================
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error("Mark All Read Error:", err);
    res.status(500).send('Server error');
  }
});

// ==========================================================
// 1. GET / - ดึงทั้งหมด
// ==========================================================
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    console.error("Get All Notifications Error:", err);
    res.status(500).send('Server error');
  }
});

// ==========================================================
// 2. GET /unread - ดึงยังไม่ได้อ่าน
// ==========================================================
router.get('/unread', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id, isRead: false },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    console.error("Get Unread Notifications Error:", err);
    res.status(500).send('Server error');
  }
});

// ==========================================================
// 3. PUT /:id/read - อ่านทีละรายการ
// ==========================================================
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);

    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    if (notif.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notif.isRead = true;
    await notif.save();

    res.json(notif);
  } catch (err) {
    console.error("Mark Read Error:", err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
