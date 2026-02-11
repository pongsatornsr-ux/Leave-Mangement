const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');

    const name = 'HR';
    const email = 'hr@example.com';
    const password = '123456';
    const role = 'HR';

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed, role });
    console.log('✅ User created:', user.toJSON());

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
