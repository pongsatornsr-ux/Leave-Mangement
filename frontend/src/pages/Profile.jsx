import React, { useState, useEffect } from 'react';
import API from '../api/api'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// ==========================================
// CSS Styles (Full Screen & No Scroll)
// ==========================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');

  /* ✅ Reset พื้นฐาน: ล้างขอบและล็อกไม่ให้เลื่อน */
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden; /* 🔒 ล็อกสกรอลบาร์ทั้งแนวตั้งและแนวนอน */
    background-color: #e5e7eb;
  }

  #root {
    width: 100%;
    height: 100%;
  }

  * { box-sizing: border-box; }

  /* --- Main Container --- */
  .profile-page-container {
    width: 100%;
    height: 100vh; /* เต็มจอพอดี */
    background-color: #e5e7eb;
    font-family: 'Sarabun', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* ✅ ดึงทุกอย่างมาตรงกลางแนวตั้ง */
    padding: 20px;
    position: relative;
  }

  /* --- Content Wrapper (กลุ่มก้อนเนื้อหา) --- */
  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 600px;
    /* Animation โผล่ขึ้นมา */
    animation: slideUpFade 0.6s ease-out;
  }

  /* --- ID CARD --- */
  .id-card-wrapper {
    width: 100%;
    perspective: 1000px;
    margin-bottom: 25px; /* ระยะห่างจากแผงตั้งค่า */
    transition: transform 0.3s ease;
  }

  .real-id-card {
    background: #ffffff;
    aspect-ratio: 1.58/1; /* อัตราส่วนบัตรมาตรฐาน */
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-image: 
        radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 60%),
        repeating-linear-gradient(45deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 2px, transparent 2px, transparent 10px);
  }

  /* Header Stripe */
  .card-header-stripe {
    height: 18%;
    background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1e40af 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    color: white;
  }
  .company-logo { font-weight: 800; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; }
  .card-label { font-size: 10px; opacity: 0.9; border: 1px solid rgba(255,255,255,0.4); padding: 2px 8px; border-radius: 4px; }

  /* Body Content */
  .card-body-flex {
    flex: 1;
    display: flex;
    padding: 15px 20px;
    gap: 20px;
    align-items: center;
  }

  /* Photo */
  .photo-section {
    width: 30%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .user-photo-frame {
    width: 100%;
    aspect-ratio: 3/4;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
  }
  .user-photo-img { width: 100%; height: 100%; object-fit: cover; }
  .fake-avatar {
    width: 100%; height: 100%; background: #e0e7ff; color: #1e40af;
    font-size: 36px; font-weight: bold; display: flex; align-items: center; justify-content: center;
    position: absolute; top:0; left:0; z-index: -1; 
  }
  .id-number-small { font-size: 10px; color: #6b7280; font-weight: 600; letter-spacing: 0.5px; }

  /* Details */
  .details-section { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .smart-chip {
    width: 40px; height: 30px;
    background: linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #b45309 100%);
    border-radius: 5px; margin-bottom: 10px; position: relative;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  .smart-chip::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.3); }
  .smart-chip::after { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: rgba(0,0,0,0.3); }

  .field-group { margin-bottom: 8px; }
  .field-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; font-weight: 700; margin-bottom: 1px; }
  .field-value-main { font-size: 18px; font-weight: 800; color: #111827; line-height: 1.2; }
  .field-value-sub { font-size: 14px; color: #4b5563; font-weight: 500; }
  .field-row { display: flex; gap: 20px; }

  /* Footer */
  .card-footer {
    height: 15%;
    background: white;
    border-top: 1px dashed #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }
  .barcode { font-family: 'Libre Barcode 39 Text', cursive; font-size: 40px; color: #374151; opacity: 0.8; }
  .issue-date { font-size: 9px; color: #9ca3af; font-weight: 600; }

  /* --- DASHBOARD PANEL --- */
  .dashboard-panel { width: 100%; background: transparent; }
  
  .info-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;
  }
  .info-box {
    background: white; padding: 12px 15px; border-radius: 10px;
    border: 1px solid #e5e7eb; box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  }
  
  .action-btn {
    width: 100%; background: #ffffff; border: 1px solid #d1d5db;
    padding: 14px; border-radius: 10px; color: #374151; font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all 0.2s;
    display: flex; justify-content: center; align-items: center; gap: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  }
  .action-btn:hover { background: #f9fafb; border-color: #9ca3af; transform: translateY(-1px); }

  /* --- MODAL --- */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 2000;
    display: flex; justify-content: center; align-items: center;
    backdrop-filter: blur(5px);
  }
  .modal-box {
    background: white; width: 90%; max-width: 380px; padding: 30px;
    border-radius: 20px; box-shadow: 0 25px 60px rgba(0,0,0,0.3);
    animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .form-group input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; margin-bottom: 15px; outline: none; transition: 0.2s; }
  .form-group input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  .modal-actions { display: flex; gap: 10px; margin-top: 10px; }
  .btn-modal { flex: 1; padding: 12px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
  .btn-cancel { background: #f3f4f6; color: #4b5563; }
  .btn-save { background: #2563eb; color: white; }

  /* --- Animations & Responsiveness --- */
  @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  /* 🔥 Auto Scale: ถ้าจอเตี้ย (เช่น Laptop เล็ก) ให้ย่อเนื้อหาลงเพื่อไม่ให้มี Scroll */
  @media (max-height: 800px) {
    .content-wrapper { transform: scale(0.9); }
  }
  @media (max-height: 700px) {
    .content-wrapper { transform: scale(0.8); }
  }
  
  /* Mobile Style */
  @media (max-width: 600px) {
    .content-wrapper { width: 100%; transform: none; }
    .real-id-card { aspect-ratio: auto; height: auto; padding-bottom: 10px; }
    .card-body-flex { flex-direction: column; text-align: center; }
    .photo-section { width: 100px; }
    .details-section { width: 100%; align-items: center; }
    .field-row { flex-direction: column; gap: 5px; }
    .smart-chip { margin: 10px auto; }
    /* ถ้าจอมือถือเตี้ยมาก ให้ยอมมี scroll นิดหน่อยดีกว่าย่อจนมองไม่เห็น */
    .profile-page-container { height: auto; min-height: 100vh; padding: 40px 20px; display: block; overflow-y: auto; }
  }
`;

export default function Profile() {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('user') || 'null');
  
  const [userData, setUserData] = useState(localUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  const userName = userData?.name || ""; 
  
  let profileImageToDisplay;
  if (userName.includes("นาย")) {
      profileImageToDisplay = "https://i.pinimg.com/736x/a5/96/93/a596930f8d899449111bed71a915ca30.jpg";
  } else if (userName.includes("นาง") || userName.includes("นางสาว")) {
      profileImageToDisplay = "https://i.pinimg.com/736x/f6/e8/4c/f6e84c510962c61963cddc539627e746.jpg";
  } else {
      profileImageToDisplay = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png";
  } 

  const getInitials = (name) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    const fetchLatestUserData = async () => {
      try {
        const res = await API.get(`/users/${localUser.id}`); 
        setUserData(res.data);
      } catch (err) { console.error(err); }
    };
    if (localUser?.id) fetchLatestUserData();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
        return Swal.fire({ icon: 'warning', title: 'รหัสผ่านสั้นเกินไป', text: 'ต้องมีอย่างน้อย 6 ตัวอักษร', confirmButtonText: 'ตกลง', confirmButtonColor: '#fbbf24' });
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        return Swal.fire({ icon: 'warning', title: 'รหัสผ่านไม่ตรงกัน', confirmButtonText: 'ตกลง', confirmButtonColor: '#fbbf24' });
    }

    const confirmResult = await Swal.fire({
        title: 'ยืนยันการเปลี่ยนรหัสผ่าน?', text: "ต้องการเปลี่ยนรหัสผ่านใหม่ใช่หรือไม่", icon: 'question',
        showCancelButton: true, confirmButtonColor: '#2563eb', cancelButtonColor: '#d1d5db',
        confirmButtonText: 'เปลี่ยนเลย', cancelButtonText: 'ยกเลิก'
    });

    if (confirmResult.isConfirmed) {
        setUpdateLoading(true);
        try {
            await API.put(`/users/${localUser.id}`, { password: passwordForm.newPassword });
            await Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: 'เปลี่ยนรหัสผ่านเรียบร้อย', confirmButtonText: 'ตกลง', confirmButtonColor: '#2563eb', timer: 2000 });
            setIsModalOpen(false);
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเปลี่ยนรหัสผ่านได้', confirmButtonColor: '#ef4444' });
        } finally {
            setUpdateLoading(false);
        }
    }
  };

  if (!userData) return <div>กรุณาเข้าสู่ระบบ</div>;

  return (
    <div className="profile-page-container">
      <style>{styles}</style>

      {/* --- Wrap เนื้อหาทั้งหมดเพื่อจัดกลางและย่อขยาย --- */}
      <div className="content-wrapper">
        
        {/* --- ID Card --- */}
        <div className="id-card-wrapper">
            <div className="real-id-card">
                <div className="card-header-stripe">
                    <div className="company-logo"> ID CARD</div>
                    <div className="card-label">OFFICIAL</div>
                </div>

                <div className="card-body-flex">
                    <div className="photo-section">
                        <div className="user-photo-frame">
                            <img src={profileImageToDisplay} alt="Profile" className="user-photo-img" onError={(e) => { e.target.style.display='none'; }} />
                            <div className="fake-avatar">{getInitials(userData.name)}</div>
                        </div>
                        <div className="id-number-small">ID: {userData.employeeId || String(userData.id).padStart(6, '0')}</div>
                    </div>

                    <div className="details-section">
                        <div className="smart-chip"></div>
                        <div className="field-group">
                            <div className="field-label">Name / ชื่อ-สกุล</div>
                            <div className="field-value-main">{userData.name}</div>
                        </div>
                        <div className="field-row">
                            <div className="field-group">
                                <div className="field-label">Position / ตำแหน่ง</div>
                                <div className="field-value-sub">{userData.position || 'Employee'}</div>
                            </div>
                            <div className="field-group">
                                <div className="field-label">Dept / แผนก</div>
                                <div className="field-value-sub">{userData.department || 'General'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="issue-date">Issued: {new Date().toLocaleDateString('en-GB')}</div>
                    <div className="barcode">{userData.employeeId || String(userData.id).padStart(6, '0')}</div>
                </div>
            </div>
        </div>

        {/* --- Dashboard Panel --- */}
        <div className="dashboard-panel">
            <div className="info-grid">
                <div className="info-box">
                    <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'4px'}}>EMAIL</div>
                    <div style={{fontWeight:'600', color:'#374151', fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{userData.email}</div>
                </div>
                <div className="info-box">
                    <div style={{fontSize:'11px', color:'#9ca3af', marginBottom:'4px'}}>PHONE</div>
                    <div style={{fontWeight:'600', color:'#374151', fontSize:'14px'}}>{userData.phone || '-'}</div>
                </div>
            </div>
            
            <button className="action-btn" onClick={() => setIsModalOpen(true)}>
                🔐 เปลี่ยนรหัสผ่าน (Change Password)
            </button>
        </div>

      </div>

      {/* --- Modal (อยู่ข้างนอก content-wrapper เพื่อไม่ให้โดน scale) --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h3 style={{marginTop:0, textAlign:'center', color:'#1f2937'}}>🔐 เปลี่ยนรหัสผ่านใหม่</h3>
                <form onSubmit={submitPasswordChange}>
                    <div className="form-group">
                        <input type="password" name="newPassword" placeholder="รหัสผ่านใหม่" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
                    </div>
                    <div className="form-group">
                        <input type="password" name="confirmPassword" placeholder="ยืนยันรหัสผ่าน" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-modal btn-cancel" onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
                        <button type="submit" className="btn-modal btn-save" disabled={updateLoading}>{updateLoading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}