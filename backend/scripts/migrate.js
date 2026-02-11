const { sequelize } = require('../models');

(async () => {
  try {
    console.log('Running migrations (sequelize.sync({ alter: true }))...');
    await sequelize.sync({ alter: true });
    console.log('Migrations applied.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
