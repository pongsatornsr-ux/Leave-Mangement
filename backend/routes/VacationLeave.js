const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// รวมการ import models ไว้จุดเดียวเพื่อความสะอาดของโค้ด
const { VacationLeave, User, Notification } = require('../models');
const { Op } = require('sequelize');

// ====================================================================
// Helper Functions
// ====================================================================

// ฟังก์ชันสำหรับส่ง notification แบบ realtime
// ✅ แก้ไข: ส่งไปที่ Room ชื่อ userId (String) ให้ตรงกับ server.js และ logic เหมือน personalLeaves.js
const sendRealtimeNotification = (io, userId, message, notifObj = null) => {
  if (!io) return; // กัน Error กรณีไม่มี IO
  io.to(String(userId)).emit('newNotification', { message, notification: notifObj });
};

// ฟังก์ชันแจ้งเตือนตาม Role (เช่น แจ้ง HR ทุกคน)
async function notifyByRole(role, message, leaveId, io) {
  try {
    // ค้นหา User ตาม Role ที่ระบุ
    const users = await User.findAll({ where: { role } });

    for (const user of users) {
      const notif = await Notification.create({
        userId: user.id,
        message,
        leaveId
      });

      if (io) {
        sendRealtimeNotification(io, user.id, notif.message, notif);
      }
    }
  } catch (err) {
    console.error(`Error notifying role ${role}:`, err);
  }
}

