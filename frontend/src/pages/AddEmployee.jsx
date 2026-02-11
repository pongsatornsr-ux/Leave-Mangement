import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2

// ----------------------------------------------------------------------
// --- API Configuration ---
// ----------------------------------------------------------------------
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ----------------------------------------------------------------------
// --- CSS Styles (Modern & Responsive) ---
// ----------------------------------------------------------------------
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

  :root {
    --primary-color: #2563eb;
    --bg-color: #f3f4f6;
    --text-color: #1f2937;
    --border-color: #d1d5db;
  }

  body {
    margin: 0;
    font-family: 'Sarabun', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  .add-employee-page {
    display: flex;
    justify-content: center;
    padding: 40px 20px;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .form-card {
    background: white;
    width: 100%;
    max-width: 800px;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    background: #1e3a8a;
    padding: 25px 30px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-title h2 { margin: 0; font-size: 22px; }
  .header-title p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; }
  .header-icon { font-size: 40px; }

  .form-content {
    padding: 30px;
  }

  .form-section {
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 10px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Grid System Layout */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* Quota Grid Specific (3 Columns) */
  .quota-grid {
    grid-template-columns: 1fr 1fr 1fr; 
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group.full-width {
    grid-column: span 2;
  }

  /* Quota full width override */
  .quota-grid .form-group.full-width {
    grid-column: span 3;
  }

  label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  input, select {
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-family: 'Sarabun', sans-serif;
    font-size: 14px;
    transition: border-color 0.2s;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  input:focus, select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  .btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: 0.2s;
    white-space: nowrap;
  }

  .btn-cancel {
    background: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
  }
  .btn-cancel:hover { background: #e5e7eb; }

  .btn-save {
    background: var(--primary-color);
    color: white;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
  }
  .btn-save:hover { background: #1d4ed8; transform: translateY(-1px); }
  .btn-save:disabled { background: #93c5fd; cursor: not-allowed; }

  /* Responsive */
  @media (max-width: 768px) {
    .add-employee-page { padding: 20px 15px; }
    .card-header { padding: 20px; }
    .form-content { padding: 20px; }
    .quota-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    .card-header { flex-direction: column; align-items: flex-start; gap: 15px; }
    .header-icon { display: none; }
    .form-grid, .quota-grid { grid-template-columns: 1fr; }
    .form-group.full-width { grid-column: span 1; }
    .quota-grid .form-group.full-width { grid-column: span 1; }
    .btn-group { flex-direction: column-reverse; gap: 10px; }
    .btn { width: 100%; padding: 12px; }
    input, select { font-size: 16px; }
  }
`;

export default function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Initial State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    department: '',
    role: 'user', 
    startDate: new Date().toISOString().split('T')[0], 
    quotaSick: 30,
    quotaPersonal: 10,
    quotaVacation: 10
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ handleSubmit แบบอัปเกรด (ใช้ SweetAlert2)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.name || !formData.email || !formData.password) {
      return Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอก ชื่อ, อีเมล และรหัสผ่าน',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#fbbf24'
      });
    }

    // 2. ถามยืนยันก่อนบันทึก
    const result = await Swal.fire({
      title: 'ยืนยันการเพิ่มพนักงาน?',
      text: "ตรวจสอบข้อมูลให้ถูกต้องก่อนกดยืนยัน",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'ใช่, บันทึกเลย',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await API.post('/auth/register', formData);
        
        // 3. บันทึกสำเร็จ
        await Swal.fire({
          icon: 'success',
          title: 'เพิ่มพนักงานสำเร็จ!',
          text: 'สร้างบัญชีผู้ใช้งานเรียบร้อยแล้ว',
          confirmButtonColor: '#2563eb',
          timer: 2000,
          timerProgressBar: true
        });
        
        navigate('/dasHR'); // กลับไปหน้า Dashboard HR

      } catch (err) {
        console.error(err);
        
        // 4. เกิดข้อผิดพลาด
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
          confirmButtonText: 'ลองใหม่',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="add-employee-page">
      <style>{styles}</style>

      <div className="form-card">
        {/* Header */}
        <div className="card-header">
          <div className="header-title">
            <h2>เพิ่มพนักงานใหม่</h2>
            <p>กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานในระบบ</p>
          </div>
          <div className="header-icon">👤+</div>
        </div>

        {/* Form Content */}
        <form className="form-content" onSubmit={handleSubmit}>
          
          {/* Section 1: ข้อมูลส่วนตัว */}
          <div className="form-section">
            <div className="section-title">📝 ข้อมูลส่วนตัว (Personal Info)</div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>ชื่อ-นามสกุล (Full Name) <span style={{color:'red'}}>*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="เช่น นายสมชาย ใจดี" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>เบอร์โทรศัพท์</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="08x-xxx-xxxx" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลการทำงาน */}
          <div className="form-section">
            <div className="section-title">💼 ข้อมูลการทำงาน (Work Info)</div>
            <div className="form-grid">
              <div className="form-group">
                <label>ตำแหน่ง (Position)</label>
                <input 
                  type="text" 
                  name="position" 
                  value={formData.position} 
                  onChange={handleChange} 
                  placeholder="เช่น Software Engineer" 
                />
              </div>
              <div className="form-group">
                <label>แผนก/สังกัด (Department)</label>
                <input 
                  type="text" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  placeholder="เช่น IT Support" 
                />
              </div>
              <div className="form-group full-width">
                <label>สิทธิ์การใช้งาน (Role) <span style={{color:'red'}}>*</span></label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="user">User - พนักงานทั่วไป</option>
                  <option value="hr">HR - เจ้าหน้าที่บุคคล</option>
                  <option value="admin">Director - ผู้อำนวยการ</option>
                  <option value="foreman">Foreman - หัวหน้าพนักงาน</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: ตั้งค่าบัญชี */}
          <div className="form-section">
            <div className="section-title">🔐 ตั้งค่าบัญชี (Account)</div>
            <div className="form-grid">
              <div className="form-group">
                <label>อีเมล (Email) <span style={{color:'red'}}>*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@company.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>รหัสผ่าน (Password) <span style={{color:'red'}}>*</span></label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Section 4: สิทธิ์วันลา */}
          <div className="form-section" style={{marginBottom: 0}}>
            <div className="section-title">🏖️ สิทธิ์วันลาเริ่มต้น (Leave Quota)</div>
            
            <div className="form-grid quota-grid">
              <div className="form-group">
                <label>ลาป่วย (วัน)</label>
                <input 
                  type="number" 
                  name="quotaSick" 
                  value={formData.quotaSick} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>ลากิจ (วัน)</label>
                <input 
                  type="number" 
                  name="quotaPersonal" 
                  value={formData.quotaPersonal} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <label>ลาพักผ่อน (วัน)</label>
                <input 
                  type="number" 
                  name="quotaVacation" 
                  value={formData.quotaVacation} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="btn-group">
            <button 
              type="button" 
              className="btn btn-cancel"
              onClick={() => navigate(-1)} 
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="btn btn-save" 
              disabled={loading}
            >
              {loading ? '⏳ กำลังบันทึก...' : '✅ บันทึกข้อมูล'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}