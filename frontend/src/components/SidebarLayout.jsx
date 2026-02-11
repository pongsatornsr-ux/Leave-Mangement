import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import API from '../api/api'; 
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';

// --- Config Socket ---
const socket = io('http://localhost:5000', {
    autoConnect: false // ✅ ป้องกันการต่อเองมั่วซั่ว ให้เราคุมเองใน useEffect
}); 

// ==========================================
// CSS Styles
// ==========================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

  :root {
    --primary-color: #2563eb;
    --sidebar-width: 260px;
    --bg-color: #f3f4f6;
    --text-main: #1f2937;
    --text-muted: #6b7280;
  }

  body {
    margin: 0;
    font-family: 'Sarabun', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-main);
    overflow-x: hidden;
  }

  .layout-wrapper {
    display: flex;
    min-height: 100vh;
  }

  /* --- Sidebar --- */
  .sidebar {
    width: var(--sidebar-width);
    background: #ffffff;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    transition: transform 0.3s ease-in-out;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .sidebar::-webkit-scrollbar { width: 5px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

  .sidebar-header {
    margin-bottom: 30px;
    padding-left: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(90deg, #2563eb, #06b6d4);
    -webkit-background-clip: text;
    color: transparent;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .close-sidebar-btn {
      display: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-muted);
      background: none;
      border: none;
  }

  .sidebar-menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
  }

  .menu-item:hover {
    background-color: #eff6ff;
    color: var(--primary-color);
  }

  .menu-item.active {
    background-color: #eff6ff;
    color: var(--primary-color);
    font-weight: 700;
  }

  /* --- Notification --- */
  .badge {
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: auto; 
  }

  .notif-popup {
    position: fixed; 
    left: var(--sidebar-width); 
    top: 60px; 
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    z-index: 1100;
    margin-left: 10px;
  }

  .notif-header { padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #f3f4f6; background: #fafafa; }
  .notif-list { max-height: 350px; overflow-y: auto; }
  .notif-item { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; cursor: pointer; }
  .notif-item:hover { background: #f9fafb; }
  .notif-item.unread { background: #f0f9ff; font-weight: 600; border-left: 3px solid var(--primary-color); }

  /* --- User Profile --- */
  .user-section {
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #f3f4f6;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .user-profile:hover { background: #f9fafb; }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
    text-transform: uppercase;
    overflow: hidden; 
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-info { display: flex; flex-direction: column; overflow: hidden; }
  .user-name { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 12px; color: var(--text-muted); text-transform: capitalize; }

  .logout-btn {
    margin-top: 10px;
    width: 100%;
    padding: 10px;
    border: 1px solid #fee2e2;
    background: #fef2f2;
    color: #ef4444;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  .logout-btn:hover { background: #fee2e2; }

  /* --- Main Content --- */
  .main-wrapper {
    flex: 1;
    margin-left: var(--sidebar-width);
    padding: 0; 
    transition: margin-left 0.3s;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: calc(100% - var(--sidebar-width));
  }

  .main-content {
      padding: 20px;
      flex: 1;
  }

  /* --- Mobile Responsive --- */
  .mobile-header {
      display: none; 
      height: 60px;
      background: white;
      border-bottom: 1px solid #eee;
      align-items: center;
      padding: 0 20px;
      position: sticky;
      top: 0;
      z-index: 900;
  }

  .hamburger-btn {
      font-size: 24px;
      cursor: pointer;
      background: none;
      border: none;
      color: var(--text-main);
  }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); width: 260px; }
    .sidebar.open { transform: translateX(0); box-shadow: 4px 0 15px rgba(0,0,0,0.1); }
    .main-wrapper { margin-left: 0; width: 100%; }
    
    .mobile-header { display: flex; justify-content: space-between; }
    .notif-popup { left: 10px; width: calc(100% - 20px); top: 70px; margin-left: 0; }
    .close-sidebar-btn { display: block; }

    .backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4); 
      z-index: 999; 
      display: none;
    }
    .backdrop.active { display: block; }
  }
`;

export default function SidebarLayout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = user?.role?.toLowerCase() || '';
  
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const popupRef = useRef(null); 

  // ==========================================
  // ✅ LOGIC เลือกรูปโปรไฟล์
  // ==========================================
  const getUserImage = () => {
    if (!user) return null;
    const userName = user.name || "";

    if (userName.includes("นาย")) {
        return "https://i.pinimg.com/736x/a5/96/93/a596930f8d899449111bed71a915ca30.jpg";
    } else if (userName.includes("นาง")) {
        return "https://i.pinimg.com/736x/f6/e8/4c/f6e84c510962c61963cddc539627e746.jpg";
    } else {
        return "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png" || null;
    }
  };

  const profileImage = getUserImage();

  const getInitials = (name) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getHomePath = () => {
    switch (role) {
        case 'admin': return '/admin/dasadmin'; 
        case 'hr': return '/dasHR';
        case 'foreman' : return  '/dasF' 
        default: return '/';
    }
  };

  const logout = () => {
    Swal.fire({
      title: 'ยืนยันการออกจากระบบ',
      text: "คุณต้องการออกจากระบบใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      customClass: { popup: 'sarabun-font' }
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ ตัดการเชื่อมต่อ Socket
        socket.disconnect();

        localStorage.clear();
        navigate('/login');
        
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        });
        Toast.fire({
          icon: 'success',
          title: 'ออกจากระบบสำเร็จ'
        });
      }
    });
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications/unread');
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleNotifClick = async (notif) => {
    console.log("🔔 Clicked Notification:", notif);

    const targetId = notif.id || notif._id;
    if (!targetId) {
        console.error("❌ Error: ไม่พบ ID ของการแจ้งเตือน");
        return;
    }

    if (!notif.isRead) {
      setNotifications(prev => 
        prev.map(n => {
            const currentId = n.id || n._id;
            return String(currentId) === String(targetId) ? { ...n, isRead: true } : n;
        })
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      try {
        await API.put(`/notifications/${targetId}/read`);
      } catch (err) {
        console.error("❌ Failed to mark read on server:", err);
      }
    }
    
    setShowNotif(false);
    setSidebarOpen(false);

    const targetLeaveId = notif.leaveId || (notif.notification && notif.notification.leaveId);

    if (targetLeaveId) {
        const isVacation = notif.message && (notif.message.includes('พักผ่อน') || notif.message.includes('Vacation'));
        const leaveTypePath = isVacation ? 'vacationleaves' : 'personalleaves';

        if (role === "admin") navigate(`/admin/${leaveTypePath}/${targetLeaveId}`);
        else if (role === "hr") navigate(`/hr/${leaveTypePath}/${targetLeaveId}`);
        else navigate(`/${leaveTypePath}/${targetLeaveId}`);
    } else {
        if (role === "admin") navigate("/admin");
        else if (role === "hr") navigate("/HR");
        else if (role === "foreman") navigate("/fo");
        else navigate("/das"); 
    }
  };

  const closeSidebar = () => setSidebarOpen(false);
  const toggleNotif = () => setShowNotif(!showNotif);

  // ==========================================
  // ✅ useEffect 1: จัดการ SOCKET และการแจ้งเตือน (แก้แล้ว)
  // ==========================================
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    
    loadNotifications(); // โหลดข้อมูลเก่า

    // --- Socket Logic ---
    if (!socket.connected) {
        socket.connect();
    }

    const handleJoinRoom = () => {
        if(user && user.id) {
            console.log("🔗 Joining room for user:", user.id);
            socket.emit("join", { userId: user.id });
        }
    };

    // ✅ เรียกใช้ทันที เพื่อแก้ปัญหาต้องรีเฟรชหน้า
    handleJoinRoom();

    const handleNewNotification = (payload) => {
      console.log("📨 New Socket Notification:", payload);
      const notifData = payload.notification || payload;
      
      setNotifications(prev => [notifData, ...prev]);
      setUnreadCount(prev => prev + 1);

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: 'info',
        title: 'มีการแจ้งเตือนใหม่'
      });
    };
    
    // Listeners
    socket.on("connect", handleJoinRoom);
    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off("connect", handleJoinRoom);
      socket.off('newNotification', handleNewNotification);
    };
  }, [user?.id]); // ทำงานเมื่อ user id เปลี่ยน (เช่น login ใหม่)


  // ==========================================
  // ✅ useEffect 2: จัดการ Click Outside (แยกออกมาเพื่อความสะอาด)
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  // ==========================================
  // ✅ useEffect 3: Responsive
  // ==========================================
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isSidebarOpen && window.innerWidth <= 768) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen]);


  const MenuItem = ({ to, icon, label, isNotif = false }) => (
    <div 
      className={`menu-item ${!isNotif && location.pathname === to ? 'active' : ''}`}
      onClick={() => {
        if (isNotif) { toggleNotif(); } 
        else { navigate(to); closeSidebar(); }
      }}
      ref={isNotif ? notifRef : null}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span>{label}</span>
      {isNotif && unreadCount > 0 && (
        <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <div className="layout-wrapper">
      <style>{styles}</style>

      <div className={`backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo"><span></span> ระบบลาออนไลน์</div>
          <button className="close-sidebar-btn" onClick={closeSidebar}>✕</button>
        </div>
        
        <nav className="sidebar-menu">
          <div style={{ paddingLeft: 12, fontSize: 12, color: '#9ca3af', fontWeight: 'bold', marginBottom: 5 }}>MENU</div>
          
          <MenuItem to={getHomePath()} icon="🏠" label="หน้าหลัก" />
          <MenuItem icon="🔔" label="การแจ้งเตือน" isNotif={true} />
          
          {showNotif && (
            <div className="notif-popup" ref={popupRef}>
              <div className="notif-header">การแจ้งเตือน</div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>ไม่มีการแจ้งเตือนใหม่</div>
                ) : (
                  notifications.map((n, i) => (
                    <div 
                      key={i} 
                      className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      {n.message}
                      {!n.isRead && <span style={{fontSize: 10, color: '#ef4444', marginLeft: 6}}>• ใหม่</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {role === 'user' && (
            <>
              <div style={{ margin: '20px 0 5px 12px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>USER</div>
              <MenuItem to="/request" icon="✍️" label="เขียนใบลา" />
              <MenuItem to="/das" icon="📜" label="ประวัติการลา" />
            </>
          )}

          {role === 'admin' && (
            <>
              <div style={{ margin: '20px 0 5px 12px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>ADMINISTRATION</div>
              <MenuItem to="/admin" icon="📋" label="จัดการคำขอ" /> 
              <MenuItem to="/admin/calendar" icon="📅" label="ปฏิทินการลา" />
            </>
          )}
          {role === 'foreman' && (
            <>
              <div style={{ margin: '20px 0 5px 12px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>Manager</div>
              <MenuItem to="/fo" icon="📋" label="จัดการคำขอ" /> 
              <MenuItem to="/foreman/calendar" icon="📅" label="ปฏิทินการลา" />
            </>
          )}

          {role === 'hr' && (
            <>
              <div style={{ margin: '20px 0 5px 12px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>HUMAN RESOURCE</div>
              <MenuItem to="/HR" icon="📋" label="จัดการใบลา" />
              <MenuItem to="/HRtable" icon="🖨️" label="Exportใบลา" />
              <MenuItem to="/hr/Manage" icon="👤" label="จัดการพนักงาน" />
              <MenuItem to="/hr/calendar" icon="📅" label="ปฏิทินการลา" />
            </>
          )}
        </nav>

        {/* --- User Section --- */}
        <div className="user-section">
          <div className="user-profile" onClick={() => { navigate('/profile'); closeSidebar(); }}>
            <div className="avatar">
                {profileImage ? (
                   <img src={profileImage} alt="avatar" className="avatar-img" />
                ) : (
                   getInitials(user.name)
                )}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#ccc' }}>✎</span>
          </div>
          <button className="logout-btn" onClick={logout}><span></span> ออกจากระบบ</button>
        </div>
      </aside>

      <div className="main-wrapper">
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="logo" style={{ fontSize: '18px' }}> LeaveSystem</span>
          <div style={{ width: 24 }}></div>
        </div>
        <div className="main-content">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}