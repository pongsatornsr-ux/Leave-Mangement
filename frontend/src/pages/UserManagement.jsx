import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
// --- CSS Styles (Clean Responsive) ---
// ----------------------------------------------------------------------
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

  :root {
    --primary-color: #2563eb;
    --danger-color: #ef4444;
    --bg-color: #f3f4f6;
    --text-main: #1f2937;
    --border-color: #e5e7eb;
  }

  body { margin: 0; padding: 0; background: var(--bg-color); font-family: 'Sarabun', sans-serif; }

  .swal2-popup { font-family: 'Sarabun', sans-serif !important; }

  .page-container {
    padding: 30px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Header & Buttons */
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
  .page-title h2 { margin: 0; font-size: 24px; color: var(--text-main); }
  .page-title p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }

  .add-btn {
    background: var(--primary-color); color: white; border: none; padding: 10px 20px;
    border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    white-space: nowrap;
  }
  .add-btn:hover { background: #1d4ed8; transform: translateY(-2px); }

  /* Content Card & Toolbar */
  .content-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid var(--border-color); }
  .toolbar { padding: 20px; display: flex; gap: 15px; border-bottom: 1px solid var(--border-color); background: #f9fafb; flex-wrap: wrap; }
  .search-box { flex: 1; max-width: 400px; min-width: 200px; position: relative; }
  .search-input { width: 100%; box-sizing: border-box; padding: 10px 12px 10px 40px; border: 1px solid var(--border-color); border-radius: 8px; outline: none; font-family: inherit; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
  .filter-select { padding: 10px 15px; border: 1px solid var(--border-color); border-radius: 8px; outline: none; font-family: inherit; background: white; color: var(--text-main); cursor: pointer; }

  /* Table Default (Desktop) */
  .table-container { width: 100%; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #f3f4f6; }
  th { text-align: left; padding: 15px 20px; font-size: 14px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 16px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-main); font-size: 14px; vertical-align: middle; }
  tr:hover td { background-color: #f9fafb; }

  /* User Info & Badges */
  .user-cell { display: flex; align-items: center; gap: 12px; }
  
  /* ✅ แก้ไข CSS Avatar ให้รองรับรูปภาพ */
  .user-avatar { 
    width: 40px; height: 40px; border-radius: 50%; 
    background: #e0e7ff; color: var(--primary-color); 
    display: flex; align-items: center; justify-content: center; 
    font-weight: bold; font-size: 16px; flex-shrink: 0; 
    overflow: hidden; /* เพื่อให้รูปไม่ล้นวงกลม */
  }
  
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-detail { display: flex; flex-direction: column; }
  .user-name { font-weight: 600; color: #111827; }
  .user-email { font-size: 12px; color: #6b7280; }
  
  .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; display: inline-block; }
  .role-admin { background: #fee2e2; color: #991b1b; }
  .role-hr { background: #fef3c7; color: #92400e; }
  .role-user { background: #eff6ff; color: #1e40af; }

  /* Action Buttons */
  .action-btn { border: none; background: none; cursor: pointer; padding: 8px; border-radius: 6px; color: #6b7280; transition: 0.2s; font-size: 16px; }
  .btn-edit:hover { background: #eff6ff; color: var(--primary-color); }
  .btn-delete:hover { background: #fee2e2; color: #ef4444; }
  .loading-state { text-align: center; padding: 40px; color: #6b7280; }

  /* Mobile Responsive */
  @media screen and (max-width: 768px) {
    .page-container { padding: 15px; }
    .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
    .add-btn { width: 100%; justify-content: center; }
    .toolbar { flex-direction: column; padding: 15px; }
    .search-box, .filter-select { width: 100%; max-width: 100%; }

    thead { display: none; }
    tbody tr { display: block; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); overflow: hidden; }
    td { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: right; }
    td:last-child { border-bottom: none; }
    td:first-child { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; flex-direction: row; justify-content: flex-start; }
    td:first-child::before { display: none; } 
    td:not(:first-child):not(:last-child)::before { content: attr(data-label); font-weight: 600; color: #9ca3af; text-transform: uppercase; font-size: 12px; margin-right: auto; }
    td:last-child { justify-content: flex-end; background: #fff; padding-top: 8px; padding-bottom: 8px; }
    td:last-child::before { display: none; } 
    .action-btn { font-size: 18px; padding: 8px 12px; background: #f3f4f6; margin-left: 8px; border-radius: 8px; }
  }
`;

// Mock Data (เพิ่มคำนำหน้าเพื่อให้เห็นผลลัพธ์)
const mockData = [
  { id: 1, name: "นายสมชาย ใจดี", email: "somchai@company.com", position: "Software Engineer", department: "IT", role: "user" },
  { id: 2, name: "นางสาววิภาวดี รังสิต", email: "wipawadee@company.com", position: "HR Manager", department: "Human Resources", role: "hr" },
  { id: 3, name: "John Doe", email: "john@company.com", position: "Consultant", department: "External", role: "user" },
];

export default function UserManagement() {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users'); 
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers(mockData);
      setFilteredUsers(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = users;
    if (searchTerm) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบพนักงาน "${name}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#e5e7eb',
      cancelButtonText: '<span style="color:#374151">ยกเลิก</span>',
      confirmButtonText: 'ใช่, ลบเลย',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
          await API.delete(`/users/${id}`);
          setUsers(prev => prev.filter(u => u.id !== id));
          Swal.fire('ลบเรียบร้อย!', 'ข้อมูลพนักงานถูกลบออกจากระบบแล้ว', 'success');
        } catch (err) {
          console.error(err);
          setUsers(prev => prev.filter(u => u.id !== id));
          Swal.fire('ลบเรียบร้อย!', 'ข้อมูลถูกลบแล้ว (Mock)', 'success');
        }
      }
    });
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'role-badge role-admin';
      case 'hr': return 'role-badge role-hr';
      default: return 'role-badge role-user';
    }
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // ✅ ฟังก์ชันเลือกรูปตามเงื่อนไข
  const getUserImage = (userName) => {
      if (!userName) return null;
      if (userName.includes("นาย")) {
          return "https://i.pinimg.com/736x/a5/96/93/a596930f8d899449111bed71a915ca30.jpg";
      } else if (userName.includes("นาง")) { // ครอบคลุมทั้ง "นาง" และ "นางสาว"
          return "https://i.pinimg.com/736x/f6/e8/4c/f6e84c510962c61963cddc539627e746.jpg";
      }
      return "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png"; // ถ้าไม่เข้าเงื่อนไข จะคืนค่า null เพื่อไปใช้ Initials แทน
  };

  return (
    <div className="page-container">
      <style>{styles}</style>

      {/* Header */}
      <header className="page-header">
        <div className="page-title">
          <h2>จัดการผู้ใช้งาน (User Management)</h2>
          <p>รายชื่อพนักงานทั้งหมดในระบบ และการจัดการสิทธิ์</p>
        </div>
        <button className="add-btn" onClick={() => navigate('/hr/add')}>
          <span>+</span> เพิ่มพนักงานใหม่
        </button>
      </header>

      {/* Content Card */}
      <div className="content-card">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="ค้นหาชื่อ, อีเมล หรือตำแหน่ง..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="filter-select" 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">ทั้งหมด (All Roles)</option>
            <option value="admin">Admin</option>
            <option value="HR">HR</option>
            <option value="user">User</option>
            <option value="foreman">Foreman</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading-state">⏳ กำลังโหลดข้อมูล...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ตำแหน่ง / แผนก</th>
                  <th>สิทธิ์การใช้งาน</th>
                  <th style={{textAlign: 'right'}}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    // ✅ เตรียมรูปภาพไว้ก่อน render
                    const userImg = getUserImage(user.name);

                    return (
                      <tr key={user.id}>
                        {/* Name Cell: Mobile = Header */}
                        <td data-label="ชื่อ-นามสกุล">
                          <div className="user-cell">
                            
                            {/* ✅ ส่วนแสดงผลรูปภาพ */}
                            <div className="user-avatar">
                                {userImg ? (
                                    <img src={userImg} alt="Profile" className="avatar-img" />
                                ) : (
                                    getInitials(user.name)
                                )}
                            </div>

                            <div className="user-detail">
                              <span className="user-name">{user.name}</span>
                              <span className="user-email">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        <td data-label="ตำแหน่ง / แผนก">
                          <div style={{fontWeight: '500'}}>{user.position || '-'}</div>
                          <div style={{fontSize: '12px', color: '#6b7280'}}>{user.department || '-'}</div>
                        </td>

                        <td data-label="สิทธิ์การใช้งาน">
                          <span className={getRoleBadge(user.role)}>
                            {user.role}
                          </span>
                        </td>

                        <td data-label="จัดการ" style={{textAlign: 'right'}}>
                          <button 
                            className="action-btn btn-edit" 
                            title="แก้ไข"
                            onClick={() => navigate(`/hr/edit/${user.id}`)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn btn-delete" 
                            title="ลบ"
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#9ca3af'}}>
                      ไม่พบข้อมูลผู้ใช้งาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}