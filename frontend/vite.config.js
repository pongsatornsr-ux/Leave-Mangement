import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- เพิ่มส่วนนี้เข้าไปครับ ---
  resolve: {
    dedupe: ['react', 'react-dom'], // บังคับให้ใช้ React ตัวเดียวกัน
  },
  optimizeDeps: {
    include: ['react-select'], // บังคับให้ Vite จัดการ react-select
  },
  // -------------------------
})