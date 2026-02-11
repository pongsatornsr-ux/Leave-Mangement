import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { io } from 'socket.io-client';

/* ==================================== */
/* ========= Constant & Helper ========= */
/* ==================================== */

const MOBILE_BREAKPOINT = 768;
const socket = io('http://localhost:5000');

const StyledLink = ({ to, children, ...props }) => (
  <Link to={to} style={navLinkStyle} {...props}>
    {children}
  </Link>
);

/* ================================= */
/* ========= Navbar Component ========= */
/* ================================= */

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const nav = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  
  // Ref สำหรับ Click Outside
  const notifContainerRef = useRef(); // ใช้คุม Container ของ Notification ทั้งหมด
  const dropdownRef = useRef();

  /* ---------------------- */
  /* --- Responsive Effect --- */
  /* ---------------------- */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---------------------- */
  /* --- Data Fetching --- */
  /* ---------------------- */
  const loadNotifications = async () => {
    if (!user) return;
    try {
      // ⚠️ หมายเหตุ: ถ้า Backend ส่งมาเฉพาะ unread เมื่อกดอ่านแล้วมันจะหายไปจาก List นี้ตอนโหลดใหม่
      // ถ้าอยากให้ประวัติอยู่ ต้องแก้ Backend ให้ส่ง all notifications มาครับ
      const res = await API.get('/notifications/unread');
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  /* ---------------------- */
  /* --- Effects & Sockets --- */
  /* ---------------------- */
  useEffect(() => {
    if (!user) return;
    loadNotifications();
    socket.emit("join", { userId: user.id });
    socket.on('newNotification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    const handleClickOutside = (event) => {
      // ใช้ Ref ของ Container เพื่อดูว่าคลิกข้างนอกหรือไม่
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target)) {
        setShowNotifPopup(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      socket.off('newNotification');
    };
  }, [user]);

  /* ---------------------- */
  /* --- Handlers --- */
  /* ---------------------- */
  const logout = () => {
    localStorage.clear();
    nav('/login');
  };

  const handleOpenNotif = () => {
    // ✅ แก้ไข: แค่เปิด/ปิด Popup ไม่ทำการ Mark as read ที่นี่
    setShowNotifPopup(prev => !prev);
    setShowDropdown(false);
  };

  const handleClickNotification = async (notif) => {
    // ✅ Mark as read เฉพาะตอนกดที่รายการเท่านั้น
    if (!notif.isRead) {
      try {
        await API.put(`/notifications/${notif.id}/read`);
        const updatedNotifications = notifications.map(n =>
          n.id === notif.id ? { ...n, isRead: true } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      }
    }
    
    setShowNotifPopup(false);
    setShowMobileMenu(false);

    // Navigate logic
    const role = user?.role?.toLowerCase();
    if (role === "admin") nav("/admin");
    else if (role === "hr") nav("/HR");
    else nav("/"); // หรือเปลี่ยนเป็น Link ของ Notification นั้นๆ ถ้ามี
  };
  
  const handleDropdownClick = () => {
    setShowDropdown(prev => !prev);
    setShowNotifPopup(false);
  };

  const roleLinks = () => {
    if (!user) return null;
    const links = [];
    const closeMenu = () => setShowMobileMenu(false);
    
    switch (user.role.toLowerCase()) {
      case 'admin':
        links.push(<StyledLink key="admin" to="/admin" onClick={closeMenu}>Admin</StyledLink>);
        links.push(<StyledLink key="calendar" to="/admin/calendar" onClick={closeMenu}>ปฏิทิน</StyledLink>);
        break;
      case 'hr':
        links.push(<StyledLink key="hr" to="/HR" onClick={closeMenu}>HR</StyledLink>);
        links.push(<StyledLink key="HRtable" to="/HRtable" onClick={closeMenu}>ตารางใบลา</StyledLink>);
        break;
      default:
        links.push(<StyledLink key="home" to="/" onClick={closeMenu}>หน้าหลัก</StyledLink>);
        links.push(<StyledLink key="request" to="/request" onClick={closeMenu}>ขอลา</StyledLink>);
        break;
    }
    return links;
  };

  if (!user) return <></>;

  // Styles setup
  const finalNavContainerStyle = {
    ...navContainerStyle,
    justifyContent: 'space-between', 
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    padding: isMobile ? '0 16px' : '0 auto',
    height: isMobile ? 'auto' : '100%',
    width: isMobile ? 'calc(100% - 32px)' : '100%',
  };

  const navLinksContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const mobileMenuContainerStyle = {
    display: isMobile ? (showMobileMenu ? 'flex' : 'none') : 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    width: isMobile ? '100%' : 'auto',
    marginTop: isMobile ? 10 : 0,
    paddingBottom: isMobile ? 10 : 0,
    gap: isMobile ? 8 : 12,
  };

  const mobileNavStyle = {
    ...navStyle,
    height: isMobile ? (showMobileMenu ? 'auto' : 60) : 60,
    padding: '10px 16px',
    alignItems: 'flex-start',
  };

  const navHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between', 
    alignItems: 'center',
    width: '100%',
    height: 40,
  };

  return (
    <nav style={mobileNavStyle}>
      <div style={finalNavContainerStyle}>
        
        {/* Header */}
        <div style={isMobile ? navHeaderStyle : { ...navLinksContainerStyle, width: '100%', justifyContent: 'space-between' }}> 
          <div style={logoStyle}>ระบบลาออนไลน์</div>

          {isMobile ? (
            <div style={{ fontSize: 24, cursor: 'pointer', color: '#374151' }} onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? '✕' : '☰'}
            </div>
          ) : (
            <div style={{ ...navLinksContainerStyle, justifyContent: 'flex-end', flexGrow: 1 }}>
              {roleLinks()}
              <StyledLink to="/news">📰 ข่าวสาร</StyledLink>

              {/* --- Desktop Notification --- */}
              {/* ✅ ใช้ ref ที่ Container เพื่อคุมตำแหน่ง absolute */}
              <div style={{ position: 'relative' }} ref={notifContainerRef}>
                <span style={{ ...navLinkStyle, cursor: 'pointer' }} onClick={handleOpenNotif}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={badgeStyle}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>

                {showNotifPopup && (
                  <div style={notifPopupStyle}>
                    <div style={{padding: '10px 12px', fontWeight: 'bold', borderBottom: '1px solid #eee'}}>การแจ้งเตือน</div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 12, fontSize: 14, color: '#6b7280', textAlign: 'center' }}>ไม่มีแจ้งเตือน</div>
                    ) : (
                      notifications.map((n, i) => (
                        <div
                          key={n.id || i}
                          style={{...notifItemStyle, fontWeight: n.isRead ? 400 : 600, background: n.isRead ? '#fff' : '#f0f9ff'}}
                          onClick={() => handleClickNotification(n)}
                        >
                          {n.message}
                          {!n.isRead && <span style={{ color: '#ef4444', marginLeft: 6, fontSize: 10 }}>• ใหม่</span>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Profile */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div onClick={handleDropdownClick} style={userBtnStyle}>
                  <img
                    src={user.avatar || 'https://i.pravatar.cc/32'}
                    alt="avatar"
                    style={avatarStyle}
                  />
                  <span>{user.name}</span>
                </div>

                {showDropdown && (
                  <div style={dropdownMenuStyle}>
                    <Link to="/profile" style={dropdownLinkStyle} onClick={() => setShowDropdown(false)}>
                      📝 แก้ไขโปรไฟล์
                    </Link>
                    <div style={dropdownLinkStyle} onClick={logout}>
                        🚪 ออกจากระบบ
                    </div>
                  </div>
                )}
              </div>
              <button style={logoutButtonStyle} onClick={logout}>ออกจากระบบ</button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && (
          <div style={mobileMenuContainerStyle}>
            {roleLinks()}
            <StyledLink to="/news" onClick={() => setShowMobileMenu(false)}>📰 ข่าวสาร</StyledLink>

            {/* Notification/Profile Mobile */}
            <div style={{...userBtnStyle, cursor: 'default', background: 'transparent', gap: 12, padding: '4px 0'}}>
                
                {/* Mobile Notification */}
                <div style={{ position: 'relative', display: 'flex' }} ref={notifContainerRef}>
                    <span style={{ ...navLinkStyle, cursor: 'pointer', padding: '0 8px' }} onClick={handleOpenNotif}>
                        🔔
                        {unreadCount > 0 && (
                            <span style={badgeStyle}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </span>
                    {/* Mobile Popup Logic */}
                    {showNotifPopup && (
                        <div style={{...notifPopupStyle, right: 'auto', left: 0, top: '40px', width: '280px'}}>
                            <div style={{padding: '10px 12px', fontWeight: 'bold', borderBottom: '1px solid #eee'}}>การแจ้งเตือน</div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 12, fontSize: 14, color: '#6b7280' }}>ไม่มีแจ้งเตือน</div>
                            ) : (
                                notifications.map((n, i) => (
                                    <div
                                        key={n.id || i}
                                        style={{...notifItemStyle, fontWeight: n.isRead ? 400 : 600, background: n.isRead ? '#fff' : '#f0f9ff'}}
                                        onClick={() => handleClickNotification(n)}
                                    >
                                        {n.message}
                                        {!n.isRead && <span style={{ color: '#ef4444', marginLeft: 6 }}>• ใหม่</span>}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Profile */}
                <div style={{...navLinksContainerStyle, gap: 12}} ref={dropdownRef}>
                    <div onClick={handleDropdownClick} style={{...userBtnStyle, background: 'transparent', cursor: 'pointer', padding: 0}}>
                        <img src={user.avatar || 'https://i.pravatar.cc/32'} alt="avatar" style={avatarStyle}/>
                        <span style={{color: '#374151', fontWeight: 500, fontSize: 14}}>{user.name}</span>
                    </div>

                    {showDropdown && (
                        <div style={{...dropdownMenuStyle, top: '40px', right: 'auto', left: 0}}>
                            <Link to="/profile" style={dropdownLinkStyle} onClick={() => {setShowDropdown(false); setShowMobileMenu(false);}}>
                                📝 แก้ไขโปรไฟล์
                            </Link>
                            <div style={dropdownLinkStyle} onClick={logout}>
                                🚪 ออกจากระบบ
                            </div>
                        </div>
                    )}
                    
                    <button style={{...logoutButtonStyle, marginTop: 0}} onClick={logout}>
                      ออกจากระบบ
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ============================ */
/* ========= Styles ========= */
/* ============================ */

const navStyle = {
  background: '#ffffff',
  padding: '10px 16px',
  boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 999,
  display: 'flex',
  alignItems: 'center',
};

const navContainerStyle = {
  maxWidth: 1300,
  margin: '0 auto',
};

const logoStyle = {
  fontWeight: 700,
  fontSize: '18px',
  background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
};

const navLinkStyle = {
  textDecoration: 'none',
  color: '#374151',
  fontWeight: 500,
  fontSize: 14,
  padding: '6px 10px',
  borderRadius: 6,
  transition: 'background-color 0.2s',
};

const badgeStyle = {
  position: 'absolute',
  top: -6,
  right: -6,
  minWidth: 18,
  height: 18,
  borderRadius: 999,
  background: '#ef4444',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  border: '2px solid #fff'
};

// ✅ แก้ไข: เปลี่ยนเป็น absolute และอ้างอิงตำแหน่งจาก parent
const notifPopupStyle = {
  position: 'absolute',
  top: '40px', // ปรับให้ลงมาจากกระดิ่ง
  right: '-10px', // ชิดขวาเทียบกับกระดิ่ง (อาจปรับตามต้องการ)
  width: '320px', // ขยายความกว้างให้อ่านง่ายขึ้น
  maxHeight: '400px',
  overflowY: 'auto',
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  zIndex: 2000,
  border: '1px solid #e5e7eb'
};

const notifItemStyle = {
  padding: '12px',
  borderBottom: '1px solid #f3f4f6',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  lineHeight: '1.4'
};

const userBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: '#f3f4f6',
  padding: '4px 10px',
  borderRadius: 6,
  cursor: 'pointer',
};

const avatarStyle = {
  width: 30,
  height: 30,
  borderRadius: '50%',
  objectFit: 'cover',
};

const dropdownMenuStyle = {
  position: 'absolute',
  top: '120%',
  right: 0,
  width: 180,
  background: '#fff',
  borderRadius: 6,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  zIndex: 1000,
  border: '1px solid #e5e7eb'
};

const dropdownLinkStyle = {
  display: 'block',
  padding: '10px 14px',
  textDecoration: 'none',
  fontSize: 14,
  color: '#111827',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const logoutButtonStyle = {
  padding: '6px 12px',
  background: '#ef4444',
  borderRadius: 6,
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
};