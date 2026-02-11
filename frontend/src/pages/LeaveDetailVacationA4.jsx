import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/api'; 
import CryptoJS from 'crypto-js';

// ⚠️ สำคัญ: ต้องเป็น Key เดียวกับที่ใช้ในหน้า AdminLeaveDetail.jsx เป๊ะๆ
const SECRET_KEY = "secret_signature_key_for_encrypt_2026"; 

// ฟังก์ชันถอดรหัส (พร้อม Debug Log)
const decryptData = (cipherText, fieldName) => {
    if (!cipherText) return "";

    // 1. ถ้าข้อมูลเป็นรูปอยู่แล้ว (ไม่ได้เข้ารหัส) ให้คืนค่าเดิม
    if (cipherText.startsWith("data:image")) {
        // console.log(`${fieldName}: ข้อมูลเป็นรูปภาพอยู่แล้ว (ไม่ได้เข้ารหัส)`);
        return cipherText;
    }

    try {
        // 2. พยายามถอดรหัส
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        if (originalText && originalText.startsWith("data:image")) {
            // console.log(`${fieldName}: ถอดรหัสสำเร็จ!`);
            return originalText;
        } else {
            // ถอดได้แต่ไม่ใช่รูป หรือถอดไม่ได้ (Key ผิด)
            console.warn(`${fieldName}: ถอดรหัสไม่สำเร็จ หรือ Key ไม่ถูกต้อง (Data: ${cipherText.substring(0, 20)}...)`);
            // ลองคืนค่าเดิมเผื่อว่าเป็นข้อมูลเก่าที่ไม่ได้เข้ารหัสและไม่มี prefix
            return cipherText.startsWith("data:image") ? cipherText : ""; 
        }
    } catch (error) {
        console.error(`${fieldName}: เกิดข้อผิดพลาดในการถอดรหัส`, error);
        return "";
    }
}; 
const initialVacationData = {
  writtenAt: '', date: '', subject: 'ขอลาพักผ่อน', to: '', employeeName: '', position: '', department: '',
  startDate: '', endDate: '', durationDays: 0,
  vacationAccumulated: 0,
  vacationThisYear: 0,
  vacationTotal: 0,
  stats: {
    vacation: {
      statsPreviousDays: 0,
      statsCurrentDays: 0,
      statsTotalDays: 0
    }
  },
  contact: '', approveDate: '', rejectReason: '',
  checkerName: '', checkerPosition: '', checkerDate: '',
  signature: '', managerSignature: '', status: 'pending',
  checkerVerified: false, managerDecision: '', managerPosition: '', managerName: '', checkerSignature: '',
  signName: ''
};

