require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const http = require('http'); // สำหรับการสร้าง Server ที่รองรับ Socket.IO
const { sequelize, User, Notification } = require('./models'); // นำเข้า Models และ Sequelize

// --------------------------------------------------
// CORE APPLICATION SETUP
// --------------------------------------------------
const app = express();
const server = http.createServer(app);
const onlineUsers = {}; // สำหรับเก็บ ID ผู้ใช้ที่ออนไลน์และ Socket ID

// --------------------------------------------------
// SOCKET.IO CONFIGURATION
// --------------------------------------------------
const io = require('socket.io')(server, {
  cors: { origin: "*" }
});

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------
app.use(cors());
app.use(express.json({ limit: "50mb" }));


// -------------------------------------------------- 
// ROUTES
// --------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/personalleaves', require('./routes/PersonalLeave'));
app.use('/api/vacationleaves', require('./routes/VacationLeave'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/export-word', require('./routes/export-word'));
app.use('/api/users', require('./routes/Users'));
app.use('/api/holidays', require('./routes/holidays')); 



// --------------------------------------------------
// SOCKET.IO REALTIME HANDLERS (แก้ไขใหม่)
// --------------------------------------------------
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // ✅ แก้ไข: รับ event 'join' ให้ตรงกับ Frontend
  socket.on('join', (data) => {
    // Frontend ส่งมาเป็น { userId: 1 } หรือบางทีส่งมาแค่ 1 ต้องเช็คให้ชัวร์
    const userId = data.userId || data; 

    if (userId) {
        // 1. นำ User เข้าห้องส่วนตัว (Room) โดยใช้ userId เป็นชื่อห้อง
        // วิธีนี้สำคัญมากสำหรับการแจ้งเตือนแบบเจาะจงคน
        const roomName = String(userId);
        socket.join(roomName);

        // 2. เก็บไว้ในตัวแปร onlineUsers ด้วย (เผื่อใช้เช็คว่าใครออนไลน์บ้าง)
        onlineUsers[userId] = socket.id;
        
        console.log(`📌 User ID: ${userId} joined room: ${roomName} (Socket: ${socket.id})`);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    // ลบผู้ใช้ออกจากรายการเมื่อตัดการเชื่อมต่อ
    for (let id in onlineUsers) {
      if (onlineUsers[id] === socket.id) {
        delete onlineUsers[id];
        break; 
      }
    }
  });
});

// ตั้งค่า Socket.IO และ Online Users ให้ Express App สามารถเข้าถึงได้ใน Router
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// --------------------------------------------------
// START SERVER AND DATABASE SYNC
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // 1. ตรวจสอบการเชื่อมต่อฐานข้อมูล
    await sequelize.authenticate();
    console.log('🔗 Database connected!');
    
    // 2. ซิงค์ Model กับฐานข้อมูล
    // หมายเหตุ: การใช้ sync() แบบนี้จะสร้างตารางใหม่ (Holidays) ให้อัตโนมัติถ้ายังไม่มี
    await sequelize.sync(); 
    console.log('✅ Database Synced (safe mode)');

    // 3. สร้าง admin ถ้ายังไม่มี
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "123456";

    const exists = await User.findOne({ where: { email: adminEmail } });
    if (!exists) {
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: "admin"
      });
      console.log(`✅ Created default admin → ${adminEmail}`);
    }

    // 4. เริ่มต้น HTTP Server
    server.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();