const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class VacationLeave extends Model {}

VacationLeave.init({

  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },

  // -------------------------------
  // 📌 ประเภทใบลา
  // -------------------------------
  type: {
    type: DataTypes.STRING,
    defaultValue: "vacation"
  },

  // -------------------------------
  // 📌 ส่วนหัวฟอร์ม
  // -------------------------------
  writtenAt: DataTypes.STRING,
  date: DataTypes.STRING,
  subject: DataTypes.STRING,
  to: DataTypes.STRING,

  // -------------------------------
  // 📌 ข้อมูลผู้ลา
  // -------------------------------
  name: DataTypes.STRING,
  position: DataTypes.STRING,
  department: DataTypes.STRING,

  // -------------------------------
  // 📌 วันลาพักผ่อน
  // -------------------------------
  vacationAccumulated: DataTypes.STRING,
  vacationThisYear: DataTypes.STRING,
  vacationTotal: DataTypes.STRING,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  durationDays: DataTypes.STRING,

  // -------------------------------
  // 📌 ช่องทางติดต่อ
  // -------------------------------
  contact: DataTypes.STRING,

  // -------------------------------
  // 📌 สถิติการลา
  // -------------------------------
  statsPreviousDays: DataTypes.STRING,
  statsCurrentDays: DataTypes.STRING,
  statsTotalDays: DataTypes.STRING,

  // -------------------------------
  // 📌 ส่วนผู้ตรวจสอบ (Checker) - ✅ เพิ่มส่วนนี้ที่ขาดไป
  // -------------------------------
  checkerVerified: {
    type: DataTypes.BOOLEAN, // หรือ DataTypes.TINYINT(1) ถ้า MySQL บางเวอร์ชัน
    defaultValue: false
  },
  checkerName: DataTypes.STRING,
  checkerPosition: DataTypes.STRING,
  checkerDate: DataTypes.STRING,
  checkerSignature: DataTypes.TEXT('long'),
  foremanVerified: {
    type: DataTypes.BOOLEAN, // หรือ DataTypes.TINYINT(1) ถ้า MySQL บางเวอร์ชัน
    defaultValue: false
  },
  foremanName: DataTypes.STRING,
  foremanPosition: DataTypes.STRING,
  foremanDate: DataTypes.STRING,
  foremanSignature: DataTypes.TEXT('long'),

  // -------------------------------
  // 📌 ส่วนผู้บังคับบัญชา (Manager)
  // -------------------------------
  managerSignature: DataTypes.TEXT('long'),
  managerName: DataTypes.STRING, 
  managerPosition: DataTypes.STRING,
  managerDecision: DataTypes.STRING, // ✅ เพิ่มส่วนนี้ (อนุญาต/ไม่อนุญาต)
  
  approveDate: DataTypes.STRING,
  
  // -------------------------------
  // 📌 ส่วนพนักงาน (Signature)
  // -------------------------------
  signature: DataTypes.TEXT('long'),
  signName: DataTypes.STRING,
  
  // -------------------------------
  // 📌 สถานะอนุมัติ
  // -------------------------------
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  rejectReason: DataTypes.STRING,

  // Field เก่าที่อาจจะไม่ได้ใช้แล้ว (managerSign) เก็บไว้ก็ได้ถ้า Database มีอยู่
  managerSign: DataTypes.STRING,

}, {
  sequelize,
  modelName: 'VacationLeave',
  tableName: 'vacation_leaves',
  timestamps: true
});

module.exports = VacationLeave;