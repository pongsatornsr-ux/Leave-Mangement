const sequelize = require('../config/database');
const User = require('./user');
const PersonalLeave = require('./PersonalLeave');
const VacationLeave = require('./VacationLeave');
const Notification = require('./Notification');
const Holiday = require('./Holiday');
// --------------------
// ความสัมพันธ์หลัก
// --------------------

// PersonalLeave
User.hasMany(PersonalLeave, { foreignKey: 'userId', as: 'personalLeaves', onDelete: 'CASCADE' });
PersonalLeave.belongsTo(User, { foreignKey: 'userId', as: 'personalUser' });

// VacationLeave
User.hasMany(VacationLeave, { foreignKey: 'userId', as: 'vacationLeaves', onDelete: 'CASCADE' });
VacationLeave.belongsTo(User, { foreignKey: 'userId', as: 'vacationUser' });

// Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'notificationUser' });

// Export
module.exports = { sequelize, User, PersonalLeave, VacationLeave, Notification,Holiday };
