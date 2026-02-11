import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; 
import listPlugin from "@fullcalendar/list";
import Select from "react-select"; 
import API from "../api/api";

// ----------------------------------------------------------------------
// --- MODERN CSS STYLES ---
// ----------------------------------------------------------------------
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  
  .fc {
    font-family: 'Sarabun', sans-serif;
    --fc-border-color: #f1f5f9;
    --fc-today-bg-color: #eff6ff;
    --fc-neutral-bg-color: #f8fafc;
  }

  .fc-header-toolbar { margin-bottom: 1.5rem !important; }
  .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 700; color: #1e293b; }
  
  .fc-button {
    background-color: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    color: #475569 !important;
    font-weight: 600 !important;
    text-transform: capitalize;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border-radius: 8px !important;
    padding: 8px 16px !important;
  }
  .fc-button:hover {
    background-color: #f8fafc !important;
    color: #0f172a !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .fc-button-active {
    background-color: #2563eb !important;
    color: #ffffff !important;
    border-color: #2563eb !important;
  }

  /* Grid & Cells */
  .fc-col-header-cell-cushion { padding: 12px 0 !important; color: #64748b; font-weight: 600; text-decoration: none !important; }
  .fc-daygrid-day-number { font-size: 0.9rem; font-weight: 500; color: #64748b; padding: 8px 12px !important; text-decoration: none !important; }

  .fc-event {
    border: none !important;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    margin-bottom: 3px !important;
    padding: 2px 4px !important;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: transform 0.2s;
  }
  .fc-event:hover {
    filter: brightness(0.95);
    transform: scale(1.01);
  }

  .fc-day-sat, .fc-day-sun {
    background-color: #f8fafc !important; 
  }

  .holiday-cell {
    background-color: #fee2e2 !important; 
  }

  .custom-event-content {
    display: flex; align-items: center; gap: 4px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  }
  
  @media (max-width: 768px) {
    .fc-toolbar-title { font-size: 1.25rem !important; }
    .fc-header-toolbar { flex-direction: column; gap: 12px; }
  }
`;

// Custom Styles for React-Select
const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '8px',
      borderColor: '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
      fontFamily: "'Sarabun', sans-serif",
      fontSize: '14px',
      minWidth: '240px',
      padding: '2px',
      '&:hover': { borderColor: '#cbd5e1' }
    }),
    option: (provided, state) => ({
      ...provided,
      fontFamily: "'Sarabun', sans-serif",
      fontSize: '14px',
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer'
    }),
    singleValue: (provided) => ({
        ...provided,
        fontFamily: "'Sarabun', sans-serif",
        color: '#475569',
        fontWeight: 500
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999
    }),
    menuList: (provided) => ({
        ...provided,
        maxHeight: '200px', 
    })
};

export default function AdminCalendar() {
  const [events, setEvents] = useState([]); 
  const [holidays, setHolidays] = useState([]); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [selectedUserOption, setSelectedUserOption] = useState({ value: "all", label: "🔎 ค้นหาพนักงาน" }); 
  const [userOptions, setUserOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const splitEventsByWorkDays = (originalEvent, holidaySet) => {
    const events = [];
    let currentStart = new Date(originalEvent.start);
    const end = new Date(originalEvent.end); 
    let part = 1; 

    while (currentStart < end) {
        const currentDateStr = currentStart.toISOString().split('T')[0];

        if (currentStart.getDay() === 0 || currentStart.getDay() === 6 || holidaySet.has(currentDateStr)) {
            currentStart.setDate(currentStart.getDate() + 1);
            continue;
        }

        let segmentStart = new Date(currentStart);
        let segmentEnd = new Date(currentStart);
        
        while (true) {
            let nextDay = new Date(segmentEnd);
            nextDay.setDate(nextDay.getDate() + 1);
            if (nextDay >= end) break; 
            const nextDayStr = nextDay.toISOString().split('T')[0];
            const isWeekend = nextDay.getDay() === 0 || nextDay.getDay() === 6;
            const isHoliday = holidaySet.has(nextDayStr);
            if (isWeekend || isHoliday) break;
            segmentEnd = nextDay;
        }

        events.push({
            ...originalEvent,
            id: `${originalEvent.id}_part_${part}`, 
            start: segmentStart.toISOString().split('T')[0],
            end: (() => {
                const finalEnd = new Date(segmentEnd);
                finalEnd.setDate(finalEnd.getDate() + 1);
                return finalEnd.toISOString().split('T')[0];
            })()
        });

        part++;
        segmentEnd.setDate(segmentEnd.getDate() + 1);
        currentStart = new Date(segmentEnd);
    }
    return events;
  };

  const fetchData = async () => {
    try {
      const [resPersonal, resVacation, resHolidays] = await Promise.allSettled([
        API.get("/personalleaves/admin"),
        API.get("/vacationleaves/admin"),
        API.get("/holidays") 
      ]);

      let leaveEvents = [];
      let holidayEvents = [];
      const holidaySet = new Set(); 

      if (resHolidays.status === "fulfilled") {
        const data = Array.isArray(resHolidays.value.data) ? resHolidays.value.data : [];
        holidayEvents = data.map(h => {
            const eventDate = h.date || h.Date || h.start; 
            if (eventDate) holidaySet.add(eventDate.split('T')[0]); 

            return {
                id: `holiday-${h.id}`, 
                title: h.name, 
                start: eventDate, 
                allDay: true,
                backgroundColor: 'transparent', 
                textColor: '#b91c1c', 
                borderColor: 'transparent',
                display: 'block', 
                extendedProps: { category: 'holiday', typeName: 'วันหยุด' }
            };
        });
      }

      const extractUserInfo = (lv) => ({
        id: lv.leaveUser?.id || lv.userId || `temp-${lv.name}`,
        name: lv.leaveUser?.name || lv.name || "Unknown"
      });

      // ดึงข้อมูลวันลา พร้อมระบุ totalDays และ leaveTimeSlot
      if (resPersonal.status === "fulfilled") {
        const data = Array.isArray(resPersonal.value.data) ? resPersonal.value.data : [];
        data.forEach((lv) => {
          const userInfo = extractUserInfo(lv);
          const baseEvent = {
            id: `personal-${lv.id}`,
            title: userInfo.name,
            start: lv.startDate || lv.date,
            end: getEndDate(lv.endDate || lv.date),
            backgroundColor: getStatusColor(lv.status).bg,
            textColor: getStatusColor(lv.status).text,
            borderColor: "transparent",
            allDay: true,
            extendedProps: { 
                category: 'personal', 
                originalId: lv.id,
                status: lv.status, 
                typeName: 'กิจ/ป่วย', 
                userId: userInfo.id, 
                userName: userInfo.name,
                totalDays: lv.totalDays || lv.durationDays || '1',
                leaveTimeSlot: lv.leaveTimeSlot || ''
            }
          };
          leaveEvents.push(...splitEventsByWorkDays(baseEvent, holidaySet));
        });
      }

      if (resVacation.status === "fulfilled") {
        const data = Array.isArray(resVacation.value.data) ? resVacation.value.data : [];
        data.forEach((lv) => {
          const userInfo = extractUserInfo(lv);
          const baseEvent = {
            id: `vacation-${lv.id}`,
            title: userInfo.name,
            start: lv.startDate,
            end: getEndDate(lv.endDate),
            backgroundColor: getStatusColor(lv.status).bg,
            textColor: getStatusColor(lv.status).text,
            borderColor: "transparent",
            allDay: true,
            extendedProps: { 
                category: 'vacation', 
                originalId: lv.id,
                status: lv.status, 
                typeName: 'พักผ่อน', 
                userId: userInfo.id, 
                userName: userInfo.name,
                totalDays: lv.totalDays || lv.durationDays || '1',
                leaveTimeSlot: lv.leaveTimeSlot || ''
            }
          };
          leaveEvents.push(...splitEventsByWorkDays(baseEvent, holidaySet));
        });
      }

      setEvents(leaveEvents);
      setHolidays(holidayEvents); 

      const uniqueUsersMap = new Map();
      leaveEvents.forEach(evt => {
        const { userId, userName } = evt.extendedProps;
        if (userId && userName) uniqueUsersMap.set(userId, userName);
      });
      
      const uniqueUsersArray = Array.from(uniqueUsersMap, ([id, name]) => ({ 
          value: id, 
          label: `👤 ${name}`
      }));
      uniqueUsersArray.sort((a, b) => a.label.localeCompare(b.label));
      
      setUserOptions([
          { value: "all", label: "👥 ดูพนักงานทั้งหมด" }, 
          ...uniqueUsersArray
      ]);

    } catch (err) {
      console.error("Calendar Error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return { bg: "#10b981", text: "#ffffff" };
      case "rejected": return { bg: "#ef4444", text: "#ffffff" };
      default: return { bg: "#f59e0b", text: "#ffffff" };
    }
  };

  const getEndDate = (dateStr) => {
    if (!dateStr) return dateStr;
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleEventClick = (clickInfo) => {
    const { category, originalId } = clickInfo.event.extendedProps;
    if (category === 'holiday') return;
    const targetId = originalId || clickInfo.event.id;
    if (category === 'vacation') navigate(`/admin/vacationleaves/${targetId}`);
    else navigate(`/admin/personalleaves/${targetId}`);
  };

  // ✅ แสดงผล เช้า/บ่าย โดยดึงจากข้อมูล extendedProps
  const renderEventContent = (eventInfo) => {
    const { typeName, category, totalDays, leaveTimeSlot } = eventInfo.event.extendedProps;
    const isHoliday = category === 'holiday';
    const isHalfDay = parseFloat(totalDays) === 0.5;

    let timeLabel = "";
    if (isHalfDay) {
        if (leaveTimeSlot === 'morning') timeLabel = "(เช้า)";
        else if (leaveTimeSlot === 'afternoon') timeLabel = "(บ่าย)";
        else timeLabel = "(0.5)";
    }

    return (
      <div className="custom-event-content" style={isHoliday ? { fontWeight: 'bold', justifyContent: 'center' } : {}}>
        {!isHoliday && (
            <span style={{opacity: 0.9, fontSize: '0.75rem', fontWeight: 600}}>
                [{typeName}]
            </span>
        )}
        <span>
            {eventInfo.event.title}
            {/* แสดงป้ายกำกับเวลา (เช้า/บ่าย) ท้ายชื่อ */}
            <span style={{ fontWeight: 'bold', marginLeft: '4px', fontSize: '0.85em', color: '#fff' }}>
                {timeLabel}
            </span>
        </span>
      </div>
    );
  };

  const displayedEvents = useMemo(() => {
    let filteredLeaves = events;
    if (selectedUserOption.value !== "all") {
        filteredLeaves = events.filter(evt => String(evt.extendedProps.userId) === String(selectedUserOption.value));
    }
    return [...filteredLeaves, ...holidays]; 
  }, [events, holidays, selectedUserOption]);

  const holidayDateSet = useMemo(() => {
    return new Set(holidays.map(h => h.start));
  }, [holidays]);

  return (
    <div style={{ padding: isMobile ? 15 : 40, fontFamily: "'Sarabun', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      <style>{styles}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 25, gap: 15 }}>
        <div>
           <h2 style={{ margin: 0, color: '#0f172a', fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 700 }}>
             🗓️ ปฏิทิน HR
           </h2>
           <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '14px' }}>ภาพรวมวันลาและวันหยุดทั้งหมด</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, width: isMobile ? '100%' : 'auto', alignItems: 'center' }}>
            <div style={{ width: isMobile ? '100%' : '260px' }}>
                <Select 
                    options={userOptions}
                    value={selectedUserOption}
                    onChange={setSelectedUserOption}
                    placeholder="ค้นหาชื่อพนักงาน..."
                    isSearchable={true}
                    styles={customSelectStyles}
                />
            </div>

            <div style={{ display: 'flex', gap: 12, padding: '8px 12px', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', justifyContent: 'center', width: isMobile ? '100%' : 'auto' }}>
               <div style={{display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#475569'}}><span style={{width:10, height:10, background:'#fee2e2', borderRadius:'50%'}}></span> วันหยุด</div>
               <div style={{display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#475569'}}><span style={{width:10, height:10, background:'#f59e0b', borderRadius:'50%'}}></span> รออนุมัติ</div>
               <div style={{display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#475569'}}><span style={{width:10, height:10, background:'#10b981', borderRadius:'50%'}}></span> อนุมัติ</div>
            </div>
        </div>
      </div>

      <div style={{ background: "#ffffff", padding: isMobile ? 15 : 30, borderRadius: 20, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)", border: '1px solid #f1f5f9' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView={isMobile ? "listMonth" : "dayGridMonth"}
          key={isMobile ? "mobile" : "desktop"}
          events={displayedEvents} 
          height={isMobile ? "auto" : "78vh"}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: isMobile ? "listMonth" : "dayGridMonth,listMonth"
          }}
          buttonText={{
            today: 'วันนี้',
            month: 'ตารางเดือน',
            list: 'รายการ'
          }}
          locale="th"
          eventClick={handleEventClick}
          dayMaxEvents={2} 
          eventContent={isMobile ? undefined : renderEventContent}
          dayCellClassNames={(arg) => {
            const dateStr = arg.date.toLocaleDateString('en-CA');
            if (holidayDateSet.has(dateStr)) {
                return 'holiday-cell'; 
            }
            return '';
          }}
        />
      </div>
    </div>
  );
}