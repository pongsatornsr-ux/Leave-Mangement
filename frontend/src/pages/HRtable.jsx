import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';

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
const SECRET_KEY = "secret_signature_key_for_encrypt_2026"; 

// ✅ 3. ฟังก์ชันถอดรหัสข้อมูล
const decryptData = (cipherText) => {
    if (!cipherText) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || cipherText; 
    } catch (error) {
        return cipherText; // คืนค่าเดิมกรณี Error
    }
};
// ----------------------------------------------------------------------
// --- CSS Styles (Responsive System) ---
// ----------------------------------------------------------------------
const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

  /* Animation */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

  .hr-container {
    min-height: 100vh;
    background-color: #f3f4f6;
    padding: 40px 20px;
    font-family: 'Sarabun', sans-serif;
  }
   
  .content-card {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Header Styles */
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

  /* Filter Tabs */
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

  .month-header {
    font-size: 20px;
    font-weight: bold;
    color: #374151;
    margin: 25px 0 10px 5px;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: color 0.2s;
  }
  .month-header.active { color: #2563eb; }

  .date-header {
    background-color: #ffffff;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    border-left: 5px solid #93c5fd;
    transition: all 0.2s;
  }
  .date-header.active { background-color: #f8fafc; border-left: 5px solid #3b82f6; }

  /* --- LEAVE CARD ITEM --- */
  .leave-item {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin: 0 10px 10px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    border: 1px solid #f3f4f6;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    animation: fadeIn 0.3s ease-out;
  }
  .leave-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  }

  /* ส่วนประกอบภายใน Card */
  .info-group { display: flex; align-items: center; gap: 15px; flex: 1.5; }
  .detail-group { flex: 2; padding: 0 20px; border-left: 1px solid #eee; display: flex; flex-direction: column; justify-content: center; }
  .action-group { flex: 0.8; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

  .time-badge { font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; color: #6b7280; font-size: 13px; font-weight: 600; white-space: nowrap; }
  .user-name { font-weight: bold; color: #1f2937; font-size: 15px; }
  .dept-name { font-size: 12px; color: #9ca3af; }
  .leave-type-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: bold; width: fit-content; margin-bottom: 4px; }
   
  .date-range { font-size: 13px; color: #374151; font-weight: 500; }
  .leave-reason { font-size: 13px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }

  .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
  .delete-btn { padding: 6px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s; }
  .delete-btn:hover { background: #fecaca; }

  /* ---------------------------------- */
  /* --- MEDIA QUERY: MOBILE DESIGN --- */
  /* ---------------------------------- */
  @media (max-width: 768px) {
    .hr-container { padding: 20px 10px; }
    
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
    
    .leave-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      margin: 0 0 10px 0;
    }

    .info-group { 
      width: 100%; 
      border-bottom: 1px solid #f3f4f6; 
      padding-bottom: 10px; 
    }

    .detail-group {
      width: 100%;
      border-left: none;
      padding: 0;
    }
    
    .leave-reason { max-width: 100%; white-space: normal; }

    .action-group {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin-top: 5px;
      padding-top: 10px;
      border-top: 1px solid #f3f4f6;
    }
  }
`;

export default function HRPage() {
  const [leaves, setLeaves] = useState([]);
  
  // State Filter Type
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
          API.get('/personalleaves/hr'), 
          API.get('/vacationleaves/hr')  
        ]);

        let allLeaves = [];
        let errorMessages = [];

        if (results[0].status === 'fulfilled') {
            const data = Array.isArray(results[0].value.data) ? results[0].value.data : [];
            const decryptedData = data.map(l => ({
                ...l,
                sourceTable: 'personal',
                sickReason: (l.type === 'sick' && l.sickReason) ? decryptData(l.sickReason) : l.sickReason
            }));
            allLeaves = [...allLeaves, ...decryptedData];
        } else { errorMessages.push("โหลดใบลาป่วย/กิจ ล้มเหลว"); }

        if (results[1].status === 'fulfilled') {
            const data = Array.isArray(results[1].value.data) ? results[1].value.data : [];
            allLeaves = [...allLeaves, ...data.map(l => ({ ...l, sourceTable: 'vacation' }))];
        } else { errorMessages.push("โหลดใบลาพักผ่อนล้มเหลว"); }

        // เรียงจาก ใหม่ -> เก่า
        allLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeaves(allLeaves);
        
        if (errorMessages.length > 0) setApiError(errorMessages.join(", "));

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

  // 4. Auto Expand (Reset when year changes)
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

  const deleteLeave = async (id, type) => {
    const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?', text: "ข้อมูลจะถูกลบถาวร!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!', cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
        try {
            let endpoint = (type === 'vacation' || type === 'ลาพักผ่อน') ? `/vacationleaves/${id}` : `/personalleaves/${id}`;
            await API.delete(endpoint);
            // Update State (useMemo will handle re-grouping)
            const updatedLeaves = leaves.filter(l => l.id !== id);
            setLeaves(updatedLeaves);
            await Swal.fire('ลบสำเร็จ!', 'ลบเรียบร้อยแล้ว', 'success');
        } catch (err) {
            Swal.fire('เกิดข้อผิดพลาด', 'ลบไม่สำเร็จ', 'error');
        }
    }
  };

  const handleRowClick = (leave) => {
    if (leave.type === 'vacation' || leave.sourceTable === 'vacation') {
        navigate(`/hr/vacationleavesdetail/${leave.id}`); 
    } else {
        navigate(`/hr/personalleavesdetail/${leave.id}`);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: '#d1fae5', color: '#047857', label: 'อนุมัติ', icon: '✅' };
      case 'rejected': return { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ', icon: '❌' };
      default: return { bg: '#fef3c7', color: '#b45309', label: 'รออนุมัติ', icon: '⏳' };
    }
  };

  const getLeaveTypeName = (leave) => {
    if (leave.sourceTable === 'vacation' || leave.type === 'vacation') return { text: 'ลาพักผ่อน', color: '#4f46e5', bg: '#e0e7ff' };
    const type = leave.type?.toLowerCase();
    switch (type) {
        case 'sick': return { text: 'ลาป่วย', color: '#e11d48', bg: '#ffe4e6' };
        case 'personal': return { text: 'ลากิจ', color: '#d97706', bg: '#fef3c7' };
        default: return { text: type || '-', color: '#4b5563', bg: '#f3f4f6' };
    }
  };

  const formatFullDate = (dateStr) => new Date(dateStr).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  // คำนวณจำนวนรายการปัจจุบัน (หลังกรอง)
  const totalFilteredCount = Object.values(groupedLeaves).reduce((acc, month) => {
      return acc + Object.values(month).reduce((acc2, date) => acc2 + date.length, 0);
  }, 0);

  return (
    <div className="hr-container">
      <style>{cssStyles}</style>
      <div className="content-card">
        
        {/* Header */}
        <div className="main-header">
            <div className="header-top">
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📅 รายการคำขอลา 
                    </h2>
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
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {apiError}</div>
        )}

        {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>⏳ กำลังโหลด...</div>
        ) : Object.keys(groupedLeaves).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📭</span>
            {filterType === 'all' ? `ยังไม่มีรายการคำขอลาในปี ${selectedYear + 543}` : 'ไม่พบข้อมูลในหมวดหมู่นี้'}
          </div>
        ) : (
          <div>
            {/* Loop Month */}
            {Object.keys(groupedLeaves).map((monthKey) => (
                <div key={monthKey} style={{ marginBottom: '20px' }}>
                    
                    <div className={`month-header ${expandedMonths[monthKey] ? 'active' : ''}`} onClick={() => toggleMonth(monthKey)}>
                        <span>🗓️ {monthKey}</span>
                        <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>
                            {expandedMonths[monthKey] ? '▲ ซ่อน' : '▼ แสดงรายละเอียด'}
                        </span>
                    </div>

                    {expandedMonths[monthKey] && (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            {/* Loop Date */}
                            {Object.keys(groupedLeaves[monthKey]).map((dateKey) => (
                                <div key={dateKey}>
                                    
                                    <div className={`date-header ${expandedDates[dateKey] ? 'active' : ''}`} onClick={() => toggleDate(dateKey)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                {formatFullDate(dateKey)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {groupedLeaves[monthKey][dateKey].length} รายการ
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {expandedDates[dateKey] ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* LIST ITEMS */}
                                    {expandedDates[dateKey] && (
                                        <div style={{ paddingBottom: '10px' }}>
                                            {groupedLeaves[monthKey][dateKey].map((leave) => {
                                                
                                                // ข้อมูล User
                                                const userObj = leave.personalUser || leave.leaveUser || leave.vacationUser || leave.user || {};
                                                const displayName =  leave.name || 'ไม่ระบุชื่อ';
                                                const displayEmail = userObj.email || leave.email || '-'; 
                                                const displayDept = userObj.department || leave.department || '-';

                                                const statusInfo = getStatusStyle(leave.status);
                                                const typeInfo = getLeaveTypeName(leave);
                                                const timeStr = formatTime(leave.createdAt);

                                                return (
                                                    <div 
                                                        key={leave.id}
                                                        className="leave-item"
                                                        onClick={() => handleRowClick(leave)}
                                                    >
                                                        {/* 1. ข้อมูลผู้ใช้ & เวลา */}
                                                        <div className="info-group">
                                                            <div className="time-badge">{timeStr}</div>
                                                            <div>
                                                                <div className="user-name">{displayName}</div>
                                                                <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0' }}>
                                                                    📧 {displayEmail}
                                                                </div>
                                                                <div className="dept-name">{displayDept}</div>
                                                            </div>
                                                        </div>

                                                        {/* 2. รายละเอียดการลา */}
                                                        <div className="detail-group">
                                                            <div 
                                                                className="leave-type-badge"
                                                                style={{ color: typeInfo.color, background: typeInfo.bg }}
                                                            >
                                                                {typeInfo.text}
                                                            </div>
                                                            <div className="date-range">
                                                                📅 {new Date(leave.startDate).toLocaleDateString('th-TH', { day:'numeric', month:'short' })} - {new Date(leave.endDate).toLocaleDateString('th-TH', { day:'numeric', month:'short' })}
                                                                <span style={{ color: '#9ca3af', marginLeft: '5px' }}>({leave.durationDays || leave.totalDays} วัน)</span>
                                                            </div>
                                                            <div className="leave-reason">📝 {leave.sickReason || leave.personalReason || leave.reason || '-'}</div>
                                                        </div>

                                                        {/* 3. ปุ่มและสถานะ */}
                                                        <div className="action-group">
                                                            <div 
                                                                className="status-badge"
                                                                style={{ color: statusInfo.color, background: statusInfo.bg }}
                                                            >
                                                                {statusInfo.icon} {statusInfo.label}
                                                            </div>
                                                            <button 
                                                                className="delete-btn"
                                                                onClick={(e) => { e.stopPropagation(); deleteLeave(leave.id, leave.sourceTable); }}
                                                            >
                                                                🗑️ ลบ
                                                            </button>
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
    </div>
  );
}