// ====================================================================
// 1. POST /create - สร้างใบลาพักผ่อน (User ส่งคำขอ)
// ====================================================================
router.post('/create', auth, async (req, res) => {
  try {
    const {
      writtenAt, date, subject, to, name, position, department,
      vacationAccumulated, vacationThisYear, vacationTotal,
      startDate, endDate, durationDays, contact,
      statsPreviousDays, statsCurrentDays, statsTotalDays,
      signature, signName, managerSign, approveDate
    } = req.body;

    const leave = await VacationLeave.create({
      userId: req.user.id,
      writtenAt, date, subject, to, name, position, department,
      vacationAccumulated, vacationThisYear, vacationTotal,
      startDate, endDate, durationDays, contact,
      statsPreviousDays, statsCurrentDays, statsTotalDays,
      signature, signName, managerSign, approveDate,
      status: 'pending'
    });

    // -------------------------------------------------------------
    // แจ้งเตือนหา Foreman (ปรับให้ใช้ notifyByRole เหมือน personalLeaves)
    // -------------------------------------------------------------
    const io = req.app.get('io');
    await notifyByRole('foreman', `มีคำขอลาพักผ่อนใหม่จาก ${req.user.name}`, leave.id, io);

    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// 2. GET /latest-stats/:userId - ดึงยอดวันลาสะสมล่าสุด
// ====================================================================
router.get('/latest-stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // ใช้ Sequelize ค้นหาใบลาล่าสุดที่อนุมัติแล้ว
    const lastLeave = await VacationLeave.findOne({
      where: { 
        userId: userId, 
        status: 'approved' 
      },
      order: [['id', 'DESC']], // เรียงจากใหม่ไปเก่า
      attributes: ['statsTotalDays'] // เอาแค่ฟิลด์นี้
    });

    // ถ้าเจอ ให้ส่งค่ากลับไป, ถ้าไม่เจอ (เพิ่งลาครั้งแรก) ให้ส่ง 0
    const lastTotal = lastLeave ? lastLeave.statsTotalDays : 0;
    
    res.json({ lastTotalDays: Number(lastTotal) });

  } catch (err) {
    console.error("Error fetching latest stats:", err);
    res.status(500).json({ error: "Server error fetching stats" });
  }
});

// ====================================================================
// 3. GET Routes (My, HR, Foreman, Admin, Details)
// ====================================================================

router.get('/my', auth, async (req, res) => {
  try {
    const leaves = await VacationLeave.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/hr', auth, async (req, res) => {
  try {
    // อนุญาตให้ทั้ง Role 'HR' และ 'hr'
    if (req.user.role !== 'HR' && req.user.role !== 'hr') 
      return res.status(403).json({ message: 'Forbidden' });

    const leaves = await VacationLeave.findAll({
      include: [{ model: User, as: 'vacationUser', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/fore', auth, async (req, res) => {
  try {
    if (req.user.role !== 'foreman' && req.user.role !== 'hr') 
      return res.status(403).json({ message: 'Forbidden' });

    const leaves = await VacationLeave.findAll({
      include: [{ model: User, as: 'vacationUser', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/detail/:id', auth, async (req, res) => {
  try {
    const leave = await VacationLeave.findByPk(req.params.id, {
      include: [{ model: User, as: 'vacationUser', attributes: ['id', 'name', 'email', 'role'] }]
    });
    if (!leave) return res.status(404).json({ message: 'ไม่พบใบลา' });
    
    if (req.user.id !== leave.userId && !['admin', 'HR', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    
    const leaves = await VacationLeave.findAll({
      include: [{ model: User, as: 'vacationUser', attributes: ['id', 'name', 'email', 'role'] }],
      order: [["id", 'DESC']]
    });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); 
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // ส่งข้อมูลเหมือน personalLeaves เพื่อความสม่ำเสมอ
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get('/admindetail/:id', auth, async (req, res) => {
  try {
    const leave = await VacationLeave.findByPk(req.params.id, {
      include: [{ model: User, as: 'vacationUser', attributes: ['id', 'name', 'email', 'role'] }]
    });
    if (!leave) return res.status(404).json({ message: 'ไม่พบใบลา' });

    const allowedRoles = ['admin', 'HR', 'hr', 'foreman', 'manager'];
    if (req.user.id !== leave.userId && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// 4. PUT /:id/status - Admin อัปเดตสถานะใบลา (Quick Update)
// ====================================================================
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') 
      return res.status(403).json({ message: 'Forbidden' });

    const { status, reason } = req.body;
    const leave = await VacationLeave.findByPk(req.params.id);

    if (!leave) return res.status(404).json({ message: 'Not found' });

    leave.status = status;
    leave.rejectReason = status === 'rejected' ? reason : null;
    await leave.save();

    // แจ้งเตือน (Pattern เดียวกับ personalLeaves)
    const notifMessage = status === 'approved' 
      ? 'คำลาพักผ่อนของคุณถูกอนุมัติโดย Admin' 
      : `คำลาพักผ่อนของคุณถูกปฏิเสธ: ${reason || 'ไม่มีเหตุผล'}`;
    
    const notif = await Notification.create({
      userId: leave.userId,
      message: notifMessage,
      leaveId: leave.id
    });

    if (req.app.get('io')) {
      sendRealtimeNotification(req.app.get('io'), leave.userId, notif.message, notif);
    }

    res.json({ message: 'อัปเดตสถานะเรียบร้อย', leave });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// 5. PUT /update/:id - แก้ไขข้อมูลใบลา (User/Admin)
// ====================================================================
router.put('/update/:id', auth, async (req, res) => {
  try {
    const leaveId = req.params.id;
    const updates = req.body;
    const leave = await VacationLeave.findByPk(leaveId);

    if (!leave) return res.status(404).json({ message: 'ไม่พบใบลา' });

    if (req.user.id !== leave.userId && !['admin', 'HR', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (req.user.id === leave.userId && (leave.status === 'approved' || leave.status === 'rejected')) {
      return res.status(403).json({ message: 'ไม่สามารถแก้ไขคำขอที่สิ้นสุดแล้ว' });
    }

    await leave.set(updates);
    await leave.save();
    res.json({ message: 'แก้ไขข้อมูลใบลาพักผ่อนสำเร็จ', leaveId: leave.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// 6. PATCH /approve/:id - Workflow Approval (Foreman -> HR -> Manager)
// ====================================================================
router.patch('/approve/:id', auth, async (req, res) => {
  try {
    const leaveId = req.params.id;
    const approvalUpdates = req.body;
    const leave = await VacationLeave.findByPk(leaveId);
    
    if (!leave) return res.status(404).json({ message: 'ไม่พบใบลาพักผ่อน' });

    // ตรวจสอบสิทธิ์ (Role)
    const allowedRoles = ['admin', 'foreman', 'HR', 'hr', 'manager'];
    if (!allowedRoles.includes(req.user.role)) 
      return res.status(403).json({ message: 'Forbidden' });

    // กำหนดฟิลด์ที่อนุญาตให้อัปเดต
    const fieldsToUpdate = [
      'checkerVerified', 'checkerName', 'checkerPosition', 'checkerDate', 'checkerSignature',
      'managerDecision', 'rejectReason', 'managerSignature',
      'managerName', 'managerPosition', 'approveDate',
      'foremanVerified', 'foremanSignature', 'foremanName', 'foremanPosition', 'foremanDate',
      'statsPreviousDays', 'statsCurrentDays', 'statsTotalDays',
      'vacationAccumulated', 'vacationThisYear', 'vacationTotal'
    ];

    fieldsToUpdate.forEach(field => {
      if (approvalUpdates.hasOwnProperty(field)) {
        leave[field] = approvalUpdates[field];
      }
    });

    const io = req.app.get('io');
    const currentStatus = leave.status;

    // -----------------------------------------------------------------------
    // STEP 1: Foreman -> HR
    // -----------------------------------------------------------------------
    if (currentStatus === 'pending' && req.user.role === 'foreman') {
      leave.status = 'pending_hr';
      await leave.save();
      
      // แจ้งเตือน HR
      await notifyByRole('HR', 'มีใบลาพักผ่อนจากหัวหน้างานรอ HR ตรวจสอบ', leave.id, io);
      return res.json({ message: 'ส่งต่อให้ HR เรียบร้อย', status: leave.status });
    }

    // -----------------------------------------------------------------------
    // STEP 2: HR -> Manager (Admin)
    // -----------------------------------------------------------------------
    if (currentStatus === 'pending_hr' && (req.user.role === 'HR' || req.user.role === 'hr')) {
      leave.status = 'pending_manager';
      await leave.save();
      
      // แจ้งเตือน Admin (Manager)
      await notifyByRole('admin', 'มีใบลาพักผ่อนรอผู้จัดการพิจารณา', leave.id, io); 
      return res.json({ message: 'ส่งต่อให้ผู้จัดการเรียบร้อย', status: leave.status });
    }

    // -----------------------------------------------------------------------
    // STEP 3: Manager -> Approved/Rejected (จุดที่มีการแก้ไข)
    // -----------------------------------------------------------------------
    if (currentStatus === 'pending_manager' && req.user.role === 'admin') {
      
      // ตรวจสอบผลการอนุมัติ
      if (approvalUpdates.managerDecision === 'approve') {
        leave.status = 'approved';
      } else if (approvalUpdates.managerDecision === 'reject') {
        leave.status = 'rejected';
      } else {
        return res.status(400).json({ message: 'กรุณาระบุผลการอนุมัติ' });
      }

      await leave.save();

      // เตรียมข้อความ
      const decisionText = leave.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
      const reason = leave.rejectReason ? ` (${leave.rejectReason})` : '';

      // --- 3.1 แจ้งเตือนกลับไปยัง User (เจ้าของใบลา) ---
      const notifUser = await Notification.create({
        userId: leave.userId,
        message: `คำลาพักผ่อนของคุณถูก${decisionText}${reason}`,
        leaveId: leave.id
      });
      
      if (io) {
        sendRealtimeNotification(io, leave.userId, notifUser.message, notifUser);
      }

      // --- 3.2 แจ้งเตือนไปยัง HR (เพิ่มใหม่) ---
      const msgForHR = `ใบลาของ${leave.name} ได้รับการ${decisionText}โดยผู้อำนวยการเเล้ว`;
      
      // เรียกใช้ฟังก์ชัน notifyByRole ส่งหา Role HR
      await notifyByRole('HR', msgForHR, leave.id, io);

      return res.json({ message: 'ดำเนินการอนุมัติเรียบร้อย', status: leave.status });
    }

    // กรณีสถานะไม่ถูกต้อง หรือไม่มีสิทธิ์ในขั้นตอนนี้
    return res.status(400).json({ message: 'ไม่สามารถเปลี่ยนสถานะข้ามขั้น หรือสิทธิ์ไม่ถูกต้อง' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ====================================================================
// 7. DELETE /:id - ลบใบลา
// ====================================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!['HR', 'hr', 'admin'].includes(req.user.role)) 
      return res.status(403).json({ message: 'Forbidden' });

    const leave = await VacationLeave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Not found' });

    await leave.destroy();
    res.json({ message: 'ลบคำขอเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;