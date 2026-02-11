import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 1. ส่วนตั้งค่า API ---
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

// --- CSS Styles ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  .dashboard-page { font-family: 'Sarabun', sans-serif; color: #1f2937; width: 100%; max-width: 1600px; margin: 0 auto; padding: 10px; }
  .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .header-title h1 { font-size: 28px; font-weight: 700; margin: 0 0 5px 0; color: #111827; }
  .header-title p { color: #6b7280; margin: 0; font-size: 16px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; }
  .stat-card { background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #f3f4f6; height: 140px; }
  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
  .stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .stat-value { font-size: 36px; font-weight: 800; color: #1f2937; line-height: 1; }
  .stat-label { color: #6b7280; font-size: 14px; margin-top: 4px; }
  .section-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; color: #374151; }
  .quick-actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 40px; }
  .action-card { background: #ffffff; padding: 24px; border-radius: 16px; cursor: pointer; display: flex; align-items: center; gap: 24px; border: 2px solid transparent; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
  .action-card:hover { border-color: #3b82f6; background: #fdfdfd; transform: translateY(-2px); }
  .action-img { width: 100px; height: 100px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .table-card { background: #ffffff; border-radius: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); overflow: hidden; border: 1px solid #f3f4f6; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 18px 24px; color: #6b7280; font-size: 14px; background: #f9fafb; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 18px 24px; font-size: 15px; border-bottom: 1px solid #f3f4f6; color: #1f2937; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background-color: #f9fafb; }
  .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; display: inline-block; }
  .status-pending { background: #fff7ed; color: #c2410c; }
  .status-approved { background: #ecfdf5; color: #047857; }
  .status-rejected { background: #fef2f2; color: #b91c1c; }
  @media (max-width: 768px) {
    .stats-grid, .quick-actions-grid { grid-template-columns: 1fr; }
    .action-card { flex-direction: column; text-align: center; }
    .header-section { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
`;

// Helper: คำนวณจำนวนวัน
const calculateDays = (start, end) => {
  if (!start) return 0;
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  const diffTime = Math.abs(e - s);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State สำหรับเก็บยอดรวม
  const [summaryStats, setSummaryStats] = useState({
    vacationDaysUsed: 0,
    personalDaysUsed: 0, 
    sickDaysUsed: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // เรียก API พร้อมกัน
        const results = await Promise.allSettled([
          API.get('/personalleaves/my'), 
          API.get('/vacationleaves/my')
        ]);

        let allLeaves = [];
        
        let vDays = 0;      // วันลาพักผ่อนรวม
        let pDays = 0;      // วันลากิจรวม
        let sDays = 0;      // วันลาป่วยรวม

        // --- 1. จัดการ Personal Leave (ลากิจ & ลาป่วย) ---
        if (results[0].status === 'fulfilled') {
            const resData = results[0].value.data;
            const rawList = Array.isArray(resData) 
                ? resData 
                : (resData.personalLeaves || resData.data || []);

            const mappedPersonal = rawList.map(l => {
                // Normalization: ทำเป็นตัวเล็กเพื่อเช็คได้ง่าย
                const status = l.status ? l.status.toLowerCase() : '';
                const type = l.type ? l.type.toLowerCase() : 'other';
                
                // เช็คสถานะอนุมัติ (รองรับทั้งอังกฤษและไทย)
                const isApproved = (status === 'approved' || status === 'อนุมัติ');

                if (isApproved) {
                   const days = calculateDays(l.startDate || l.date, l.endDate || l.date);
                   
                   // Logic แยกประเภท: ลาป่วย หรือ ลากิจ
                   if (type.includes('sick') || type.includes('ป่วย')) {
                       sDays += days; 
                   } else if (type.includes('personal') || type.includes('business') || type.includes('กิจ')) {
                       pDays += days; 
                   }
                }

                return {
                    ...l,
                    category: 'personal',
                    startDate: l.startDate || l.date,
                    endDate: l.endDate || l.date,
                    // เก็บ type เดิมไว้แสดงผล
                    displayType: l.type 
                };
            });
            allLeaves = [...allLeaves, ...mappedPersonal];
        }

        // --- 2. จัดการ Vacation Leave (ลาพักผ่อน) ---
        if (results[1].status === 'fulfilled') {
            const resData = results[1].value.data;
            
            const rawList = Array.isArray(resData) 
                ? resData 
                : (resData.vacationLeaves || resData.data || []);
            
            const mappedVacation = rawList.map(l => {
                const status = l.status ? l.status.toLowerCase() : '';
                const isApproved = (status === 'approved' || status === 'อนุมัติ');

                if (isApproved) {
                    const days = calculateDays(l.startDate, l.endDate);
                    vDays += days;
                }
                return { ...l, category: 'vacation' };
            });

            allLeaves = [...allLeaves, ...mappedVacation];
        }

        // อัปเดตยอดรวมเข้า State
        setSummaryStats({
            vacationDaysUsed: vDays,
            personalDaysUsed: pDays, 
            sickDaysUsed: sDays
        });

        // เรียงลำดับวันที่ (ใหม่สุดขึ้นก่อน) และตัดเหลือ 5 รายการ
        allLeaves.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setRecentLeaves(allLeaves.slice(0, 5));

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Helpers UI ---
  const formatDateRange = (start, end) => {
    if (!start) return "-";
    const s = new Date(start);
    const e = end ? new Date(end) : s;
    if (isNaN(s.getTime())) return "วันที่ไม่ถูกต้อง";
    if (s.toDateString() === e.toDateString()) {
        return s.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    }
    return `${s.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`;
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
        case 'approved': case 'อนุมัติเเล้ว': return 'status-approved';
        case 'rejected': case 'ไม่อนุญาต': return 'status-rejected';
        default: return 'status-pending';
    }
  };

  const getStatusLabel = (status) => {
     switch(status?.toLowerCase()) {
        case 'approved': return 'อนุมัติเเล้ว';
        case 'rejected': return 'ไม่อนุญาต';
        case 'pending_manager': return 'รออนุมัติ';
        default: return 'รอตรวจสอบ';
    }
  };

  const getLeaveTypeText = (item) => {
    if (item.category === 'vacation') return 'ลาพักผ่อน';
    // แปลงชื่อประเภทให้เป็นภาษาไทยสวยๆ
    const type = item.displayType?.toLowerCase() || item.type?.toLowerCase();
    if (type?.includes('sick') || type?.includes('ป่วย')) return 'ลาป่วย';
    if (type?.includes('personal') || type?.includes('business') || type?.includes('กิจ')) return 'ลากิจ';
    return item.displayType || item.type || 'อื่นๆ';
  };

  // --- ข้อมูล Stats ---
  const statsData = [
    { 
        label: 'ลาพักผ่อนที่ใช้ไป', 
        value: `${summaryStats.vacationDaysUsed} วัน`, 
        icon: '🏖️', bg: '#e0f2fe', text: '#0284c7' 
    },
    { 
        label: 'ลากิจที่ใช้ไป', 
        value: `${summaryStats.personalDaysUsed} วัน`, 
        icon: '📝', bg: '#fef3c7', text: '#d97706' 
    }, 
    { 
        label: 'ลาป่วยปีนี้', 
        value: `${summaryStats.sickDaysUsed} วัน`, 
        icon: '🏥', bg: '#fee2e2', text: '#dc2626' 
    },
  ];

  return (
    <div className="dashboard-page">
      <style>{styles}</style>
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: stat.bg, color: stat.text }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-value">{loading ? '...' : stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Quick Actions --- */}
      <div className="section-title">🚀 เมนูด่วน</div>
      <div className="quick-actions-grid">
        <div className="action-card" onClick={() => navigate('/request-personal')}>
          <img 
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=200&auto=format&fit=crop" 
            alt="Sick Leave" 
            className="action-img" 
          />
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#3b82f6' }}>ขอลาป่วย / ลากิจ</h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#666', lineHeight: 1.5 }}>
              สำหรับธุระส่วนตัวหรือเจ็บป่วย<br/>(Personal / Sick Leave)
            </p>
          </div>
        </div>

        <div className="action-card" onClick={() => navigate('/request-vacation')}>
          <img 
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop" 
            alt="Vacation Leave" 
            className="action-img" 
          />
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#10b981' }}>ขอลาพักผ่อน</h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#666', lineHeight: 1.5 }}>
              ใช้สิทธิ์วันหยุดพักร้อนประจำปี<br/>(Vacation Leave)
            </p>
          </div>
        </div>
      </div>

      {/* --- Recent Activity --- */}
      <div className="section-title">🕒 รายการล่าสุด</div>
      <div className="table-card">
        {loading ? (
           <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>⏳ กำลังโหลดข้อมูล...</div>
        ) : error ? (
           <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>⚠️ {error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ประเภท</th>
                <th>วันที่ลา</th>
                <th style={{ textAlign: 'center' }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.length > 0 ? (
                recentLeaves.map((leave, index) => (
                  <tr key={leave.id || index}>
                    <td style={{ fontWeight: 'bold', color: '#374151' }}>
                        {getLeaveTypeText(leave)}
                    </td>
                    <td>
                        {formatDateRange(leave.startDate, leave.endDate)}<span style={{ color: '#9ca3af', marginLeft: '5px' }}>({leave.durationDays || leave.totalDays} วัน)</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${getStatusClass(leave.status)}`}>
                        {getStatusLabel(leave.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                        ยังไม่มีประวัติการลา
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}