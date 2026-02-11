const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('user', 'admin', 'HR', 'manager'), 
    allowNull: false, 
    defaultValue: 'user' 
  },

  position: {
    type: DataTypes.STRING,
    allowNull: true
  },

  department: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // ✅ เพิ่ม phone
  phone: {
    type: DataTypes.STRING,
    allowNull: true    // ถ้าอยากให้บังคับกรอก เปลี่ยนเป็น false
  }

}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true
});

module.exports = User;
