import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; 

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
// --- Modern CSS Styles (No Shadow / Flat Design) ---
// ----------------------------------------------------------------------
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap');

  :root {
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --secondary: #64748b;
    --danger: #ef4444;
    --success: #10b981;
    --warning: #f59e0b;
    --bg-page: #f1f5f9;
    --bg-card: #ffffff;
    --text-main: #0f172a;
    --text-sub: #475569;
    --border: #e2e8f0;
    --radius: 12px;
  }

  body {
    background-color: var(--bg-page);
    color: var(--text-main);
    font-family: 'Sarabun', sans-serif;
    margin: 0;
  }

  .page-container {
    max-width: 1100px;
    margin: 40px auto;
    padding: 0 20px;
    animation: fadeIn 0.5s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* --- Header --- */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 25px;
  }
  .page-title h1 { font-size: 24px; font-weight: 700; margin: 0; color: var(--text-main); }
  .page-title p { margin: 5px 0 0; color: var(--text-sub); font-size: 14px; }

  /* --- Grid Layout --- */
  .edit-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
    align-items: start;
  }

  /* --- Sidebar (Profile Card) --- */
  .profile-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    padding: 30px;
    text-align: center;
    position: sticky;
    top: 20px;
    /* ✅ ลบเงา และเพิ่มขอบแทน */
    box-shadow: none; 
    border: 1px solid var(--border);
  }

  /* --- Avatar --- */
  .avatar-circle {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, var(--primary) 0%, #818cf8 100%);
    color: white;
    font-size: 36px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin: 0 auto 15px;
    overflow: hidden;
    /* ✅ ลบเงา */
    box-shadow: none;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-name { font-size: 18px; font-weight: 700; margin-bottom: 5px; word-break: break-word; }
  .profile-email { color: var(--text-sub); font-size: 14px; margin-bottom: 20px; word-break: break-all; }
  
  .role-badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .role-admin { background: #fee2e2; color: #991b1b; }
  .role-hr { background: #fef3c7; color: #92400e; }
  .role-user { background: #d1fae5; color: #065f46; }
  .role-foreman { background: #e0f2fe; color: #075985; }

  .profile-stats {
    margin-top: 25px;
    padding-top: 25px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-around;
  }
  .stat-item h4 { margin: 0; font-size: 18px; color: var(--primary); }
  .stat-item span { font-size: 12px; color: var(--text-sub); }

  /* --- Main Form Area --- */
  .form-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    overflow: hidden;
    /* ✅ ลบเงา และเพิ่มขอบแทน */
    box-shadow: none;
    border: 1px solid var(--border);
  }

  .form-section {
    padding: 30px;
    border-bottom: 1px solid var(--border);
  }
  .form-section:last-child { border-bottom: none; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  .section-icon {
    width: 32px;
    height: 32px;
    background: #e0e7ff;
    color: var(--primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .section-title { font-size: 16px; font-weight: 600; color: var(--text-main); }

  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .quota-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .full-width { grid-column: span 2; }

  .form-group { display: flex; flex-direction: column; gap: 8px; }
  
  label { 
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-sub);
    display: flex;
    justify-content: space-between;
  }

  input, select {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Sarabun', sans-serif;
    transition: all 0.2s;
    background: #f8fafc;
    width: 100%;
    box-sizing: border-box; 
  }

  input:focus, select:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    /* ✅ ลบเงาตอนกด focus */
    box-shadow: none;
  }

  /* --- Buttons --- */
  .action-bar {
    padding: 20px 30px;
    background: #f8fafc;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .btn-cancel {
    background: white;
    border: 1px solid var(--border);
    color: var(--text-sub);
  }
  .btn-cancel:hover { background: #f1f5f9; color: var(--text-main); }

  .btn-save {
    background: var(--primary);
    color: white;
    /* ✅ ลบเงาปุ่ม */
    box-shadow: none;
  }
  .btn-save:hover { background: var(--primary-hover); transform: translateY(-1px); }
  .btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

  /* --- Responsive Design --- */
  @media (max-width: 1024px) {
     .edit-layout { grid-template-columns: 280px 1fr; gap: 20px; }
  }

  @media (max-width: 768px) {
    .page-container { margin: 20px auto; padding: 0 15px; }
    .edit-layout { grid-template-columns: 1fr; gap: 20px; }
    .profile-card { position: static; margin-bottom: 20px; }
    .input-grid { grid-template-columns: 1fr; }
    .quota-grid { grid-template-columns: 1fr; } 
    .full-width { grid-column: span 1; }
    .form-section { padding: 20px; }
  }

  @media (max-width: 480px) {
    .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
    .page-header .btn { width: 100%; }
    .action-bar { flex-direction: column-reverse; gap: 10px; }
    .btn { width: 100%; display: flex; justify-content: center; }
    .profile-stats { gap: 5px; }
    .stat-item { flex: 1; }
    h1 { font-size: 20px !important; }
  }
`;

export default function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    department: '',
    role: 'user',
    startDate: '',
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getUserImage = (userName) => {
    if (!userName) return null;
    if (userName.includes("นาย")) {
        return "https://i.pinimg.com/736x/a5/96/93/a596930f8d899449111bed71a915ca30.jpg";
    } else if (userName.includes("นาง")) { 
        return "https://i.pinimg.com/736x/82/59/37/825937c65e1e21ae4aaf25f167706c60.jpg";
    }
    return null;
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        const user = res.data;
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            phone: user.phone || '',
            position: user.position || '',
            department: user.department || '',
            role: user.role || 'user',
            startDate: user.startDate ? user.startDate.split('T')[0] : '',
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลพนักงานในระบบ',
            confirmButtonText: 'กลับหน้ารายการ',
            confirmButtonColor: '#3085d6'
        }).then(() => {
            navigate('/hr/manage');
        });
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ถามยืนยันก่อนบันทึก
    const result = await Swal.fire({
      title: 'ยืนยันการบันทึก?',
      text: "ตรวจสอบข้อมูลให้ถูกต้องก่อนกดยืนยัน",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, บันทึกเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        
        await API.put(`/users/${id}`, payload);
        
        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ!',
          text: 'ข้อมูลพนักงานถูกแก้ไขเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#10b981'
        });
        
        navigate('/hr/manage');

      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.message || err.message || "ไม่สามารถบันทึกข้อมูลได้",
          confirmButtonText: 'ลองใหม่',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (fetching) return (
    <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'#64748b'}}>
      กำลังโหลดข้อมูล...
    </div>
  );

  const profileImage = getUserImage(formData.name);

  return (
    <div className="page-container">
      <style>{styles}</style>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>แก้ไขข้อมูลพนักงาน</h1>
          <p>Management / Employee / Edit Profile</p>
        </div>
        <button type="button" className="btn btn-cancel" onClick={() => navigate(-1)}>
          ⬅ ย้อนกลับ
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-layout">
        
        {/* Left Column: Profile Summary */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            
            <div className="avatar-circle">
              {profileImage ? (
                  <img src={profileImage} alt="Profile" className="avatar-img" />
              ) : (
                  getInitials(formData.name)
              )}
            </div>

            <h3 className="profile-name">{formData.name || 'No Name'}</h3>
            <p className="profile-email">{formData.email || 'No Email'}</p>
            
            <span className={`role-badge role-${formData.role}`}>
              {formData.role.toUpperCase()}
            </span>
          </div>
        </aside>

        {/* Right Column: Edit Form */}
        <main className="form-card">
          
          {/* Section 1: ข้อมูลส่วนตัว */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">👤</div>
              <div className="section-title">ข้อมูลส่วนตัว (Personal Details)</div>
            </div>
            <div className="input-grid">
              <div className="form-group full-width">
                <label>ชื่อ-นามสกุล <span style={{color:'red'}}>*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="เช่น นายสมชาย ใจดี" />
              </div>
              <div className="form-group">
                <label>เบอร์โทรศัพท์</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="08x-xxx-xxxx" />
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลองค์กร */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">💼</div>
              <div className="section-title">ข้อมูลองค์กร (Organization)</div>
            </div>
            <div className="input-grid">
              <div className="form-group">
                <label>แผนก (Department)</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="เช่น IT, HR, Sales" />
              </div>
              <div className="form-group">
                <label>ตำแหน่ง (Position)</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="เช่น Software Engineer" />
              </div>
              <div className="form-group full-width">
                <label>สิทธิ์การใช้งาน (Role)</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="user">User - พนักงานทั่วไป</option>
                  <option value="hr">HR - เจ้าหน้าที่บุคคล</option>
                  <option value="admin">Director - ผู้อำนวยการ</option>
                  <option value="foreman">Foreman - หัวหน้าพนักงาน</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: ความปลอดภัย */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">🔐</div>
              <div className="section-title">บัญชีและความปลอดภัย (Account Security)</div>
            </div>
            <div className="input-grid">
              <div className="form-group">
                <label>อีเมล <span style={{color:'red'}}>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>
                  เปลี่ยนรหัสผ่านใหม่
                  {formData.password && <span style={{color:'var(--warning)', fontSize:'10px'}}>กำลังแก้ไข</span>}
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน" 
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
          {/* Action Footer */}
          <div className="action-bar">
             <button type="button" className="btn btn-cancel" onClick={() => navigate('/hr/manage')}>
               ยกเลิก
             </button>
             <button type="submit" className="btn btn-save" disabled={loading}>
               {loading ? '⏳ กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
             </button>
          </div>

        </main>
      </form>
    </div>
  );
}