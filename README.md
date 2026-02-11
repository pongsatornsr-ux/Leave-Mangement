# ระบบลาออนไลน์ (พร้อมรัน with Docker Compose)

## รันด้วย Docker Compose

1. ตรวจสอบว่าคุณมี Docker และ Docker Compose ติดตั้งแล้ว
2. จากโฟลเดอร์โปรเจค (ไฟล์ docker-compose.yml อยู่ root) รัน:

```bash
docker compose up -d --build
```

3. คอนเทนเนอร์จะสร้างและรัน:
 - MySQL: port 3306 (user: root / password: rootpass)
 - Backend: http://localhost:5000 (API at /api)
 - Frontend: http://localhost:5173

## หมายเหตุ
- Backend จะรันคำสั่ง migrations ก่อนเริ่ม server (sequelze.sync({ alter: true }))
- ถ้าต้องการสร้าง admin user ให้เรียก API POST /api/auth/register ด้วย body: { name, email, password, role: 'admin' }
