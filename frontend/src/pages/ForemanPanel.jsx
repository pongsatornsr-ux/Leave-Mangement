import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js'; // ✅ 1. Import crypto-js

// ----------------------------------------------------------------------
// --- Configuration & Initialization ---
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

// ✅ 2. กำหนด Secret Key (ต้องตรงกับตอนบันทึก)
const SECRET_KEY = "secret_signature_key_for_encrypt_2026"; 

// ✅ 3. ฟังก์ชันถอดรหัสข้อมูล
const decryptData = (cipherText) => {
    if (!cipherText) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        // ถ้าถอดได้ให้คืนค่า ถ้าไม่ได้ (เช่นข้อมูลเก่าไม่ได้เข้ารหัส) ให้คืนค่าเดิม
        return originalText || cipherText; 
    } catch (error) {
        return cipherText; // คืนค่าเดิมกรณี Error
    }
};

// ----------------------------------------------------------------------
// --- CSS Styles (Responsive) ---
// ----------------------------------------------------------------------
const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

  /* Animation */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

  /* Base Container */
  .admin-container {
    min-height: 100vh;
    background-color: #f3f4f6;
    padding: 40px 20px;
    font-family: 'Sarabun', sans-serif;
  }
  .content-wrapper {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Header */
  .main-header {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 25px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
  }

  /* --- Year Selector (NEW) --- */
  .year-selector {
    display: flex;
    gap: 10px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f3f4f6;
    overflow-x: auto;
    align-items: center;
  }
  .year-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 600;
    white-space: nowrap;
  }
  .year-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    font-weight: 600;
    color: #374151;
    transition: all 0.2s;
    font-size: 14px;
  }
  .year-btn:hover { background: #f9fafb; border-color: #d1d5db; }
  .year-btn.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
  }

  /* Filter Tabs Styles */
  .filter-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
  }
  .filter-btn {
      padding: 8px 16px;
      border-radius: 20px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
      background-color: #f3f4f6;
      color: #6b7280;
  }
  .filter-btn:hover { background-color: #e5e7eb; }
  .filter-btn.active { box-shadow: 0 2px 5px rgba(0,0,0,0.1); color: white; }
  
  /* Filter Active Colors */
  .filter-btn.active.all { background-color: #374151; }
  .filter-btn.active.sick { background-color: #e11d48; }
  .filter-btn.active.personal { background-color: #d97706; }
  .filter-btn.active.vacation { background-color: #4f46e5; }

  /* Month Header */
  .month-header {
    background-color: #ffffff;
    padding: 15px 20px;
    border-radius: 12px;
    margin-bottom: 15px;
    margin-top: 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: all 0.2s;
  }
  .month-header:hover { background-color: #f9fafb; }
  .month-header.active { color: #2563eb; border-color: #bfdbfe; }

  /* Date Group Header */
  .date-header {
    background-color: #ffffff;
    padding: 12px 20px;
    border-radius: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: all 0.2s;
    border-left: 5px solid #93c5fd;
  }
  .date-header.active { background-color: #f8fafc; border-left-color: #3b82f6; }

  /* --- LEAVE ITEM CARD --- */
  .leave-card {
    background-color: white;
    padding: 15px;
    margin-bottom: 10px;
    margin-left: 15px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    animation: fadeIn 0.3s ease-out;
  }
  .leave-card:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  /* Column ภายใน Card */
  .col-user-info { display: flex; align-items: center; gap: 15px; flex: 2; }
  .col-details { flex: 2; margin-left: 25px; border-left: 1px solid #eee; padding-left: 15px; color: #374151; font-size: 14px; }
  .col-status { margin-left: 15px; }

  /* Time Box */
  .time-badge {
    background: #f3f4f6; padding: 5px 10px; border-radius: 6px;
    font-family: monospace; font-weight: bold; color: #4b5563; min-width: 60px; text-align: center;
  }

  /* ------------------------------------------- */
  /* --- MEDIA QUERY: MOBILE (จอเล็กกว่า 768px) --- */
  /* ------------------------------------------- */
  @media (max-width: 768px) {
    .admin-container { padding: 20px 10px; }
    
    .header-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    .filter-group {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 5px;
    }
    .main-header { gap: 15px; }
    
    .leave-card {
      flex-direction: column;
      align-items: flex-start;
      margin-left: 0;
      gap: 12px;
    }

    .col-user-info { 
      width: 100%; 
      justify-content: flex-start; 
    }

    .col-details {
      margin-left: 0;
      padding-left: 0;
      border-left: none;
      border-top: 1px solid #eee;
      padding-top: 10px;
      width: 100%;
    }

    .col-status {
      margin-left: 0;
      align-self: flex-end;
    }
  }
`;

export default function AdminPanel() { 
  const [leaves, setLeaves] = useState([]);
  
  // State Filter
  const [filterType, setFilterType] = useState('all');

  // ✅ State Year Filter (ใหม่)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 1. โหลดข้อมูลใบลา
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          API.get('/personalleaves/fore'), 
          API.get('/vacationleaves/fore')  
        ]);

        let allLeaves = [];

        if (results[0].status === 'fulfilled') {
            const data = Array.isArray(results[0].value.data) ? results[0].value.data : [];
            // ✅ 4. ถอดรหัส sickReason สำหรับ Personal Leaves
            const decryptedData = data.map(l => ({
                ...l,
                sourceTable: 'personal',
                sickReason: l.type === 'sick' && l.sickReason ? decryptData(l.sickReason) : l.sickReason
            }));
            allLeaves = [...allLeaves, ...decryptedData];
        }

        if (results[1].status === 'fulfilled') {
            const data = Array.isArray(results[1].value.data) ? results[1].value.data : [];
            allLeaves = [...allLeaves, ...data.map(l => ({ ...l, sourceTable: 'vacation' }))];
        }

        // เรียงข้อมูลจาก ใหม่ -> เก่า
        allLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeaves(allLeaves);
        
      } catch (err) {
        console.error("Error:", err);
        setApiError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
      } finally {
        setIsLoading(false);
      }
    })()
  }, []);

  // ✅ 2. Logic หาปีทั้งหมดที่มีในข้อมูล (เพื่อสร้างปุ่ม)
  const availableYears = useMemo(() => {
    if (leaves.length === 0) return [new Date().getFullYear()];

    const years = new Set(leaves.map(l => new Date(l.createdAt).getFullYear()));
    years.add(new Date().getFullYear()); // Ensure current year exists
    
    // Sort Descending (2025, 2024, ...)
    return Array.from(years).sort((a, b) => b - a);
  }, [leaves]);

  // ✅ 3. Logic กรองและจัดกลุ่ม (Update ให้กรองปีด้วย)
  const groupedLeaves = useMemo(() => {
      // 3.1 Filter Year FIRST
      let filteredData = leaves.filter(l => new Date(l.createdAt).getFullYear() === selectedYear);

      // 3.2 Filter Type
      if (filterType !== 'all') {
          filteredData = filteredData.filter(leave => {
              const type = leave.type ? leave.type.toLowerCase() : '';
              const source = leave.sourceTable;
              
              if (filterType === 'sick') return type === 'sick';
              if (filterType === 'personal') return type === 'personal';
              if (filterType === 'vacation') return type === 'vacation' || source === 'vacation';
              return false;
          });
      }

      // 3.3 Group Data
      const groups = {};
      filteredData.forEach(leave => {
          const dateObj = new Date(leave.createdAt);
          const monthKey = dateObj.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
          const dateKey = dateObj.toDateString(); 
          if (!groups[monthKey]) groups[monthKey] = {};
          if (!groups[monthKey][dateKey]) groups[monthKey][dateKey] = [];
          groups[monthKey][dateKey].push(leave);
      });

      return groups;
  }, [leaves, filterType, selectedYear]); // ✅ Re-calc when year changes

  // 4. Auto Expand (Update ให้ reset เมื่อปีเปลี่ยน)
  useEffect(() => {
      const months = Object.keys(groupedLeaves);
      if (months.length > 0) {
          const firstMonth = months[0];
          const dates = Object.keys(groupedLeaves[firstMonth]);
          if (dates.length > 0) {
              const firstDate = dates[0];
              setExpandedMonths({ [firstMonth]: true });
              setExpandedDates({ [firstDate]: true });
          }
      } else {
          setExpandedMonths({});
          setExpandedDates({});
      }
  }, [groupedLeaves, selectedYear]); // ✅ Trigger reset on year change


  const toggleMonth = (monthKey) => setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
  const toggleDate = (dateKey) => setExpandedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));

  const handleRowClick = (leave) => {
    if (leave.type === 'vacation' || leave.type === 'ลาพักผ่อน' || leave.sourceTable === 'vacation') {
        navigate(`/admin/vacationleaves/${leave.id}`); 
    } else {
        navigate(`/admin/personalleaves/${leave.id}`);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: '#d1fae5', color: '#047857', label: 'อนุมัติแล้ว', icon: '✅' };
      case 'rejected': return { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ', icon: '❌' };
      default: return { bg: '#fef3c7', color: '#b45309', label: 'รออนุมัติ', icon: '⏳' };
    }
  };

  const getLeaveTypeName = (leave) => {
    if (leave.sourceTable === 'vacation' || leave.type === 'vacation') return { text: 'ลาพักผ่อน', color: '#4f46e5', bg: '#e0e7ff' };
    const type = leave.type?.toLowerCase();
    switch (type) {
        case 'sick': return { text: 'ลาป่วย', color: '#e11d48', bg: '#ffe4e6' };
        case 'personal': return { text: 'ลากิจส่วนตัว', color: '#d97706', bg: '#fef3c7' };
        default: return { text: type || '-', color: '#4b5563', bg: '#f3f4f6' };
    }
  };

  const formatFullDate = (dateStr) => new Date(dateStr).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  // คำนวณจำนวนรายการ (หลังกรอง)
  const totalFilteredCount = Object.values(groupedLeaves).reduce((acc, month) => {
      return acc + Object.values(month).reduce((acc2, date) => acc2 + date.length, 0);
  }, 0);

  return (
    <div className="admin-container">
      <style>{cssStyles}</style>
      <div className="content-wrapper">
        
        {/* Main Header */}
        <div className="main-header">
            <div className="header-top">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📅 จัดการคำขอลา
                    </h2>
                    <p style={{ color: '#6b7280', marginTop: '5px', fontSize: '14px' }}>
                      
                    </p>
                </div>
                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                    ปี {selectedYear + 543}: {totalFilteredCount} รายการ
                </div>
            </div>

            {/* ✅ Year Selector UI */}
            <div className="year-selector">
                <span className="year-label">เลือกปี:</span>
                {availableYears.map(year => (
                    <button 
                        key={year}
                        className={`year-btn ${selectedYear === year ? 'active' : ''}`}
                        onClick={() => setSelectedYear(year)}
                    >
                        {year + 543} {/* แปลงเป็น พ.ศ. */}
                    </button>
                ))}
            </div>

            {/* Filter Buttons */}
            <div className="filter-group">
                <button 
                    className={`filter-btn all ${filterType === 'all' ? 'active' : ''}`} 
                    onClick={() => setFilterType('all')}
                >
                    ทั้งหมด
                </button>
                <button 
                    className={`filter-btn sick ${filterType === 'sick' ? 'active' : ''}`} 
                    onClick={() => setFilterType('sick')}
                >
                     ลาป่วย
                </button>
                <button 
                    className={`filter-btn personal ${filterType === 'personal' ? 'active' : ''}`} 
                    onClick={() => setFilterType('personal')}
                >
                     ลากิจ
                </button>
                <button 
                    className={`filter-btn vacation ${filterType === 'vacation' ? 'active' : ''}`} 
                    onClick={() => setFilterType('vacation')}
                >
                     ลาพักผ่อน
                </button>
            </div>
        </div>

        {apiError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5' }}>
              ⚠️ <strong>ระบบแจ้งเตือน:</strong> {apiError}
          </div>
        )}

        {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '20px', color: '#6b7280' }}>⏳ กำลังโหลดข้อมูล...</div>
            </div>
        ) : Object.keys(groupedLeaves).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📭</span>
            <p style={{ fontSize: '18px', color: '#374151' }}>
                ไม่พบข้อมูลคำขอลาในปี {selectedYear + 543}
            </p>
          </div>
        ) : (
          <div>
            {/* Loop เดือน */}
            {Object.keys(groupedLeaves).map((monthKey) => (
                <div key={monthKey}>
                    
                    <div 
                        className={`month-header ${expandedMonths[monthKey] ? 'active' : ''}`} 
                        onClick={() => toggleMonth(monthKey)}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                            🗓️ {monthKey}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {expandedMonths[monthKey] ? '▲ ซ่อน' : '▼ แสดงรายละเอียด'}
                        </span>
                    </div>

                    {/* Loop วันที่ */}
                    {expandedMonths[monthKey] && (
                        <div style={{ paddingLeft: '5px' }}>
                            {Object.keys(groupedLeaves[monthKey]).map((dateKey) => (
                                <div key={dateKey} style={{ marginBottom: '10px' }}>
                                    
                                    <div 
                                        className={`date-header ${expandedDates[dateKey] ? 'active' : ''}`} 
                                        onClick={() => toggleDate(dateKey)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '18px' }}>{expandedDates[dateKey] ? '📂' : '📁'}</span>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                                                    {formatFullDate(dateKey)}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    มี {groupedLeaves[monthKey][dateKey].length} รายการ
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{expandedDates[dateKey] ? '▼' : '▶'}</span>
                                    </div>

                                    {/* รายการคำขอ (Item Card) */}
                                    {expandedDates[dateKey] && (
                                        <div>
                                            {groupedLeaves[monthKey][dateKey].map((leave) => {
                                                
                                                // --- ดึงข้อมูล User และ Email ---
                                                const userObj = leave.personalUser || leave.leaveUser || leave.vacationUser || leave.user || {};
                                                const displayName = leave.name || 'ไม่ระบุชื่อ';
                                                const displayEmail = userObj.email || leave.email || '-'; 
                                                const displayDept = userObj.department || leave.department || '-';

                                                const statusInfo = getStatusStyle(leave.status);
                                                const typeInfo = getLeaveTypeName(leave);
                                                const timeStr = formatTime(leave.createdAt);

                                                return (
                                                    <div 
                                                        key={leave.id}
                                                        className="leave-card"
                                                        onClick={() => handleRowClick(leave)}
                                                    >
                                                        {/* Mobile: Top Row for Time */}
                                                        <div className="mobile-top-row" style={{ display: 'none' }}>
                                                            <div className="time-badge">{timeStr} น.</div>
                                                        </div>

                                                        {/* Section 1: User Info & Time */}
                                                        <div className="col-user-info">
                                                            <div className="time-badge show-desktop">{timeStr} น.</div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#111827' }}>
                                                                    {displayName}
                                                                </div>

                                                                <div style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 6px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    📧 {displayEmail}
                                                                </div>

                                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                                                                    <span className="tag-type" style={{ color: typeInfo.color, background: typeInfo.bg, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                                                        {typeInfo.text}
                                                                    </span>
                                                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>• {displayDept}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Section 2: Details */}
                                                        <div className="col-details">
                                                            <div style={{ marginBottom: '4px', fontWeight:'500' }}>
                                                                📅 {new Date(leave.startDate).toLocaleDateString('th-TH', { day:'numeric', month:'short' })} - {new Date(leave.endDate).toLocaleDateString('th-TH', { day:'numeric', month:'short' })}<span style={{ color: '#9ca3af', marginLeft: '5px' }}>({leave.durationDays || leave.totalDays} วัน)</span>
                                                            </div>
                                                            <div style={{ color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                                                                📝 {leave.reason || leave.sickReason || leave.personalReason || '-'}
                                                            </div>
                                                        </div>

                                                        {/* Section 3: Status */}
                                                        <div className="col-status">
                                                            <div style={{ 
                                                                background: statusInfo.bg, color: statusInfo.color, 
                                                                padding: '6px 12px', borderRadius: '20px', 
                                                                fontSize: '12px', fontWeight: 'bold', 
                                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {statusInfo.icon} {statusInfo.label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
         @media (max-width: 768px) {
             .show-desktop { display: none !important; }
             .mobile-only-time { display: block; }
         }
         @media (min-width: 769px) {
             .mobile-only-time { display: none; }
         }
      `}</style>
    </div>
  );
}