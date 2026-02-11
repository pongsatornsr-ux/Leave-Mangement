import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/api'; 
import CryptoJS from 'crypto-js';

// ⚠️ สำคัญ: ต้องเป็น Key เดียวกับที่ใช้ในหน้า AdminLeaveDetail.jsx เป๊ะๆ
const SECRET_KEY = "secret_signature_key_for_encrypt_2026"; 

// ฟังก์ชันถอดรหัส (พร้อม Debug Log)
const decryptData = (cipherText) => {
    if (!cipherText) return "";

    // 1. ถ้าข้อมูลเป็นรูป (ลายเซ็น) อยู่แล้ว (ไม่ได้เข้ารหัส) ให้คืนค่าเดิม
    if (cipherText.startsWith("data:image")) return cipherText;

    try {
        // 2. พยายามถอดรหัส
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // ถ้าถอดได้แล้วเป็นค่าว่าง (อาจจะเพราะ Key ผิด หรือข้อมูลไม่ใช่ Encrypted string) ให้คืนค่าเดิม
        return originalText || cipherText; 
    } catch (error) {
        // console.error("Decryption error:", error);
        return cipherText; // คืนค่าเดิมถ้าเกิด Error
    }
};
const initialLeaveData = {
    writtenAt: 'กองบริการเทคโนโลยีสารสนเทศและการสื่อสาร', date: '', subject: '', to: 'อธิการบดี มหาวิทยาลัยนเรศวร', 
    employeeName: '', position: '', department: '',
    sickReason: '', personalReason: '', startDate: '', endDate: '', durationDays: 0,
    lastLeaveType: { sick: false, personal: false, maternity: false },
    lastStartDate: '', lastEndDate: '', lastDurationDays: '', contact: '', approveDate: '',
    rejectReason: '', checkerName: '', checkerPosition: '', checkerDate: '', signature: '', signName: '',
    managerSignature: '', status: 'pending', checkerVerified: false, managerDecision: '', managerPosition: '', managerName: '', checkerSignature: '',
    leaveType: { sick: false, personal: false, maternity: false },
    stats: {
        sick: { taken: 0, current: 0, total: 0 },
        personal: { taken: 0, current: 0, total: 0 },
        vacation: { taken: 0, current: 0, total: 0 }
    }
};

