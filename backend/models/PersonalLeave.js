const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ปรับ path ตามโปรเจคคุณ

class PersonalLeave extends Model {}

PersonalLeave.init({

  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  leaveTimeSlot: {
    type: DataTypes.STRING,
    allowNull: true, // ยอมให้เป็นค่าว่างได้ (กรณีลาเต็มวัน)
    comment: 'ช่วงเวลาที่ลา: morning=เช้า, afternoon=บ่าย'
  },

  // -------------------------------
  // 📌 ส่วนหัวฟอร์ม
  // -------------------------------
  writtenAt: DataTypes.STRING,  // เขียนที่
  date: DataTypes.STRING,       // วันที่
  subject: DataTypes.STRING,    // เรื่อง
  to: DataTypes.STRING,         // เรียน

  // -------------------------------
  // 📌 ข้อมูลผู้ลา / พนักงาน
  // -------------------------------
  name: DataTypes.STRING,
  position: DataTypes.STRING,
  department: DataTypes.STRING,

  // -------------------------------
  // 📌 ประเภทการลา
  // -------------------------------
  type: DataTypes.STRING, // sick | personal | maternity | vacation

  // -------------------------------
  // 📌 รายละเอียดเฉพาะประเภทการลา
  // -------------------------------
  sickReason: DataTypes.TEXT,
  personalReason: DataTypes.TEXT,

  // -------------------------------
  // 📌 วันลา
  // -------------------------------
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  totalDays: DataTypes.STRING, // สำหรับลาป่วย/ลากิจ/ลาคลอด
  durationDays: DataTypes.STRING, // สำหรับลาพักผ่อน

  // -------------------------------
  // 📌 ข้อมูลวันลาครั้งล่าสุด
  // -------------------------------
  lastLeaveType: DataTypes.STRING,
  lastStartDate: DataTypes.STRING,
  lastEndDate: DataTypes.STRING,
  lastTotalDays: DataTypes.STRING,

  // -------------------------------
  // 📌 ช่องทางติดต่อ
  // -------------------------------
  contact: DataTypes.STRING,

  // -------------------------------
  // 📌 สถิติการลา
  // -------------------------------
  stat_sick_used: DataTypes.STRING,
  stat_sick_current: DataTypes.STRING,
  stat_sick_total: DataTypes.STRING,

  stat_personal_used: DataTypes.STRING,
  stat_personal_current: DataTypes.STRING,
  stat_personal_total: DataTypes.STRING,

  statsPreviousDays: DataTypes.STRING,
  statsCurrentDays: DataTypes.STRING,
  statsTotalDays: DataTypes.STRING,

  // -------------------------------
  // 📌 ลายเซ็นและผู้ตรวจ
  // -------------------------------
  signature: DataTypes.TEXT('long'),
  managerSignature: DataTypes.TEXT('long'),
  checkerSignature: DataTypes.TEXT('long'),
  checkerName: DataTypes.STRING,
  checkerPosition: DataTypes.STRING,
  checkerDate: DataTypes.STRING,
  checkerVerified: {
    type: DataTypes.BOOLEAN, // หรือ DataTypes.TINYINT(1) ถ้า MySQL บางเวอร์ชัน
    defaultValue: false
  },
  signName: DataTypes.STRING, 
  managerName: DataTypes.STRING, 
  managerPosition: DataTypes.STRING,
  approveDate: DataTypes.STRING,
  managerDecision: DataTypes.STRING,

  foremanVerified: {
    type: DataTypes.BOOLEAN, // หรือ DataTypes.TINYINT(1) ถ้า MySQL บางเวอร์ชัน
    defaultValue: false
  },
  foremanName: DataTypes.STRING,
  foremanPosition: DataTypes.STRING,
  foremanDate: DataTypes.STRING,
  foremanSignature: DataTypes.TEXT('long'),
  // -------------------------------
  // 📌 สถานะและเหตุผลปฏิเสธ
  // -------------------------------
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  rejectReason: DataTypes.STRING

}, {
  sequelize,
  modelName: 'PersonalLeave',
  tableName: 'personal_leaves',
  timestamps: true, // มี createdAt และ updatedAt
});

module.exports = PersonalLeave;
