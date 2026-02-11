import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
// --- CSS Styles ---
// ----------------------------------------------------------------------
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

  :root {
    --primary-color: #2563eb;
    --sidebar-bg: #111827;
    --sidebar-text: #9ca3af;
    --bg-color: #f3f4f6;
  }

  body { margin: 0; padding: 0; background: var(--bg-color); font-family: 'Sarabun', sans-serif; }

  .admin-layout { display: flex; min-height: 100vh; flex-direction: column; }
  @media (min-width: 768px) {
    .admin-layout { flex-direction: row; }
  }

  .main-content { flex: 1; padding: 20px; overflow-y: auto; width: 100%; box-sizing: border-box; }

  /* --- Grid Layout System --- */
  .dashboard-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "chart"
      "stats"
      "pending"
      "activity";
  }

  /* Desktop Layout */
  @media (min-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 2fr 1fr;
      grid-template-areas:
        "header  header"
        "stats   stats"
        "pending chart"
        "activity activity";
    }
  }

  .area-header { grid-area: header; }
  .area-stats { grid-area: stats; }
  .area-chart { grid-area: chart; }
  .area-pending { grid-area: pending; }
  .area-activity { grid-area: activity; }

  /* Typography */
  .page-title h2 { margin: 0; font-size: 24px; color: #1f2937; }
  .page-title p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
  
  /* Stats Cards */
  .stats-inner-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
    gap: 15px; 
  }
  
  .admin-stat-card { 
    background: white; 
    padding: 20px; 
    border-radius: 12px; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
    display: flex; 
    align-items: center; 
    gap: 15px; 
    border-left: 4px solid transparent; 
  }
  .stat-icon { width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }

  /* Cards & Tables */
  .card-box { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; overflow: hidden; display: flex; flex-direction: column; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  .card-title { font-size: 18px; font-weight: 700; color: #111827; }

  /* Table Styles */
  .table-scroll-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid #f3f4f6; border-radius: 8px; }
  table { width: 100%; border-collapse: collapse; min-width: 500px; }
  th { text-align: left; padding: 12px; background: #f9fafb; color: #6b7280; font-size: 13px; font-weight: 600; white-space: nowrap; }
  td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; vertical-align: middle; }
  
  /* Buttons */
  .btn-action { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; margin-right: 5px; transition: 0.2s; }
  .btn-approve { background: #d1fae5; color: #065f46; }
  .btn-approve:hover { background: #10b981; color: white; }
  .btn-reject { background: #fee2e2; color: #991b1b; }
  .btn-reject:hover { background: #ef4444; color: white; }

  /* Status Badges */
  .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; white-space: nowrap; }
  .status-approved { background: #d1fae5; color: #065f46; }
  .status-rejected { background: #fee2e2; color: #991b1b; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-pending_hr { background: #e0f2fe; color: #0369a1; } 
  .status-pending_manager { background: #f3e8ff ; color: #7e22ce; } 


  /* Modal */
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); animation: fadeIn 0.2s ease-out; padding: 20px; }
  .modal-box { background: white; padding: 25px; border-radius: 16px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .modal-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .btn-modal { padding: 10px 24px; border-radius: 8px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; flex: 1; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  /* --- Animation Keyframes --- */
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .chart-rotate-container {
    animation: spin-slow 20s linear infinite; 
    transform-origin: center center;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 600px) {
    .main-content { padding: 15px; }
    .card-header { flex-direction: row; }
    .page-title h2 { font-size: 20px; }
    td, th { font-size: 12px; padding: 10px; }
  }
`;

export default function DashboardAdmin() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState([
    { label: 'รอการอนุมัติ', value: '...', icon: '⏳', color: '#f59e0b', bg: '#fef3c7', border: '#f59e0b' },
    { label: 'คำขอทั้งหมด', value: '...', icon: '📂', color: '#3b82f6', bg: '#eff6ff', border: '#3b82f6' },
    { label: 'กำลังลาวันนี้', value: '...', icon: '🏖️', color: '#10b981', bg: '#ecfdf5', border: '#10b981' },
    { label: 'ลาป่วยเดือนนี้', value: '...', icon: '🏥', color: '#ef4444', bg: '#fef2f2', border: '#ef4444' },
  ]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]); 
  const [leaveDistribution, setLeaveDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        API.get('/personalleaves/admin'), 
        API.get('/vacationleaves/admin')  
      ]);

      let allLeaves = [];
      if (results[0].status === 'fulfilled') {
        const data = Array.isArray(results[0].value.data) ? results[0].value.data : [];
        allLeaves = [...allLeaves, ...data.map(l => ({ ...l, category: 'personal' }))];
      }
      if (results[1].status === 'fulfilled') {
        const data = Array.isArray(results[1].value.data) ? results[1].value.data : [];
        allLeaves = [...allLeaves, ...data.map(l => ({ ...l, category: 'vacation', type: 'vacation' }))];
      }

      allLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // --- จุดแก้ไข 1: กำหนดสถานะที่ถือว่ารอตรวจสอบทั้งหมด ---
      const pendingStatuses = ['pending_manager'];

      // นับจำนวน (Count)
      const pendingCount = allLeaves.filter(l => pendingStatuses.includes(l.status)).length;
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const onLeaveToday = allLeaves.filter(l => {
          if(l.status !== 'approved') return false;
          const start = new Date(l.startDate || l.date);
          const end = new Date(l.endDate || l.date);
          const s = new Date(start); s.setHours(0,0,0,0);
          const e = new Date(end); e.setHours(0,0,0,0);
          return today >= s && today <= e;
      }).length;

      const currentMonth = today.getMonth();
      const sickThisMonth = allLeaves.filter(l => {
          const d = new Date(l.createdAt);
          return l.type === 'sick' && d.getMonth() === currentMonth && l.status === 'approved';
      }).length;

      const countVacation = allLeaves.filter(l => l.type === 'vacation' || l.category === 'vacation').length;
      const countSick = allLeaves.filter(l => l.type === 'sick').length;
      const countPersonal = allLeaves.filter(l => l.type === 'personal').length;

      setStats([
        { label: 'รอการอนุมัติ', value: `${pendingCount} รายการ`, icon: '⏳', color: '#f59e0b', bg: '#fef3c7', border: '#f59e0b' },
        { label: 'คำขอทั้งหมด', value: `${allLeaves.length} ใบ`, icon: '📂', color: '#3b82f6', bg: '#eff6ff', border: '#3b82f6' },
        { label: 'กำลังลาวันนี้', value: `${onLeaveToday} คน`, icon: '🏖️', color: '#10b981', bg: '#ecfdf5', border: '#10b981' },
        { label: 'ลาป่วยเดือนนี้', value: `${sickThisMonth} ครั้ง`, icon: '🏥', color: '#ef4444', bg: '#fef2f2', border: '#ef4444' },
        { label: 'ลาพักผ่อนรวม', value: `${countVacation} ครั้ง`, icon: '✈️', color: '#8b5cf6', bg: '#f3e8ff', border: '#8b5cf6' },
        { label: 'ลากิจรวม', value: `${countPersonal} ครั้ง`, icon: '📝', color: '#d97706', bg: '#fffbeb', border: '#d97706' },
      ]);

      // --- จุดแก้ไข 2: ดึงรายการลงตาราง (Table List) ให้ครบทั้ง 3 สถานะ ---
      setPendingRequests(allLeaves.filter(l => l.status === 'pending').slice(0, 5));
      
      // ✅ 2. Recent Activity List (Limit 5 items)
      setRecentActivity(allLeaves.slice(0, 5)); 

      // Pie Chart Data
      const chartData = [
        { name: 'ลาพักผ่อน', value: countVacation, color: '#3b82f6' }, 
        { name: 'ลาป่วย', value: countSick, color: '#ef4444' },     
        { name: 'ลากิจ', value: countPersonal, color: '#f59e0b' },  
      ];

      setLeaveDistribution(chartData);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const openConfirmModal = (item, newStatus) => {
    const isApprove = newStatus === 'approved';
    const actionText = isApprove ? 'อนุมัติ' : 'ปฏิเสธ';
    setModal({
      isOpen: true, type: 'confirm', title: `ยืนยันการ${actionText}`,
      message: `คุณต้องการที่จะ "${actionText}" คำขอนี้ใช่หรือไม่?`,
      onConfirm: () => executeAction(item, newStatus)
    });
  };

  const executeAction = async (item, newStatus) => {
    setModal(prev => ({ ...prev, isOpen: false })); 
    setIsLoading(true);
    try {
        const endpoint = item.category === 'vacation' 
            ? `/vacationleaves/${item.id}/status` 
            : `/personalleaves/${item.id}/status`;
        await API.put(endpoint, { status: newStatus });
        await fetchData();
        setModal({ isOpen: true, type: 'success', title: 'ดำเนินการสำเร็จ!', message: `ทำรายการเรียบร้อยแล้ว`, onConfirm: null });
    } catch (err) {
        setModal({ isOpen: true, type: 'error', title: 'เกิดข้อผิดพลาด', message: err.response?.data?.message || 'ไม่สามารถทำรายการได้', onConfirm: null });
    } finally {
        setIsLoading(false);
    }
  };

  const formatDate = (d) => {
      if(!d) return "-";
      return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit'});
  };

  const getTypeLabel = (item) => {
      if(item.type === 'sick') return { text: 'ลาป่วย', bg: '#fee2e2', color: '#991b1b' };
      if(item.type === 'personal') return { text: 'ลากิจ', bg: '#fef3c7', color: '#92400e' };
      return { text: 'ลาพักผ่อน', bg: '#eff6ff', color: '#1e40af' };
  };

  const getStatusLabel = (status) => {
    switch(status) {
        case 'approved': return 'อนุมัติแล้ว';
        case 'rejected': return 'ปฏิเสธ';
        case 'pending': return 'รอตรวจสอบ';
        case 'pending_hr': return 'รอตรวจสอบ';
        case 'pending_manager': return 'รออนุมัติ';
        default: return status;
    }
  };

  const totalLeavesInChart = leaveDistribution.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="admin-layout">
      <style>{styles}</style>

      {/* Modal */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              {modal.type === 'confirm' && '🤔'}
              {modal.type === 'success' && '🎉'}
              {modal.type === 'error' && '❌'}
            </div>
            <div className="modal-title">{modal.title}</div>
            <div className="modal-message" style={{whiteSpace:'pre-line'}}>{modal.message}</div>
            <div className="modal-actions">
              {modal.type === 'confirm' ? (
                <>
                  <button className="btn-modal btn-modal-cancel" onClick={closeModal}>ยกเลิก</button>
                  <button className="btn-modal btn-modal-confirm" style={{background: '#2563eb', color: 'white'}} onClick={modal.onConfirm}>ยืนยัน</button>
                </>
              ) : (
                <button className="btn-modal btn-modal-confirm" style={{background: '#2563eb', color: 'white'}} onClick={closeModal}>ตกลง</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        
        {/* Dashboard Grid */}
        <div className="dashboard-grid">

            {/* Header */}
            <div className="area-header">
                <div className="top-bar">
                    <div className="page-title">
                        <h2>ภาพรวมระบบ (Overview)</h2>
                        <p>ข้อมูลสรุปและรายการที่ต้องจัดการล่าสุด</p>
                    </div>
                </div>
            </div>

            {isLoading && !modal.isOpen ? (
                <div style={{gridColumn: '1 / -1', textAlign:'center', padding:'40px', color:'#6b7280'}}>⏳ กำลังโหลดข้อมูล...</div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="area-stats">
                        <div className="stats-inner-grid">
                            {stats.map((stat, index) => (
                                <div key={index} className="admin-stat-card" style={{borderLeftColor: stat.border}}>
                                    <div className="stat-icon" style={{background: stat.bg, color: stat.color}}>{stat.icon}</div>
                                    <div>
                                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#1f2937'}}>{stat.value}</div>
                                        <div style={{fontSize: '14px', color: '#6b7280'}}>{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart with Smooth CSS Animation */}
                    <div className="area-chart card-box" style={{minHeight: '350px'}}>
                        <div className="card-title" style={{marginBottom:'20px'}}>📊 สัดส่วนการลา (แยกประเภท)</div>
                        
                        {leaveDistribution.every(d => d.value === 0) ? (
                            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'}}>ยังไม่มีข้อมูลการลา</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '300px' }}>
                                {/* List */}
                                <div style={{ 
                                    flex: 1, paddingRight: '20px', borderRight: '1px solid #f3f4f6',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {leaveDistribution.map((item, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, display: 'block' }}></span>
                                                    <span style={{ fontSize: '14px', color: '#4b5563' }}>{item.name}</span>
                                                </div>
                                                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>รวมทั้งหมด</span>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>{totalLeavesInChart}</span>
                                    </div>
                                </div>

                                {/* Pie Chart */}
                                <div style={{ flex: 1.5, height: '100%', minWidth: 0, overflow: 'hidden' }}>
                                    <div className="chart-rotate-container"> 
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie 
                                                    data={leaveDistribution} 
                                                    cx="50%" cy="50%" 
                                                    innerRadius={50} outerRadius={70} 
                                                    paddingAngle={5} dataKey="value"
                                                >
                                                    {leaveDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [`${value} รายการ`, name]} contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pending Table */}
                    <div className="area-pending card-box">
                        <div className="card-header">
                            <div className="card-title">⏳ คำขอลาล่าสุด (Pending)</div>
                            <button onClick={() => navigate('/admin')} style={{background:'none', border:'none', color:'#2563eb', cursor:'pointer', fontSize:'14px'}}>
                                ดูทั้งหมด &rarr;
                            </button>
                        </div>
                        
                        <div className="table-scroll-container">
                            {pendingRequests.length === 0 ? (
                                <div style={{textAlign:'center', padding:'20px', color:'#9ca3af'}}>ไม่มีรายการรออนุมัติ</div>
                            ) : (
                                <table>
                                <thead>
                                    <tr>
                                    <th>พนักงาน</th>
                                    <th>ประเภท</th>
                                    <th>วันที่ลา</th>
                                    <th>สถานะ</th>
                                    <th style={{textAlign:'center'}}>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRequests.map((req) => {
                                        const typeStyle = getTypeLabel(req);
                                        return (
                                            <tr key={req.id}>
                                                <td style={{fontWeight:'500'}}>
                                                    {req.leaveUser?.name || req.name || 'ไม่ระบุ'}
                                                    <div style={{fontSize:'12px', color:'#6b7280'}}>{req.department || '-'}</div>
                                                </td>
                                                <td>
                                                    <span style={{padding:'4px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'bold', background: typeStyle.bg, color: typeStyle.color}}>
                                                        {typeStyle.text}
                                                    </span>
                                                </td>
                                                <td style={{fontSize:'13px'}}>{formatDate(req.startDate || req.date)}</td>
                                                <td>
                                                    <span className={`status-badge status-${req.status}`}>
                                                        {getStatusLabel(req.status)}
                                                    </span>
                                                </td>
                                                <td style={{textAlign:'center', minWidth: '80px'}}>
                                                    <button className="btn-action btn-approve" onClick={() => openConfirmModal(req, 'approved')}>✓</button>
                                                    <button className="btn-action btn-reject" onClick={() => openConfirmModal(req, 'rejected')}>✕</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="area-activity card-box">
                        <div className="card-header">
                            <div className="card-title">🕒 รายการลาล่าสุด (Recent Activity)</div>
                            <span style={{fontSize:'12px', color:'#6b7280'}}>รายการล่าสุด</span>
                        </div>

                        <div className="table-scroll-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>พนักงาน</th>
                                        <th>ประเภทการลา</th>
                                        <th>ช่วงวันที่</th>
                                        <th style={{ textAlign: 'center' }}>สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((leave, index) => {
                                            const typeInfo = getTypeLabel(leave);
                                            return (
                                                <tr key={leave.id || index}>
                                                    <td style={{ fontWeight: 'bold', color: '#374151' }}>
                                                        {leave.leaveUser?.name || leave.name || 'ไม่ระบุชื่อ'}
                                                        <div style={{fontSize:'12px', color:'#9ca3af', fontWeight:'normal'}}>{leave.department || '-'}</div>
                                                    </td>
                                                    <td>
                                                        <span style={{color: typeInfo.color, fontWeight:600, fontSize:'13px'}}>{typeInfo.text}</span>
                                                    </td>
                                                    <td style={{fontSize:'13px'}}>
                                                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}<span style={{ color: '#9ca3af', marginLeft: '5px' }}>({leave.durationDays || leave.totalDays} วัน)</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className={`status-badge status-${leave.status}`}>
                                                            {getStatusLabel(leave.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                                ยังไม่มีประวัติการลา
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </>
            )}
        </div>
      </main>
    </div>
  );
}