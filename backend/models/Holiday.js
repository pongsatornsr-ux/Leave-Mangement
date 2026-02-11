const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Holiday extends Model {}

Holiday.init({
  name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    comment: 'ชื่อวันหยุด เช่น วันปีใหม่, วันสงกรานต์'
  },
  date: { 
    type: DataTypes.DATEONLY, // ใช้ DATEONLY เพื่อเก็บแค่ ปี-เดือน-วัน (ไม่เอาเวลา)
    allowNull: false, 
    unique: true, // ป้องกันการใส่วันที่ซ้ำ
    comment: 'วันที่หยุด (YYYY-MM-DD)'
  }
}, {
  sequelize,
  modelName: 'Holiday',
  tableName: 'holidays',
  timestamps: false // สร้าง created_at, updated_at อัตโนมัติ
});

module.exports = Holiday;