export default function LeaveDetailVacation() {
  const [vacationData, setVacationData] = useState(null);
  const { id } = useParams();

  // Helper: Convert Date String to Thai Format
  const formatDateThai = (dateString) => {
    if(!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return `${date.getDate()}  ${months[date.getMonth()]}  พ.ศ.  ${date.getFullYear() + 543}`;
  };

  useEffect(() => {
    const fetchLeaveDetail = async () => {
      try {
        const res = await API.get(`/vacationleaves/detail/${id}`);
        const data = res.data;
        const apiData = Array.isArray(data) ? data[0] : data;

        const mappedData = {
          ...initialVacationData,
          writtenAt: apiData.writtenAt || '',
          date: apiData.date || '',
          subject: apiData.subject || 'ขอลาพักผ่อน',
          to: apiData.to || '',
          employeeName: apiData.name || '',
          position: apiData.position || '',
          department: apiData.department || '',
          startDate: apiData.startDate || '',
          endDate: apiData.endDate || '',
          durationDays: apiData.durationDays || 0,
          vacationAccumulated: Number(apiData.vacationAccumulated) || 0,
          vacationThisYear: Number(apiData.vacationThisYear) || 0,
          vacationTotal: Number(apiData.vacationTotal) || 0,
          contact: apiData.contact || '',
          approveDate: apiData.approveDate || '',
          rejectReason: apiData.rejectReason || '',
          checkerName: apiData.checkerName || '',
          checkerPosition: apiData.checkerPosition || '',
          checkerDate: apiData.checkerDate || '',
          signature: decryptData(apiData.signature || ''),
          signName: apiData.signName || '',
          managerSignature: apiData.managerSignature || '',
          managerDecision: apiData.managerDecision || '',
          managerPosition: apiData.managerPosition || '',
          managerName: apiData.managerName || '',
          status: apiData.status || 'pending',
          checkerVerified: apiData.checkerVerified || false,
          checkerSignature: decryptData(apiData.checkerSignature || ''),
          stats: {
            vacation: {
              statsPreviousDays: Number(apiData.statsPreviousDays) || 0,
              statsCurrentDays: Number(apiData.statsCurrentDays) || 0,
              statsTotalDays: Number(apiData.statsTotalDays) || 0
            }
          }
        };

        setVacationData(mappedData);
      } catch (err) {
        console.error("Error fetching vacation leave detail:", err);
      }
    };

    fetchLeaveDetail();
  }, [id]);

  if (!vacationData) return <div style={{ padding: 80, textAlign: 'center', fontFamily: 'Sarabun' }}>⏳ กำลังโหลดรายละเอียดใบลาพักผ่อน...</div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

    /* ================================
       Global & Reset
    ================================ */
    body { margin: 0; padding: 0; background-color: #dcdcdc; font-family: 'Sarabun', sans-serif; }
    
    /* Container หลัก สำหรับจัดกึ่งกลาง */
    .LeaveDetailVacationA4 { 
        background: #dcdcdc; 
        padding: 20px; 
        display: flex; 
        justify-content: center; 
        min-height: 100vh; 
    }

    /* กระดาษ A4 */
    .paper-a4 {
        background: #fff; 
        width: 210mm; /* A4 Width */
        min-height: 297mm; /* A4 Height */
        height: auto;
        padding: 20mm 25mm 20mm 30mm; 
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        box-sizing: border-box; 
        font-size: 11pt; 
        line-height: 1.6; 
        color: #1a1b1bff; 
        position: relative;
    }

    /* ================================
       Typography & Utils
    ================================ */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-bold { font-weight: bold; }
    .mb-2 { margin-bottom: 8px; }
    .mb-4 { margin-bottom: 16px; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }

    /* Flex Row ที่ Wrap ได้เมื่อจอเล็ก */
    .form-row { 
        display: flex; 
        align-items: baseline; 
        flex-wrap: wrap; /* สำคัญสำหรับ responsive */
    }
    
    .indent { text-indent: 0; } 
    /* ใช้ padding-left แทน text-indent สำหรับ flex item */
    .form-row.indent > span:first-child {
        margin-left: 2em;
    }

    /* ================================
       Inputs (Styled as lines)
    ================================ */
    .input-dotted {
        border: none; 
        border-bottom: 1px dotted #000; 
        font-family: 'Sarabun', sans-serif;
        font-size: 11pt; 
        color: #000; 
        outline: none; 
        padding: 0 5px; 
        background: transparent;
        text-align: center; 
        flex-grow: 1; /* ให้ยืดเต็มที่ */
        min-width: 50px;
    }
    .input-dotted:disabled { color: #000; background: transparent; opacity: 1; }
    
    /* Class สำหรับความกว้าง input แบบ fix (เฉพาะ desktop) */
    .input-dotted.short { width: 40px; flex-grow: 0; }
    .input-dotted.medium { width: 120px; flex-grow: 0; }
    .input-dotted.long { width: 250px; flex-grow: 0; }

    /* ================================
       Layout Sections
    ================================ */
    .writing-at-section { 
        display: flex; 
        flex-direction: column; 
        align-items: flex-end; 
        margin-bottom: 20px; 
    }
    .writing-row { 
        display: flex; 
        align-items: baseline; 
        width: 50%; 
        justify-content: flex-start; 
    }
    .writing-label { white-space: nowrap; margin-right: 5px; }

    .bottom-container { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start; 
        margin-top: 20px; 
    }
    .stats-section { width: 55%; }
    .signature-section { width: 40%; text-align: center; display: flex; flex-direction: column; align-items: center; }

    /* Table */
    .stats-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
    .stats-table th, .stats-table td { border: 1px solid #000; padding: 5px; text-align: center; font-size: 10pt; }
    .stats-table th { background-color: #f0f0f0; }

    /* Approval Sections */
    .approval-block {
        margin-top: 20px; padding-top: 10px; border-top: 1px solid #000;
        display: flex; flex-direction: column; width: 100%;
    }
    .approval-row { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start; 
        width: 100%; 
        margin-top: 20px; 
    }

    .sig-image { height: 40px; object-fit: contain; }
    
    .print-button-wrapper {
        width: 100%; display: flex; justify-content: center; margin-bottom: 20px;
    }
    .print-btn {
        background: #007bff; color: white; border: none; padding: 10px 20px;
        border-radius: 6px; cursor: pointer; font-size: 16px; margin-bottom: 15px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .print-btn:hover { background: #0056b3; }

    /* ================================
       RESPONSIVE (MOBILE)
    ================================ */
    @media screen and (max-width: 768px) {
        .LeaveDetailVacationA4 {
            padding: 0;
            background: #fff;
        }
        .paper-a4 {
            width: 100%;
            min-height: auto;
            padding: 15px;
            box-shadow: none;
        }
        
        /* ปรับ Input ให้ยืดเต็มจอ หรือปรับขนาดให้เหมาะสม */
        .input-dotted { width: auto; flex-grow: 1; }
        .input-dotted.short { width: 50px; flex-grow: 0; }
        .input-dotted.medium { width: auto; flex-grow: 1; min-width: 100px; }

        /* ปรับส่วน "เขียนที่ / วันที่" */
        .writing-at-section { align-items: flex-end; width: 100%; }
        .writing-row { width: 100%; justify-content: flex-end; }

        /* ปรับส่วน "เรื่อง / เรียน" ให้เต็มบรรทัด */
        .subject-section .form-row { width: 100%; }
        
        /* ปรับ Indent */
        .form-row.indent > span:first-child { margin-left: 0; } /* ยกเลิกย่อหน้าบนมือถือเพื่อให้พื้นที่เยอะขึ้น หรือจะคงไว้ก็ได้ */

        /* ปรับส่วนล่าง (ตารางสถิติ และ ลายเซ็น) ให้เรียงเป็นแนวตั้ง */
        .bottom-container {
            flex-direction: column;
        }
        .stats-section {
            width: 100%;
            margin-bottom: 30px;
        }
        .signature-section {
            width: 100%;
        }

        /* ปรับตาราง */
        .stats-table th, .stats-table td { font-size: 12px; padding: 4px; }

        /* ปรับส่วนอนุมัติ (Checker/Manager) */
        .approval-row {
            flex-direction: column;
            align-items: center;
        }
    }

    /* ================================
       Print Mode (บังคับ Layout เดิม)
    ================================ */
    @media print {
        @page { size: A4; margin: 12mm; }
        
        /* Reset ค่า Responsive กลับไปเป็น A4 */
        .LeaveDetailVacationA4 { background: #fff !important; padding: 0 !important; width: 100% !important; }
        .paper-a4 {
            width: 100% !important; max-width: none !important;
            padding: 0 !important; margin: 0 !important;
            box-shadow: none !important; border: none !important;
        }
        
        /* ซ่อน UI */
        .sidebar, .mobile-header, .hamburger-btn, .close-sidebar-btn, .backdrop, .print-button-wrapper, button, nav {
            display: none !important;
        }

        /* บังคับ Flexbox ให้เหมือน Desktop */
        .bottom-container { flex-direction: row !important; }
        .stats-section { width: 55% !important; }
        .signature-section { width: 40% !important; }
        .approval-row { flex-direction: row !important; }
        
        /* บังคับ Input ให้ดูดีเหมือนเดิม */
        .input-dotted.short { width: 40px !important; }
        
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    `}} />

      <div className="LeaveDetailVacationA4">
        <div className="paper-a4">
            
            {/* Header */}
            <h2 className="text-center text-bold" style={{ marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>
                แบบใบลาพักผ่อน
            </h2>

            {/* Written At & Date */}
            <div className="writing-at-section">
                <div className="writing-row">
                    <span className="writing-label">เขียนที่</span>
                    <input type="text" className="input-dotted"style={{ minWidth: '300px' }} value={vacationData.writtenAt} disabled />
                </div>
                <div className="writing-row" style={{marginTop:'5px'}}>
                    <span className="writing-label">วันที่</span>
                    <span className="input-dotted" style={{display: 'inline-block', flexGrow: 1, textAlign:'center', borderBottom: '1px dotted #000'}}>
                        {formatDateThai(vacationData.date)}
                    </span>
                </div>
            </div>

            {/* Subject / To */}
            <div className="subject-section">
                <div className="form-row mb-2">
                    <span className="writing-label text-bold">เรื่อง</span>
                    <span style={{ marginRight: '10px' }}>{vacationData.subject}</span>
                </div>
                <div className="form-row mb-2">
                    <span className="writing-label text-bold">เรียน</span>
                    <input type="text" className="input-dotted" style={{textAlign: 'left'}} value={vacationData.to} disabled />
                </div>
            </div>

            {/* Body Paragraph 1 */}
            <div className="form-row indent mb-2">
                <span className="writing-label">ข้าพเจ้า</span>
                <input type="text" className="input-dotted" style={{ minWidth: '150px' }} value={vacationData.employeeName} disabled />
                <span className="writing-label" style={{ marginLeft: '10px' }}>ตำแหน่ง</span>
                <input type="text" className="input-dotted" style={{ minWidth: '100px' }} value={vacationData.position} disabled />
            </div>
            <div className="form-row mb-2">
                <span className="writing-label">สังกัด</span>
                <input type="text" className="input-dotted" style={{textAlign: 'left'}} value={vacationData.department} disabled />
            </div>

            {/* Body Paragraph 2 */}
            <div className="form-row indent mb-2">
                <span>มีวันลาพักผ่อนสะสม</span>
                <input type="text" className="input-dotted short" value={vacationData.vacationAccumulated} disabled />
                <span>วันทำการ มีสิทธิลาพักผ่อนประจำปีนี้อีก</span>
                <input type="text" className="input-dotted short" value={vacationData.vacationThisYear} disabled />
                <span>วันทำการ</span>
            </div>
            <div className="form-row mb-2">
                <span>รวมเป็น</span>
                <input type="text" className="input-dotted short" value={vacationData.vacationTotal} disabled />
                <span>วันทำการ</span>
            </div>
            
            {/* Date Range - ปรับให้ Wrap ได้สวยงาม */}
            <div className="form-row mb-2">
                <span>ขอลาพักผ่อนตั้งแต่วันที่</span>
                <input type="text" className="input-dotted medium"style={{width: '190px', flexGrow:0}} value={formatDateThai(vacationData.startDate)} disabled />
                <span>ถึงวันที่</span>
                <input type="text" className="input-dotted medium"style={{width: '190px', flexGrow:0}} value={formatDateThai(vacationData.endDate)} disabled />
            </div>
            <div className="form-row mb-2">
                <span>มีกำหนด</span>
                <input type="text" className="input-dotted short" value={vacationData.durationDays} disabled />
                <span>วัน</span>
            </div>

            {/* Contact Info */}
            <div className="form-row indent mb-4">
                <span style={{whiteSpace:'nowrap'}}>ในระหว่างลาจะติดต่อข้าพเจ้าได้ที่</span>
                <input type="text" className="input-dotted" value={vacationData.contact} disabled />
            </div>

            {/* Bottom Section: Stats Left, Signature Right */}
            <div className="bottom-container">
                {/* Left: Stats */}
                <div className="stats-section">
                    <div style={{fontWeight:'bold', marginBottom:'5px'}}>สถิติการลาในปีงบประมาณนี้</div>
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>ลามาแล้ว<br/>(วันทำการ)</th>
                                <th>ลาครั้งนี้<br/>(วันทำการ)</th>
                                <th>รวมเป็น<br/>(วันทำการ)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{vacationData.stats.vacation.statsPreviousDays}</td>
                                <td>{vacationData.stats.vacation.statsCurrentDays}</td>
                                <td>{vacationData.stats.vacation.statsTotalDays}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Right: Signature */}
                <div className="signature-section">
                    <div style={{ marginBottom: '15px', marginTop: '10px' }}>ขอแสดงความนับถือ</div>
                    
                    {/* Sign Image */}
                    <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                         {vacationData.signature ? (
                             <img src={vacationData.signature} alt="signature" className="sig-image" />
                         ) : <span style={{fontSize:'12pt', color:'#ddd'}}>(ไม่มีลายเซ็น)</span>}
                    </div>

                    <div style={{ width: '100%', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                        <span style={{ marginRight: '5px' }}>(ลงชื่อ)</span>
                        <div style={{ borderBottom: '1px dotted #000', width: '180px' }}>&nbsp;</div>
                    </div>
                    
                    <div style={{ width: '100%', marginTop: '5px', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                        <span style={{ marginRight: '5px' }}>(</span>
                        <input type="text" className="input-dotted" style={{ flexGrow: 0, width: '180px' }} value={vacationData.signName} disabled />
                        <span style={{ marginLeft: '5px' }}>)</span>
                    </div>
                    <div style={{marginTop: '5px'}}>ตำแหน่ง {vacationData.position}</div>
                </div>
            </div>

            {/* Approval Section: Checker & Manager */}
            <div className="approval-block">
                <div className="approval-row">
                     {/* Column 1: Checker (ผู้ตรวจสอบ) */}
                     <div style={{ textAlign: 'center', width: '100%', marginBottom: '20px' }}>
                        <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            {vacationData.checkerSignature ? (
                                <img src={vacationData.checkerSignature} alt="checker sig" className="sig-image" />
                            ) : null}
                        </div>

                        <div style={{ width: '100%', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                            <span style={{ marginRight: '5px' }}>(ลงชื่อ)</span>
                            <div style={{ borderBottom: '1px dotted #000', width: '180px' }}>&nbsp;</div>
                            <span style={{marginLeft:'5px'}}>ผู้ตรวจสอบ</span>
                        </div>
                        
                        <div className="mt-2 text-center">
                            ( <input type="text" className="input-dotted" style={{width:'200px', flexGrow:0}} value={vacationData.checkerName} disabled /> )
                        </div>
                        <div className="form-row" style={{justifyContent: 'center', marginTop:'5px'}}>
                            <span>ตำแหน่ง</span>
                            <input type="text" className="input-dotted" style={{width:'200px', flexGrow:0}} value={vacationData.checkerPosition} disabled />
                        </div>
                        <div className="form-row" style={{justifyContent: 'center', marginTop:'5px'}}>
                            <span>วันที่</span>
                            <input className="input-dotted" style={{width: '150px', flexGrow:0}} value={formatDateThai(vacationData.checkerDate)} disabled />
                        </div>
                    </div>
                    
                    {/* ถ้ามีผู้บริหาร (Manager) สามารถเพิ่ม Column ที่ 2 ตรงนี้ได้เลยในโครงสร้างเดียวกัน */}

                </div>
            </div>
        </div>
      </div>
      
      <div className="print-button-wrapper">
            <button 
                onClick={() => window.print()} 
                className="print-btn"
            >
                🖨️ พิมพ์ใบลา
            </button>
      </div>
    </>
  );
}