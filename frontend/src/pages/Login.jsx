import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'Sarabun', sans-serif; overflow: hidden; }

  /* --- Container หลัก --- */
  .login-container {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 9999;
    display: flex;
    background-color: #f3f4f6;
    overflow: hidden;
  }

  /* --- Banner (ฝั่งซ้าย/ด้านบน) --- */
  .login-banner {
    flex: 1; /* Desktop: กินพื้นที่ 50% */
    height: 100%;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    padding: 40px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .login-banner::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.1;
  }

  .banner-content { z-index: 1; text-align: center; }
  .banner-title { font-size: 48px; font-weight: 800; margin: 0 0 10px; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .banner-subtitle { font-size: 18px; opacity: 0.9; font-weight: 300; }

  /* --- Wrapper ฟอร์ม (ฝั่งขวา/ด้านล่าง) --- */
  .login-form-wrapper {
    flex: 1; /* Desktop: กินพื้นที่ 50% */
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: #f3f4f6;
    overflow-y: auto; 
  }

  /* --- กล่อง Card (พระเอกของเรา) --- */
  .form-card {
    width: 100%;
    max-width: 420px;
    padding: 40px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.5);
    animation: slideIn 0.5s ease-out;
    transition: all 0.3s ease; /* เพิ่ม Transition ให้ขยาย/หดสมูท */
  }

  .form-header { margin-bottom: 30px; text-align: center; }
  .form-header h2 { font-size: 26px; font-weight: 700; color: #111827; margin: 0 0 8px; }
  .form-header p { color: #6b7280; margin: 0; font-size: 14px; }

  .input-group { margin-bottom: 20px; }
  .input-label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
  
  .input-field-container { position: relative; display: flex; align-items: center; }
  .input-icon { position: absolute; left: 14px; color: #9ca3af; font-size: 18px; z-index: 10; }

  .input-field {
    width: 100%;
    padding: 12px 12px 12px 42px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 15px;
    font-family: 'Sarabun', sans-serif;
    transition: all 0.2s;
    outline: none;
  }

  .input-field:focus {
    background: white;
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }

  .btn-submit {
    width: 100%;
    padding: 14px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  }
  
  .btn-submit:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3); }
  .btn-submit:disabled { background: #93c5fd; cursor: not-allowed; transform: none; box-shadow: none;}

  .error-box {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    color: #991b1b;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
    display: flex; align-items: center; gap: 8px;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ========================================= */
  /* ✅ RESPONSIVE (มือถือ/แท็บเล็ต)           */
  /* ========================================= */
  @media (max-width: 900px) {
    .login-container { 
      flex-direction: column; /* เรียงแนวตั้ง */
    }

    /* ปรับ Banner ให้เป็น Header ด้านบน */
    .login-banner { 
      flex: none; /* ไม่ขยาย */
      width: 100%; 
      height: 200px; /* ความสูง Banner บนมือถือ */
      padding: 20px;
    }
    .banner-title { font-size: 32px; }
    .banner-subtitle { display: none; } /* ซ่อนคำบรรยายยาวๆ */

    /* พื้นที่ฟอร์ม */
    .login-form-wrapper { 
      width: 100%; 
      flex: 1; 
      align-items: flex-start; /* ดันกล่องขึ้นไปด้านบนหน่อย */
      padding-top: 30px; 
    }

    /* ✅ ปรับกล่อง Card ให้เข้ากับมือถือ */
    .form-card { 
      width: 90%; /* ให้กว้างเกือบเต็มจอ (เหลือขอบนิดหน่อย) */
      max-width: 400px;
      padding: 25px; /* ลด Padding ภายใน */
      margin: 0 auto; /* จัดกึ่งกลาง */
      
      /* ยังคงมีเงาเพื่อให้ดูเป็นกล่องลอยอยู่ */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .form-header h2 { font-size: 24px; }
  }
`;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const role = res.data.user.role;
      if (role === 'admin') nav('/admin/dasadmin');
      else if (role === 'HR') nav('/dasHR');
      else if(role === 'foreman') nav('/dasF');
      else nav('/');

    } catch (err) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{styles}</style>

      {/* Banner */}
      <div className="login-banner">
        <div className="banner-content">
          <h1 className="banner-title">LeaveSystem</h1>
          <p className="banner-subtitle">ระบบจัดการการลาออนไลน์และข้อมูลพนักงาน<br/>เพื่อองค์กรที่ทันสมัย</p>
        </div>
      </div>

      {/* Form */}
      <div className="login-form-wrapper">
        <div className="form-card">
          
          <div className="form-header">
            <h2>เข้าสู่ระบบ</h2>
            <p>ลงชื่อเข้าใช้งานบัญชีของคุณ</p>
          </div>

          {error && (
            <div className="error-box">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="input-group">
              <label className="input-label">อีเมล</label>
              <div className="input-field-container">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">รหัสผ่าน</label>
              <div className="input-field-container">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <>กำลังตรวจสอบ...</> : <>เข้าสู่ระบบ</>}
            </button>
            
          </form>

          <div style={{marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#9ca3af'}}>
            &copy; 2026 Leaves Management System.
          </div>

        </div>
      </div>
    </div>
  );
}