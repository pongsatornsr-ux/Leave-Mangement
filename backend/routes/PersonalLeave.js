const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// รวมการ import models ไว้จุดเดียวเพื่อความสะอาดของโค้ด
const { PersonalLeave, VacationLeave, User, Notification } = require('../models');

// ====================================================================
// Helper Functions
// ====================================================================

// ฟังก์ชันสำหรับส่ง notification แบบ realtime
const sendRealtimeNotification = (io, userId, message, notifObj = null) => {
  if (!io) return; 
  io.to(String(userId)).emit('newNotification', { message, notification: notifObj });
};

// ฟังก์ชันแจ้งเตือนตาม Role
async function notifyByRole(role, message, leaveId, io) {
  try {
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
// 1. POST /create - สร้างใบลา (User ส่งคำขอ)
// ====================================================================
router.post('/create', auth, async (req, res) => {
  try {
    const {
      writtenAt, date, subject, to, name, position, department, type,
      sickReason, personalReason, startDate, endDate, totalDays, durationDays,
      leaveTimeSlot, // ✅ เพิ่ม: รับค่าช่วงเวลา (เช้า/บ่าย)
      lastLeaveType, lastStartDate, lastEndDate, lastTotalDays, contact,
      stat_sick_used, stat_sick_current, stat_sick_total,
      stat_personal_used, stat_personal_current, stat_personal_total,
      vacationAccumulated, vacationThisYear, vacationTotal,
      statsPreviousDays, statsCurrentDays, statsTotalDays,
      signature, managerSignature, checkerName, checkerPosition, checkerDate,
      signName, managerSign, approveDate, status, rejectReason
    } = req.body;

    const leave = await PersonalLeave.create({
      userId: req.user.id,
      writtenAt, date, subject, to, name, position, department, type,
      sickReason, personalReason, startDate, endDate, totalDays, durationDays,
      leaveTimeSlot, // ✅ เพิ่ม: บันทึกลง Database
      lastLeaveType, lastStartDate, lastEndDate, lastTotalDays, contact,
      stat_sick_used, stat_sick_current, stat_sick_total,
      stat_personal_used, stat_personal_current, stat_personal_total,
      vacationAccumulated, vacationThisYear, vacationTotal,
      statsPreviousDays, statsCurrentDays, statsTotalDays,
      signature, managerSignature, checkerName, checkerPosition, checkerDate,
      signName, managerSign, approveDate,
      status: status || 'pending',
      rejectReason
    });

    // -------------------------------------------------------------
    // แจ้งเตือนหา Foreman
    // -------------------------------------------------------------
    const io = req.app.get('io');
    await notifyByRole('foreman', `มีคำขอลาใหม่จาก ${req.user.name}`, leave.id, io);

    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// 2. GET /my - User ดูใบลาของตัวเอง
// ====================================================================
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [vacationLeaves, personalLeaves] = await Promise.all([
      VacationLeave.findAll({ 
        where: { userId },
        order: [['createdAt', 'DESC']]
      }),

      PersonalLeave.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      })
    ]);

    res.json({
      vacationLeaves, 
      personalLeaves
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// GET /latest
// ====================================================================
router.get('/latest', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id; 
    const latestLeave = await PersonalLeave.findOne({
      where: { 
        userId: currentUserId,
        status: 'approved'
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(latestLeave);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ====================================================================
// GET /hr
// ====================================================================
router.get('/hr', auth, async (req, res) => {
  try {
    if (req.user.role !== 'HR' && req.user.role !== 'hr')
      return res.status(403).json({ message: 'Forbidden' });

    const leaves = await PersonalLeave.findAll({
      include: [{ model: User, as: 'personalUser', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// GET /fore (Foreman)
// ====================================================================
router.get('/fore', auth, async (req, res) => {
  try {
    if (req.user.role !== 'foreman' && req.user.role !== 'hr') 
      return res.status(403).json({ message: 'Forbidden' });

    const leaves = await PersonalLeave.findAll({
      include: [{ model: User, as: 'personalUser', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']]
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
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ====================================================================
// GET /admin
// ====================================================================
router.get("/admin", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });    

    const leaves = await PersonalLeave.findAll({
      include: [{ model: User,as: 'personalUser', attributes: ['id', 'name', 'email', 'role'] }],
      order: [["id", "DESC"]]
    });

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }       
});

router.get('/admindetail/:id', auth, async (req, res) => {
  try {
    const leave = await PersonalLeave.findByPk(req.params.id, {
      include: [{ model: User, as: 'personalUser', attributes: ['id', 'name', 'email', 'role'] }]
    });

    if (!leave) return res.status(404).json({ message: 'ไม่พบใบลา' });

    if (req.user.id !== leave.userId && !['admin', 'HR', 'hr', 'foreman'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { Op } = require('sequelize'); 
    
    const previousLeave = await PersonalLeave.findOne({
        where: { 
            userId: leave.userId, 
            id: { [Op.lt]: leave.id },
            status: 'approved'
        },
        order: [['id', 'DESC']],
        attributes: ['id', 'stat_sick_total', 'stat_personal_total'] 
    });

    const leaveData = leave.toJSON();
    leaveData.previousLeave = previousLeave; 
    
    res.json(leaveData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// GET /detail/:id
// ====================================================================
router.get('/detail/:id', auth, async (req, res) => {
  try {
    const leave = await PersonalLeave.findByPk(req.params.id, {
      include: [{ model: User, as: 'personalUser', attributes: ['id', 'name', 'email', 'role'] }]
    });

    if (!leave) return res.status(404).json({ message: 'ไม่พบใบลา' });

    if (req.user.id !== leave.userId && req.user.role !== 'admin' && req.user.role !== 'HR' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ====================================================================
// PUT /:id/status (Admin Force Update)
// ====================================================================
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const { status, reason } = req.body;
    const leave = await PersonalLeave.findByPk(req.params.id);

    if (!leave) return res.status(404).json({ message: 'Not found' });

    leave.status = status;
    leave.rejectReason = status === 'rejected' ? reason : null; 
    await leave.save();

    const notifMessage = status === 'approved'
      ? 'คำลาของคุณถูกอนุมัติโดย Admin'
      : `คำลาของคุณถูกปฏิเสธ: ${reason || 'ไม่มีเหตุผล'}`;

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
// PUT /update/:id (แก้ไขใบลา)
// ====================================================================
router.put('/update/:id', auth, async (req, res) => {
    try {
        const leaveId = req.params.id;
        const updates = req.body;

        const leave = await PersonalLeave.findByPk(leaveId);

        if (!leave) return res.status(404).json({ message: 'ไม่พบใบลาที่ต้องการแก้ไข' });

        if (req.user.id !== leave.userId && req.user.role !== 'admin' && req.user.role !== 'HR' && req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Forbidden: คุณไม่มีสิทธิ์แก้ไขคำขอนี้' });
        }
        
        if (req.user.id === leave.userId && (leave.status === 'approved' || leave.status === 'rejected')) {
             return res.status(403).json({ message: 'Forbidden: ไม่สามารถแก้ไขคำขอที่ถูกอนุมัติ/ปฏิเสธแล้ว' });
        }

        await leave.set(updates); // update แบบนี้ถ้ามี leaveTimeSlot ใน updates ก็จะถูกแก้ด้วยอัตโนมัติ
        await leave.save();

        res.json({ message: 'แก้ไขข้อมูลใบลาสำเร็จ', leaveId: leave.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// ====================================================================
// PATCH /approve/:id (Workflow Approval: Foreman -> HR -> Manager)
// ====================================================================
router.patch('/approve/:id', auth, async (req, res) => {
    try {
        const leaveId = req.params.id;
        const approvalUpdates = req.body;

        const leave = await PersonalLeave.findByPk(leaveId);
        if (!leave) {
            return res.status(404).json({ message: 'ไม่พบใบลา' });
        }

        const allowedRoles = ['foreman', 'HR', 'hr', 'manager', 'admin'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ดำเนินการ' });
        }

        const fieldsToUpdate = [
            'checkerVerified', 'checkerName', 'checkerPosition', 'checkerDate',
            'managerDecision', 'rejectReason', 'managerSignature', 'checkerSignature',
            'managerName', 'managerPosition', 'approveDate',
            'stat_sick_used', 'stat_sick_current', 'stat_sick_total',
            'stat_personal_used', 'stat_personal_current', 'stat_personal_total',
            'foremanVerified', 'foremanSignature', 'foremanName', 'foremanPosition', 'foremanDate',
            'leaveTimeSlot' // ✅ เพิ่ม: เผื่อกรณี HR/Admin ต้องการแก้ไขข้อมูลช่วงเวลาให้ถูกต้อง
        ];

        fieldsToUpdate.forEach(field => {
            if (approvalUpdates.hasOwnProperty(field)) {
                leave[field] = approvalUpdates[field];
            }
        });

        const io = req.app.get('io');
        const currentStatus = leave.status;

        // STEP 1: Foreman → HR
        if (currentStatus === 'pending' && req.user.role === 'foreman') {
            leave.status = 'pending_hr';
            await leave.save();
            // แจ้งเตือน HR
            await notifyByRole('HR', 'มีใบลาจากหัวหน้างานรอ HR ตรวจสอบ', leave.id, io);
            return res.json({ message: 'ส่งใบลาให้ HR เรียบร้อย', status: leave.status });
        }

        // STEP 2: HR → Manager (Admin)
        if (currentStatus === 'pending_hr' && (req.user.role === 'HR' || req.user.role === 'hr')) {
            leave.status = 'pending_manager';
            await leave.save();
            await notifyByRole('admin', 'มีใบลารอผู้จัดการพิจารณา', leave.id, io);
            return res.json({ message: 'ส่งใบลาให้ผู้จัดการเรียบร้อย', status: leave.status });
        }

        // STEP 3: Manager → Approved / Rejected
        if (currentStatus === 'pending_manager' && req.user.role === 'admin') {
            if (approvalUpdates.managerDecision === 'approve') {
                leave.status = 'approved';
            } else if (approvalUpdates.managerDecision === 'reject') {
                leave.status = 'rejected';
            } else {
                return res.status(400).json({ message: 'กรุณาระบุผลการอนุมัติ' });
            }

            await leave.save();

            // อัปเดตสถิติวันลาของ User
            if (leave.status === 'approved') {
                const daysToAdd = parseFloat(leave.totalDays) || 0;
                const user = await User.findByPk(leave.userId);
                if (user) {
                    const leaveType = leave.type?.toLowerCase() || '';
                    if (leaveType.includes('sick')) {
                        user.stat_sick_used = (parseFloat(user.stat_sick_used) || 0) + daysToAdd;
                    } else if (leaveType.includes('personal')) {
                        user.stat_personal_used = (parseFloat(user.stat_personal_used) || 0) + daysToAdd;
                    }
                    await user.save();
                }
            }

            // เตรียมข้อความแจ้งผล
            const decisionText = leave.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ';
            const reason = leave.rejectReason ? ` (${leave.rejectReason})` : '';

            // 1. แจ้งเตือนกลับไปยัง User เจ้าของใบลา
            const notif = await Notification.create({
                userId: leave.userId,
                message: `คำลาของคุณถูก${decisionText}${reason}`,
                leaveId: leave.id
            });

            if (io) {
                sendRealtimeNotification(io, leave.userId, notif.message, notif);
            }

            // -----------------------------------------------------------
            // 2. แจ้งเตือนไปยัง HR (เพิ่มใหม่)
            // -----------------------------------------------------------
            const msgForHR = `ใบลาของ${leave.name} ได้รับการ${decisionText}โดยผู้อำนวยการเเล้ว`;
            await notifyByRole('HR', msgForHR, leave.id, io);
            // -----------------------------------------------------------

            return res.json({ message: 'ดำเนินการอนุมัติเรียบร้อย', status: leave.status });
        }

        return res.status(400).json({ message: 'ไม่สามารถเปลี่ยนสถานะข้ามขั้นของ Workflow ได้' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ====================================================================
// 9. DELETE /:id - ลบใบลา
// ====================================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!['HR', 'hr', 'admin'].includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });

    const leave = await PersonalLeave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Not found' });

    await leave.destroy();
    res.json({ message: 'ลบคำขอเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;