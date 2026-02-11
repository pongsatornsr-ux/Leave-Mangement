import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

// ✅ กำหนด Secret Key (ต้องตรงกับตอนบันทึก)
const SECRET_KEY = "secret_signature_key_for_encrypt_2026"; 

// ✅ ฟังก์ชันถอดรหัสข้อมูล
const decryptData = (cipherText) => {
    if (!cipherText) return "";
    // ถ้าข้อมูลเป็นรูปลายเซ็น (data:image) ให้คืนค่าเลย
    if (cipherText.startsWith("data:image")) return cipherText;

    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
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
  .dashboard-container {
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

  /* Year Selector */
  .year-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    overflow-x: auto;
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
    border-color: #bfdbfe;
  }

  /* Column ภายใน Card */
  .col-main-info { display: flex; align-items: center; gap: 15px; flex: 2; }
  .col-details { flex: 2; margin-left: 25px; border-left: 1px solid #eee; padding-left: 15px; color: #374151; font-size: 14px; }
  .col-status { margin-left: 15px; }

  /* Time Box */
  .time-badge {
    background: #f3f4f6; padding: 5px 10px; border-radius: 6px;
    font-family: monospace; font-weight: bold; color: #4b5563; min-width: 60px; text-align: center;
  }

  /* Tag Styles */
  .tag-type { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  .subject-text { font-weight: bold; font-size: 16px; color: #111827; }

  /* ------------------------------------------- */
  /* --- MEDIA QUERY: MOBILE --- */
  /* ------------------------------------------- */
  @media (max-width: 768px) {
    .dashboard-container { padding: 20px 10px; }
    
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
    
    .leave-card {
      flex-direction: column;
      align-items: flex-start;
      margin-left: 0;
      gap: 12px;
    }

    .col-main-info { 
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

export default function Dashboard() {
    const [leavesData, setLeavesData] = useState({ vacationLeaves: [], personalLeaves: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [expandedMonths, setExpandedMonths] = useState({});
    const [expandedDates, setExpandedDates] = useState({});
    const navigate = useNavigate();

    // 1. Fetch Data
    useEffect(() => {
        (async () => {
            try {
                const res = await API.get('/personalleaves/my');
                setLeavesData(res.data);
            } catch (err) {
                console.error("Error fetching leaves data:", err);
            } finally {
                setIsLoading(false);
            }
        })()
    }, []);

    // 2. Extract Available Years
    const availableYears = useMemo(() => {
        if (!leavesData.vacationLeaves && !leavesData.personalLeaves) return [new Date().getFullYear()];

        const allDates = [
            ...(leavesData.vacationLeaves || []).map(l => l.createdAt),
            ...(leavesData.personalLeaves || []).map(l => l.createdAt)
        ];

        const years = new Set(allDates.map(d => new Date(d).getFullYear()));
        years.add(new Date().getFullYear()); 
        return Array.from(years).sort((a, b) => b - a);
    }, [leavesData]);

    // 3. Process Data, Grouping & Decryption
    const groupedLeaves = useMemo(() => {
        if (!leavesData.vacationLeaves && !leavesData.personalLeaves) return {};

        const vacationLeavesWithType = (leavesData.vacationLeaves || []).map(l => ({ ...l, type: 'vacation' }));
        const personalLeavesWithType = (leavesData.personalLeaves || []).map(l => ({ 
            ...l, 
            type: l.type || 'personal',
            // ✅ ถอดรหัส sickReason ตรงนี้
            sickReason: (l.type === 'sick' && l.sickReason) ? decryptData(l.sickReason) : l.sickReason
        }));

        let allLeaves = [...vacationLeavesWithType, ...personalLeavesWithType];

        // Filter by Selected Year
        allLeaves = allLeaves.filter(leave => {
            const leaveYear = new Date(leave.createdAt).getFullYear();
            return leaveYear === selectedYear;
        });

        // Filter by Type
        if (filterType !== 'all') {
            allLeaves = allLeaves.filter(leave => leave.type === filterType);
        }

        // Sort (New -> Old)
        allLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Grouping
        const groups = {};
        allLeaves.forEach(leave => {
            const dateObj = new Date(leave.createdAt);
            const monthKey = dateObj.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
            const dateKey = dateObj.toDateString(); 

            if (!groups[monthKey]) groups[monthKey] = {};
            if (!groups[monthKey][dateKey]) groups[monthKey][dateKey] = [];
            groups[monthKey][dateKey].push(leave);
        });

        return groups;
    }, [leavesData, filterType, selectedYear]);

    // 4. Auto Expand
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
    }, [groupedLeaves, selectedYear]);

    // Helpers
    const toggleMonth = (monthKey) => setExpandedMonths(prev => ({ ...prev, [monthKey]: !prev[monthKey] }));
    const toggleDate = (dateKey) => setExpandedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));

    const handleCardClick = (leave) => {
        if (leave.type === 'vacation') {
            navigate(`/vacationleaves/${leave.id || leave._id}`);
        } else {
            navigate(`/personalleaves/${leave.id || leave._id}`);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return { bg: '#d1fae5', color: '#047857', label: 'อนุมัติแล้ว', icon: '✅' };
            case 'rejected': return { bg: '#fee2e2', color: '#b91c1c', label: 'ปฏิเสธ', icon: '❌' };
            default: return { bg: '#fef3c7', color: '#b45309', label: 'รออนุมัติ', icon: '⏳' };
        }
    };

    const getLeaveTypeInfo = (leave) => {
        if (leave.type === 'vacation') return { label: 'ลาพักผ่อน', color: '#4f46e5', bg: '#e0e7ff' };
        if (leave.type === 'sick') return { label: 'ลาป่วย', color: '#e11d48', bg: '#ffe4e6' };
        return { label: 'ลากิจ', color: '#d97706', bg: '#fef3c7' };
    };

    const formatFullDate = (dateStr) => new Date(dateStr).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const totalFiltered = Object.values(groupedLeaves).reduce((acc, month) => {
        return acc + Object.values(month).reduce((acc2, date) => acc2 + date.length, 0);
    }, 0);

    return (
        <div className="dashboard-container">
            <style>{cssStyles}</style>
            <div className="content-wrapper">
                
                {/* Header */}
                <div className="main-header">
                    <div className="header-top">
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                📅 ประวัติการลาของฉัน
                            </h2>
                            <p style={{ color: '#6b7280', marginTop: '5px', fontSize: '14px' }}>
                                ตรวจสอบสถานะและประวัติการลาแยกตามปี
                            </p>
                        </div>
                        <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                            ปี {selectedYear + 543}: {totalFiltered} รายการ
                        </div>
                    </div>

                    {/* Year Selector */}
                    <div className="year-selector">
                        <span style={{ fontSize: '14px', alignSelf:'center', marginRight:'10px', color:'#6b7280', fontWeight:'bold' }}>เลือกปี:</span>
                        {availableYears.map(year => (
                            <button 
                                key={year}
                                className={`year-btn ${selectedYear === year ? 'active' : ''}`}
                                onClick={() => setSelectedYear(year)}
                            >
                                {year + 543}
                            </button>
                        ))}
                    </div>

                    {/* Filter Tabs */}
                    <div className="filter-group">
                        <button className={`filter-btn all ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>ทั้งหมด</button>
                        <button className={`filter-btn sick ${filterType === 'sick' ? 'active' : ''}`} onClick={() => setFilterType('sick')}> ลาป่วย</button>
                        <button className={`filter-btn personal ${filterType === 'personal' ? 'active' : ''}`} onClick={() => setFilterType('personal')}> ลากิจ</button>
                        <button className={`filter-btn vacation ${filterType === 'vacation' ? 'active' : ''}`} onClick={() => setFilterType('vacation')}> ลาพักผ่อน</button>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ fontSize: '20px', color: '#6b7280' }}>⏳ กำลังโหลดข้อมูล...</div>
                    </div>
                ) : totalFiltered === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📭</span>
                        <p style={{ fontSize: '18px', color: '#374151' }}>ไม่พบข้อมูลประวัติการลาในปี {selectedYear + 543}</p>
                    </div>
                ) : (
                    <div>
                        {/* Month Loop */}
                        {Object.keys(groupedLeaves).map((monthKey) => (
                            <div key={monthKey}>
                                
                                <div className={`month-header ${expandedMonths[monthKey] ? 'active' : ''}`} onClick={() => toggleMonth(monthKey)}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                                        🗓️ {monthKey}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {expandedMonths[monthKey] ? '▲ ซ่อน' : '▼ แสดงรายละเอียด'}
                                    </span>
                                </div>

                                {/* Date Loop */}
                                {expandedMonths[monthKey] && (
                                    <div style={{ paddingLeft: '5px' }}>
                                        {Object.keys(groupedLeaves[monthKey]).map((dateKey) => (
                                            <div key={dateKey} style={{ marginBottom: 10 }}>
                                                
                                                <div className={`date-header ${expandedDates[dateKey] ? 'active' : ''}`} onClick={() => toggleDate(dateKey)}>
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

                                                {/* Leaves List */}
                                                {expandedDates[dateKey] && (
                                                    <div>
                                                        {groupedLeaves[monthKey][dateKey].map((leave) => {
                                                            const statusInfo = getStatusStyle(leave.status);
                                                            const typeInfo = getLeaveTypeInfo(leave);
                                                            const timeStr = formatTime(leave.createdAt);

                                                            return (
                                                                <div 
                                                                    key={`${leave.type}-${leave.id || leave._id}`}
                                                                    className="leave-card"
                                                                    onClick={() => handleCardClick(leave)}
                                                                >
                                                                    {/* Mobile Time */}
                                                                    <div className="mobile-top-row" style={{ display: 'none' }}> 
                                                                        <div className="time-badge">{timeStr} น.</div>
                                                                    </div>

                                                                    {/* Section 1: Main Info */}
                                                                    <div className="col-main-info">
                                                                        <div className="time-badge show-desktop">{timeStr} น.</div> 
                                                                        <div style={{ flex: 1 }}>
                                                                            <div className="subject-text">
                                                                                {leave.subject || 'ไม่มีหัวข้อ'}
                                                                            </div>
                                                                            
                                                                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                                                                                <span className="tag-type" style={{ color: typeInfo.color, background: typeInfo.bg }}>
                                                                                    {typeInfo.label}
                                                                                </span>
                                                                                <span className="mobile-only-time" style={{ fontSize:'12px', color:'#9ca3af', marginLeft:'auto' }}>
                                                                                    🕒 {timeStr}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Section 2: Details */}
                                                                    <div className="col-details">
                                                                        <div style={{ marginBottom: '4px', fontWeight:'500' }}>
                                                                            📅 {new Date(leave.startDate).toLocaleDateString('th-TH', { day:'numeric', month:'short' })} - {new Date(leave.endDate).toLocaleDateString('th-TH', { day:'numeric', month:'short' })}
                                                                            <span style={{ marginLeft: 5, color: '#6b7280', fontSize: '13px' }}>({leave.durationDays || leave.totalDays} วัน)</span>
                                                                        </div>
                                                                        {/* ✅ sickReason ที่แสดงผลตรงนี้ถูกถอดรหัสแล้ว */}
                                                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                                            📝 {leave.reason || leave.sickReason || leave.personalReason || '-'}
                                                                        </div>
                                                                    </div>

                                                                    {/* Section 3: Status */}
                                                                    <div className="col-status">
                                                                        <div className="status-badge" style={{ 
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