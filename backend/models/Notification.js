const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {}

Notification.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications'
});

module.exports = Notification;