const SignatureCanvas = ({ signatureData }) => {
    return (
        <div className="sig-canvas-box" style={{borderBottom: 'none', width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
            {signatureData ? (
                <img src={signatureData} alt="Sig" style={{ maxHeight: '40px', objectFit: 'contain', margin: '0' }} />
            ) : (
                <div style={{width: '100%', height: '40px'}}></div>
            )}
        </div>
    );
};

export default function LeaveDetail() {
    const [formData, setFormData] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchLeaveDetail = async () => {
            try {
                const res = await API.get(`/personalleaves/detail/${id}`);
                const apiData = Array.isArray(res.data) ? res.data[0] : res.data; 

                const mappedData = {
                  ...initialLeaveData, 
                    writtenAt: apiData.writtenAt || '',
                    date: apiData.date || '',
                    subject: apiData.subject || '',
                    to: apiData.to || '',
                    employeeName: apiData.name || '',
                    position: apiData.position || '',
                    department: apiData.department || '',
                    sickReason: (apiData.type === 'sick' && apiData.sickReason) ? decryptData(apiData.sickReason) : apiData.sickReason || '',
                    personalReason: apiData.personalReason || '',
                    startDate: apiData.startDate || '',
                    endDate: apiData.endDate || '',
                    durationDays: apiData.totalDays || 0,
                    lastLeaveType: apiData.lastLeaveType ? { [apiData.lastLeaveType]: true } : initialLeaveData.lastLeaveType,
                    lastStartDate: apiData.lastStartDate || '',
                    lastEndDate: apiData.lastEndDate || '',
                    lastDurationDays: apiData.lastTotalDays || '',
                    contact: apiData.contact || '',
                    approveDate: apiData.approveDate || '',
                    rejectReason: apiData.rejectReason || '',
                    checkerName: apiData.checkerName || '',
                    checkerPosition: apiData.checkerPosition || '',
                    checkerDate: apiData.checkerDate || '',
                    signature: decryptData(apiData.signature || ''),
                    managerSignature: apiData.managerSignature || '',
                    status: apiData.status || 'pending',
                    signName: apiData.signName|| '',
                    checkerVerified: apiData.checkerVerified || false,
                    managerPosition: apiData.managerPosition || '',
                    managerName: apiData.managerName || '',
                    checkerSignature: decryptData(apiData.checkerSignature || ''),
                    leaveType: {
                        sick: apiData.type === 'sick',
                        personal: apiData.type === 'personal',
                        maternity: apiData.type === 'maternity'
                    },
                    stats: {
                        sick: { 
                            taken: Number(apiData.stat_sick_used) || 0, 
                            current: Number(apiData.stat_sick_current) || 0, 
                            total: Number(apiData.stat_sick_total) || 0 
                        },
                        personal: { 
                            taken: Number(apiData.stat_personal_used) || 0, 
                            current: Number(apiData.stat_personal_current) || 0, 
                            total: Number(apiData.stat_personal_total) || 0 
                        },
                        
                    },
                    managerDecision: apiData.status === 'approved' ? 'approve' : (apiData.status === 'rejected' ? 'reject' : ''),
                };
                setFormData(mappedData);
            } catch (err) { console.error(err); }
        };
        fetchLeaveDetail();
    }, [id]);

    const formatDateThai = (dateString) => {
        if(!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const months = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];
        return `${date.getDate()}   ${months[date.getMonth()]}   พ.ศ.   ${date.getFullYear() + 543}`;
    };

    if (!formData) return <div style={{ padding: 80, textAlign: 'center', fontFamily: 'Sarabun' }}>กำลังโหลด...</div>;
    const isDisabled = true;

    return (
        <>
        <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

            /* ================================
               Global & Desktop Styles
            ================================ */
            body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Sarabun', sans-serif; }
            
            .LeaveDetailWrapper {
                display: flex; justify-content: center; padding: 40px 0;
            }

            .LeaveDetailA4 {
                width: 210mm;
                min-height: 297mm;
                padding: 20mm 20mm; /* ลด Padding บนล่างลงเล็กน้อย */
                background-color: #fff;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                box-sizing: border-box;
                font-size: 14px;
                line-height: 1.6; /* ลด line-height ให้บรรทัดชิดกัน */
                color: #000;
                position: relative;
            }

            .title { text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 10px; } /* ลด margin title */
            .subtitle { font-size: 16px; font-weight: 600; margin: 5px 0 5px 0; text-decoration: underline; }
            
            /* ลดระยะห่าง Section */
            .section { margin-bottom: 2px; width: 100%; border: none !important; }
            .section-header { display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 5px; border: none !important; }
            
            /* ลดระยะห่างระหว่างบรรทัด */
            .row { 
                display: flex; 
                align-items: baseline; 
                flex-wrap: wrap; 
                margin-bottom: 4px; /* ปรับให้ชิดขึ้น (เดิม 8px) */
                width: 100%; 
            }
            .row span, .row div { margin-right: 5px; white-space: nowrap; }

            .line {
                border: none;
                border-bottom: 1px dotted #000; 
                background: transparent;
                padding: 0 2px; /* ลด padding */
                margin: 0 5px;
                font-family: inherit;
                font-size: 14px;
                color: #000;
                text-align: center;
                outline: none;
                height: 20px; /* บังคับความสูง */
            }
            .line:disabled { color: #000; opacity: 1; -webkit-text-fill-color: #000; background: transparent; }

            .table { width: 50%; border-collapse: collapse; margin: 5px 0 10px 0; font-size: 14px; } /* ลด margin table */
            .table th, .table td { border: 1px solid #000; padding: 4px; text-align: center; }
            .table th { background-color: #f0f0f0; }
            .table-input { width: 100%; border: none; background: transparent; text-align: center; }

            .check-box { display: flex; align-items: center; margin-right: 15px; }
            .box-square { 
                width: 16px; height: 16px; 
                display: inline-flex; align-items: center; justify-content: center;
                border: 1px solid #000; 
                margin-right: 8px; 
                font-size: 12px;
                line-height: 1;
            }

            .signature-wrapper {
                display: flex; 
                justify-content: space-between; 
                margin-top: 20px; /* ดึงส่วนลายเซ็นขึ้นมา */
                position: relative;
            }
            .sign-block { text-align: center; display: flex; flex-direction: column; align-items: center; min-width: 200px; }
            
            .sign-block-right {
                margin-top: -140px; /* ปรับให้พอดีกับความสูงใหม่ */
            }

            .print-button-wrapper { width: 100%; display: flex; justify-content: center; margin-bottom: 40px; }
            .print-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
            .print-btn:hover { background: #0056b3; }

            /* ================================
               MOBILE RESPONISVE
            ================================ */
            @media screen and (max-width: 768px) {
                .LeaveDetailWrapper { padding: 0; background: #fff; }
                .LeaveDetailA4 {
                    width: 100%;
                    min-height: auto;
                    padding: 15px;
                    box-shadow: none;
                }
                
                .title { font-size: 20px; margin-bottom: 15px; }

                .row {
                    flex-direction: column;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                
                .section-header { align-items: flex-start; }
                
                .line {
                    width: 100% !important;
                    text-align: left !important;
                    box-sizing: border-box;
                    margin-left: 0;
                    height: auto;
                }
                
                .check-box { margin-bottom: 5px; width: 100%; }
                .table { width: 100% !important; }
                
                .signature-wrapper {
                    flex-direction: column;
                    gap: 30px;
                    margin-top: 20px;
                }
                
                .sign-block-right {
                    margin-top: 0 !important;
                }
                
                .row span { white-space: normal; }
            }

            /* ================================
               ⭐⭐ PRINT MODE (FIXED) ⭐⭐
            ================================ */
            @media print {
                @page { 
                    size: A4; 
                    margin: 0; 
                }
                
                body * {
                    visibility: hidden;
                }

                .LeaveDetailWrapper, .LeaveDetailWrapper * {
                    visibility: visible;
                }

                .LeaveDetailWrapper {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: white; 
                }

                .LeaveDetailA4 {
                    width: 210mm !important;
                    height: auto !important; 
                    padding: 15mm 20mm !important; /* จัดขอบตอนปริ้นท์ */
                    margin: 0 auto !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                
                .print-button-wrapper { display: none !important; }
                
           
            }
        `}} />
        
        <div className="LeaveDetailWrapper">
            <div className="LeaveDetailA4">
                <h2 className="title">แบบใบลาป่วย / ลากิจส่วนตัว</h2>
                    
                {/* Header (ชิดขึ้น) */}
                <div className="section-header">
                    <div className="row" style={{justifyContent: 'flex-end'}}>
                        <span>เขียนที่</span>
                        <input className="line" style={{width: '250px', textAlign: 'left'}} value={formData.writtenAt} disabled={isDisabled} />
                    </div>
                    <div className="row" style={{justifyContent: 'flex-end', marginBottom: '0'}}>
                        <span>วันที่</span> 
                        <span className="line" style={{display: 'inline-block', width: '200px', textAlign:'center'}}>{formatDateThai(formData.date)}</span>
                    </div>
                </div>

                {/* Subject / To */}
                <div className="section">
                    <div className="row">
                        <span>เรื่อง</span>
                        <input className="line" style={{width: '200px', textAlign: 'left'}} value={formData.subject} disabled={isDisabled} />
                    </div>
                    <div className="row">
                        <span>เรียน</span>
                        <input className="line" style={{width: '300px', textAlign: 'left'}} value={formData.to} disabled={isDisabled} />
                    </div>
                </div>

                {/* Body */}
                <div className="section">
                    <div className="row">
                        <span>ข้าพเจ้า</span> <input className="line" style={{width: '240px', textAlign: 'center'}} value={formData.employeeName} disabled={isDisabled} />
                        <span>ตำแหน่ง</span> <input className="line" style={{width: '240px', textAlign: 'center'}} value={formData.position} disabled={isDisabled} />
                    </div>
                    <div className="row">
                        <span>สังกัด</span> <input className="line" style={{width: '350px', textAlign: 'center'}} value={formData.department} disabled={isDisabled} />
                    </div>

                    <div className="row" style={{marginTop: '5px'}}>
                        <div className="check-box">
                            <span className="box-square">{formData.leaveType.sick ? '✓' : ''}</span> 
                            <span>ป่วย เนื่องจาก</span>
                        </div>
                        <input className="line" style={{flex: 1, minWidth:'200px', textAlign: 'left'}} value={formData.sickReason} disabled={isDisabled} />
                    </div>
                    <div className="row">
                        <div className="check-box">
                            <span className="box-square">{formData.leaveType.personal ? '✓' : ''}</span> 
                            <span>กิจส่วนตัว เนื่องจาก</span>
                        </div>
                        <input className="line" style={{flex: 1, minWidth:'200px', textAlign: 'left'}} value={formData.personalReason} disabled={isDisabled} />
                    </div>

                    <div className="row" style={{justifyContent: 'center', marginTop: '5px'}}>
                        <span>ตั้งแต่วันที่</span> <input className="line" style={{width: '180px', textAlign: 'center'}} value={formatDateThai(formData.startDate)} disabled={isDisabled} />
                        <span>ถึงวันที่</span> <input className="line" style={{width: '180px', textAlign: 'center'}} value={formatDateThai(formData.endDate)} disabled={isDisabled} />
                    </div>
                    <div className="row">
                        <span>มีกำหนด</span> <input className="line" style={{width: '50px', textAlign: 'center'}} value={formData.durationDays} disabled={isDisabled} /> <span>วัน</span>
                    </div>

                    <div className="row" style={{marginTop: '5px'}}>
                        <span>ข้าพเจ้าได้ลา</span>
                        <div className="check-box" style={{marginLeft:'10px'}}>
                            <span className="box-square">{formData.lastLeaveType.sick ? '✓' : ''}</span> <span>ป่วย</span>
                        </div>
                        <div className="check-box">
                            <span className="box-square">{formData.lastLeaveType.personal ? '✓' : ''}</span> <span>กิจส่วนตัว</span>
                        </div>
                    </div>
                    <div className="row">
                        <span>ครั้งสุดท้ายตั้งแต่วันที่</span> 
                        <input className="line" style={{width: '190px', textAlign: 'center'}} value={formData.lastStartDate ? formatDateThai(formData.lastStartDate) : "-"} disabled={isDisabled} />
                        <span>ถึงวันที่</span> 
                        <input className="line" style={{width: '190px', textAlign: 'center'}} value={formData.lastEndDate ? formatDateThai(formData.lastEndDate) : "-"} disabled={isDisabled} />
                    </div>
                    <div className="row">
                        <span>มีกำหนด</span> 
                        <input className="line" style={{width: '50px', textAlign: 'center'}} value={formData.lastDurationDays || "-"} disabled={isDisabled} /> 
                        <span>วัน</span>
                    </div>
                    <div className="row">
                        <span>ในระหว่างลาจะติดต่อข้าพเจ้าได้ที่</span>
                        <input className="line" style={{flex: 1, minWidth: '200px', textAlign: 'left'}} value={formData.contact} disabled={isDisabled} />
                    </div>
                </div>

                {/* Stats Table (ขยับขึ้นชิด Contact) */}
                <div className="section" style={{marginTop: '5px'}}>
                    <div className="subtitle">สถิติการลาในปีงบประมาณนี้</div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{width: '30%'}}>ประเภทการลา</th>
                                <th style={{width: '25%'}}>ลามาแล้ว</th>
                                <th style={{width: '25%'}}>ลาครั้งนี้</th>
                                <th style={{width: '25%'}}>รวมเป็น</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ป่วย</td>
                                <td><input type="number" value={formData.stats.sick.taken} disabled={isDisabled} className="table-input"/></td>
                                <td><input type="number" value={formData.stats.sick.current} disabled={isDisabled} className="table-input"/></td>
                                <td><input type="number" value={formData.stats.sick.total} disabled={isDisabled} className="table-input"/></td>
                            </tr>
                            <tr>
                                <td>กิจส่วนตัว</td>
                                <td><input type="number" value={formData.stats.personal.taken} disabled={isDisabled} className="table-input"/></td>
                                <td><input type="number" value={formData.stats.personal.current} disabled={isDisabled} className="table-input"/></td>
                                <td><input type="number" value={formData.stats.personal.total} disabled={isDisabled} className="table-input"/></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Signatures Section (ขยับขึ้น) */}
                <div className="signature-wrapper">
                    {/* Checker Sign (ซ้าย) */}
                    <div className="sign-block">
                        <div style={{display:'flex', alignItems:'flex-end', justifyContent: 'center'}}>
                            (ลงชื่อ) 
                            <div style={{borderBottom:'1px dotted #000', margin:'0 5px', width: '150px'}}>
                                <SignatureCanvas signatureData={formData.checkerSignature} />
                            </div>
                            ผู้ตรวจสอบ
                        </div>
                        <div className="mt-2 text-center">
                            ( <input type="text" className="line" style={{width:'220px', flexGrow:0}} value={formData.checkerName} disabled /> )
                        </div>
                        <div style={{textAlign: 'center', marginTop: '5px'}}>
                            ตำแหน่ง <input className="line" style={{width: '200px',textAlign: 'center'}} value={formData.checkerPosition} disabled={isDisabled} />
                        </div>
                        <div style={{textAlign: 'center', marginTop: '5px'}}>
                            วันที่ <input className="line" style={{width: '180px',textAlign: 'center'}} value={formData.checkerDate ? formatDateThai(formData.checkerDate) : ''} disabled={isDisabled} />
                        </div>
                    </div>

                    {/* Applicant Sign (ขวา) */}
                    <div className="sign-block sign-block-right">
                        <div style={{marginBottom: '10px'}}>ขอแสดงความนับถือ</div>
                        <div style={{display:'flex', alignItems:'flex-end', justifyContent: 'center'}}>
                            (ลงชื่อ)
                            <div style={{borderBottom:'1px dotted #000', margin:'0 5px', width: '150px'}}> 
                                <SignatureCanvas signatureData={formData.signature} />
                            </div>
                        </div>
                        <div style={{textAlign: 'center', marginTop: '5px'}}>
                            (<span className="line" style={{display: 'inline-block', width: '200px', borderBottom: 'none'}}>{formData.signName}</span>)
                        </div>
                        <div style={{textAlign: 'center', marginTop: '5px'}}>
                            วันที่ <span className="line" style={{display: 'inline-block', width: '200px', borderBottom: 'none'}}>{formatDateThai(formData.date)}</span>
                        </div>
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