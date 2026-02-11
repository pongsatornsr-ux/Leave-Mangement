import React, { useState, useEffect, useCallback, useRef } from "react";
import "./PersonalLeave.css"; 
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; 

// ====================================================================
// 2. Config & Keys
// ====================================================================
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

const encryptData = (text) => {
    if (!text) return "";
    try {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        return text;
    }
};

// ====================================================================
// ✅ Helper Functions
// ====================================================================

const calculateWorkingDays = (startDate, endDate, holidayList = []) => {
    if (!startDate || !endDate) return 0;
    let count = 0;
    let curDate = new Date(startDate);
    const stopDate = new Date(endDate);

    curDate.setHours(0, 0, 0, 0);
    stopDate.setHours(0, 0, 0, 0);

    const holidaySet = new Set(holidayList.map(h => {
        const d = new Date(h);
        return d.toLocaleDateString('en-CA'); 
    }));

    while (curDate <= stopDate) {
        const dayOfWeek = curDate.getDay();
        const curDateStr = curDate.toLocaleDateString('en-CA');

        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        const isHoliday = holidaySet.has(curDateStr);

        if (!isWeekend && !isHoliday) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

const formatDateToThai = (dateString) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split('-'); 
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน","กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} พ.ศ. ${parseInt(y) + 543}`;
};

const ThaiDatePicker = ({ name, value, onChange, className, style, disabled }) => {
    const dateInputRef = useRef(null);
    const handleClick = () => {
        if (!disabled && dateInputRef.current) {
            try {
                if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
                else { dateInputRef.current.focus(); dateInputRef.current.click(); }
            } catch (error) {}
        }
    };
    return (
        <div style={{ position: 'relative', display: 'inline-block', width: 'auto', ...style }} onClick={handleClick}>
            <input type="text" className={className} value={formatDateToThai(value)} readOnly placeholder="วว/ดด/ปปปป" disabled={disabled} style={{ position: 'relative', zIndex: 1, cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: disabled ? '#f0f0f0' : 'white', pointerEvents: 'none' }} />
            <input ref={dateInputRef} type="date" name={name} value={value} onChange={onChange} disabled={disabled} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, zIndex: 2, cursor: 'pointer' }} />
        </div>
    );
};

const SignatureCanvas = React.memo(({ canvasRef, onClear, onSave, label, signatureData, disabled = false }) => {
    const isDrawing = useRef(false);
    const getCoords = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };
    const startDrawing = (e) => { if (disabled || signatureData) return; isDrawing.current = true; const ctx = canvasRef.current.getContext('2d'); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#000'; const { x, y } = getCoords(e); ctx.beginPath(); ctx.moveTo(x, y); };
    const draw = (e) => { if (!isDrawing.current || disabled || signatureData) return; if (e.type === 'touchmove') e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const { x, y } = getCoords(e); ctx.lineTo(x, y); ctx.stroke(); };
    const stopDrawing = () => { isDrawing.current = false; };

    return (
        <div className="signature-control">
            <label className="sign-label">{label}</label>
            <div className="canvas-container" style={{ position: 'relative', width: '250px', height: '100px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                <canvas ref={canvasRef} className="signature-canvas" width="250" height="100" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} style={{ display: signatureData ? 'none' : 'block', pointerEvents: disabled ? 'none' : 'auto', width: '100%', height: '100%', touchAction: 'none' }} />
                {signatureData && <div className="signature-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><img src={signatureData} alt="Signature" className="saved-signature" style={{ maxWidth: '90%', maxHeight: '90%' }} /></div>}
            </div>
            {!disabled && <div className="button-group" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}><button type="button" onClick={onClear} className="btn-clear">ล้าง</button>{!signatureData && <button type="button" onClick={onSave} className="btn-save">บันทึก</button>}</div>}
        </div>
    );
});

// ✅ เพิ่ม leaveTimeSlot ใน state เริ่มต้น
const initialFormState = {
    writtenAt: "", date: new Date().toISOString().slice(0, 10), subject: "ขอลา", to: "", employeeName: "", position: "", department: "",
    leaveType: { sick: false, personal: false, maternity: false }, sickReason: "", personalReason: "",
    startDate: "", endDate: "", durationDays: "", 
    leaveDurationType: "full", leaveTimeSlot: "", // ✅ เพิ่ม leaveTimeSlot
    lastLeaveType: { sick: false, personal: false, maternity: false }, lastStartDate: "", lastEndDate: "", lastDurationDays: "", contact: "",
    stats: { sick: { taken: "", current: "", total: "" }, personal: { taken: "", current: "", total: "" }, vacation: { taken: "", current: "", total: "" }, },
    signature: "", managerSignature: "", checkerName: "", checkerPosition: "", checkerDate: "", approveDate: "", status: "pending", rejectReason: "", checkerVerified: false, managerDecision: "", managerPosition: "", managerName: "", signName: "", managerSign: "", 
};

export default function RequestLeave() {
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [holidays, setHolidays] = useState([]); 
    
    const navigate = useNavigate();
    const employeeCanvasRef = useRef(null);
    const managerCanvasRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, latestRes, holidayRes] = await Promise.allSettled([
                    API.get('/personalleaves/auth/me'),
                    API.get('/personalleaves/latest'),
                    API.get('/holidays')
                ]);

                if (userRes.status === 'fulfilled') {
                    const user = userRes.value.data;
                    setFormData(prev => ({
                        ...prev,
                        employeeName: user.name || "", position: user.position || "", department: user.department || "", signName: user.name || "",
                        stats: { ...prev.stats, sick: { ...prev.stats.sick, taken: user.stat_sick_used || "" }, personal: { ...prev.stats.personal, taken: user.stat_personal_used || "" } }
                    }));
                }

                if (latestRes.status === 'fulfilled') {
                    const latest = latestRes.value.data;
                    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : "";
                    const latestType = latest?.type ? latest.type.toLowerCase() : "";
                    setFormData(prev => ({
                        ...prev,
                        lastStartDate: latest ? formatDate(latest.startDate) : "", 
                        lastEndDate: latest ? formatDate(latest.endDate) : "",
                        lastDurationDays: latest ? (latest.totalDays || "") : "",
                        lastLeaveType: { sick: latestType === 'sick', personal: latestType === 'personal', maternity: false },
                    }));
                }

                if (holidayRes.status === 'fulfilled') {
                    const data = holidayRes.value.data;
                    const holidayDates = Array.isArray(data) ? data.map(h => h.date || h.Date || h.start || h) : [];
                    setHolidays(holidayDates);
                }

            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [navigate]);

    const calculateDuration = (start, end) => {
        if (!start || !end) return "";
        const startDate = new Date(start); 
        const endDate = new Date(end);
        if (endDate < startDate) return "";
        return calculateWorkingDays(startDate, endDate, holidays);
    };

    // ✅ คำนวณวันลาอัตโนมัติเมื่อวันที่เปลี่ยน
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate); const end = new Date(formData.endDate);
            start.setHours(0,0,0,0); end.setHours(0,0,0,0);
            
            if (end < start) {
                Swal.fire({ icon: 'warning', title: 'วันที่ไม่ถูกต้อง', text: 'วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น', confirmButtonColor: '#f39c12' });
                setFormData(prev => ({ ...prev, endDate: "", durationDays: "" }));
                return;
            }

            // ถ้าวันที่ไม่ตรงกัน ให้ Reset กลับเป็นเต็มวันเสมอ
            if (formData.startDate !== formData.endDate && formData.leaveDurationType !== 'full') {
                 setFormData(prev => ({ ...prev, leaveDurationType: 'full', leaveTimeSlot: '' }));
            }
        }

        let days = calculateDuration(formData.startDate, formData.endDate);
        
        // ถ้าลาวันเดียว และเลือกแบบครึ่งวัน -> ให้เป็น 0.5
        if (formData.startDate === formData.endDate && formData.startDate !== "" && days === 1) {
            if (formData.leaveDurationType === 'half') {
                days = 0.5;
            }
        }

        if (days !== formData.durationDays) setFormData(prev => ({ ...prev, durationDays: days }));
    }, [formData.startDate, formData.endDate, holidays, formData.leaveDurationType]); 

    useEffect(() => {
        if (formData.lastStartDate && formData.lastEndDate) {
            const start = new Date(formData.lastStartDate); const end = new Date(formData.lastEndDate);
            start.setHours(0,0,0,0); end.setHours(0,0,0,0);
            if (end < start) {
                Swal.fire({ icon: 'warning', title: 'วันที่ไม่ถูกต้อง', text: 'วันที่สิ้นสุด (ลาครั้งก่อน) ต้องไม่น้อยกว่าวันที่เริ่มต้น', confirmButtonColor: '#f39c12' });
                setFormData(prev => ({ ...prev, lastEndDate: "", lastDurationDays: "" }));
                return;
            }
        }
        const days = calculateWorkingDays(new Date(formData.lastStartDate), new Date(formData.lastEndDate), []); 
        if (days !== formData.lastDurationDays && formData.lastDurationDays === "") { 
             setFormData(prev => ({ ...prev, lastDurationDays: days }));
        }
    }, [formData.lastStartDate, formData.lastEndDate]);

    // ✅ ฟังก์ชันสำหรับจัดการเมื่อเลือก เต็มวัน/ครึ่งวัน และเด้ง Popup
    const handleDurationTypeChange = async (e) => {
        const val = e.target.value;

        if (val === 'half') {
            const { value: timeSlot } = await Swal.fire({
                title: 'ระบุช่วงเวลาการลา',
                text: 'กรุณาเลือกช่วงเวลาที่ต้องการลาพักร้อน',
                icon: 'question',
                input: 'radio',
                inputOptions: {
                    'morning': 'ช่วงเช้า (08:30 - 12:00)',
                    'afternoon': 'ช่วงบ่าย (13:00 - 16:30)'
                },
                inputValidator: (value) => {
                    if (!value) {
                        return 'กรุณาเลือกช่วงเวลา!';
                    }
                },
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'ตกลง',
                showCancelButton: true,
                cancelButtonText: 'ยกเลิก'
            });

            if (timeSlot) {
                setFormData(prev => ({
                    ...prev,
                    leaveDurationType: 'half',
                    leaveTimeSlot: timeSlot,
                    durationDays: 0.5
                }));
            }
            // ถ้ากดยกเลิก ไม่ทำอะไร (ค่า Radio จะไม่ถูกเปลี่ยนเพราะ state ไม่เปลี่ยน)
        } else {
            // กรณีกลับมาเลือกเต็มวัน
            setFormData(prev => ({
                ...prev,
                leaveDurationType: 'full',
                leaveTimeSlot: '',
                durationDays: 1.0
            }));
        }
    };

    const handleClearSignature = useCallback((type) => {
        let canvasRef, fieldName;
        if (type === 'employee') { canvasRef = employeeCanvasRef; fieldName = 'signature'; } 
        else if (type === 'manager') { canvasRef = managerCanvasRef; fieldName = 'managerSignature'; } else return;
        setFormData(prev => ({ ...prev, [fieldName]: "" }));
        if (canvasRef.current) { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); }
    }, []);

    const handleSaveSignature = useCallback((type) => {
        let canvasRef, fieldName;
        if (type === 'employee') { canvasRef = employeeCanvasRef; fieldName = 'signature'; } 
        else if (type === 'manager') { canvasRef = managerCanvasRef; fieldName = 'managerSignature'; } else return;
        if (canvasRef.current) { const dataURL = canvasRef.current.toDataURL('image/png'); setFormData(prev => ({ ...prev, [fieldName]: dataURL })); }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('leaveType') || name.startsWith('lastLeaveType')) {
            const [baseName, key] = name.split('.');
            setFormData(prev => {
                let updated = { ...prev };
                if (baseName === 'leaveType' && checked) updated.leaveType = { sick: false, personal: false, maternity: false, [key]: true };
                else if (baseName === 'lastLeaveType' && checked) updated.lastLeaveType = { sick: false, personal: false, maternity: false, [key]: true };
                else updated[baseName] = { ...prev[baseName], [key]: checked };
                return updated;
            });
        } else if (name.startsWith('stats')) {
            const [_, leave, field] = name.split('.');
            setFormData(prev => {
                const updatedStats = { ...prev.stats, [leave]: { ...prev.stats[leave], [field]: value } };
                if (field === 'taken' || field === 'current') {
                    const taken = Number(updatedStats[leave].taken) || 0;
                    const current = Number(updatedStats[leave].current) || 0;
                    updatedStats[leave].total = (taken + current).toString();
                }
                return { ...prev, stats: updatedStats };
            });
        } else if (name === 'managerDecision') { setFormData(prev => ({ ...prev, [name]: value, rejectReason: value === 'approve' ? '' : prev.rejectReason }));
        } else { setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.writtenAt || !formData.date || !formData.subject || !formData.to || !formData.employeeName || !formData.position || !formData.department || !formData.contact || !formData.signName) {
            Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณากรอกข้อมูลทั่วไปและข้อมูลการติดต่อให้ครบถ้วน', confirmButtonColor: '#f39c12' }); return;
        }
        if (!formData.startDate || !formData.endDate || !formData.durationDays) {
            Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณาระบุวันลาและจำนวนวันลาให้ครบถ้วน', confirmButtonColor: '#f39c12' }); return;
        }
        const selectedLeaveType = Object.keys(formData.leaveType).find(key => formData.leaveType[key]);
        if (!selectedLeaveType) {
            Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณาเลือกประเภทการลา', confirmButtonColor: '#f39c12' }); return;
        }
        if (selectedLeaveType === 'sick' && !formData.sickReason) {
             Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: "กรุณาระบุสาเหตุการป่วย", confirmButtonColor: '#f39c12' }); return;
        }
        if (selectedLeaveType === 'personal' && !formData.personalReason) {
             Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: "กรุณาระบุเหตุผลการลากิจ", confirmButtonColor: '#f39c12' }); return;
        }
        if (!formData.signature) {
            Swal.fire({ icon: 'warning', title: 'ยังไม่ได้ลงลายเซ็น', text: "กรุณาลงลายเซ็นของผู้ลาและกด 'บันทึก' ก่อนส่งคำขอ", confirmButtonColor: '#f39c12' }); return;
        }

        let leaveAmount = parseFloat(formData.durationDays); 
        let sickCurrent = selectedLeaveType === 'sick' ? leaveAmount : 0;
        let personalCurrent = selectedLeaveType === 'personal' ? leaveAmount : 0;

        let finalSickReason = formData.sickReason;
        if (selectedLeaveType === 'sick' && formData.sickReason) {
            finalSickReason = encryptData(formData.sickReason); 
        }

        let finalSignature = encryptData(formData.signature);

        const dataToSend = {
            ...formData,
            type: selectedLeaveType,
            totalDays: formData.durationDays,
            
            // ✅ ส่งข้อมูลช่วงเวลาไปด้วย
            leaveTimeSlot: formData.leaveDurationType === 'half' ? formData.leaveTimeSlot : null,

            sickReason: finalSickReason, 
            signature: finalSignature,
            stat_sick_used: formData.stats.sick.taken || 0,
            stat_sick_current: sickCurrent, 
            stat_sick_total: (Number(formData.stats.sick.taken || 0) + sickCurrent).toString(),
            stat_personal_used: formData.stats.personal.taken || 0,
            stat_personal_current: personalCurrent,
            stat_personal_total: (Number(formData.stats.personal.taken || 0) + personalCurrent).toString(),
            lastLeaveType: Object.keys(formData.lastLeaveType).filter(key => formData.lastLeaveType[key]).join(', ') || null,
            lastStartDate: formData.lastStartDate,
            lastEndDate: formData.lastEndDate,
            lastTotalDays: formData.lastDurationDays, 
            signName: formData.signName,
            managerSign: formData.managerName,
            name: formData.employeeName,
        };

        setIsLoading(true);
        try {
            await API.post('/personalleaves/create', dataToSend); 
            await Swal.fire({ icon: 'success', title: 'ส่งข้อมูลสำเร็จ', text: 'ระบบได้บันทึกใบลาของคุณเรียบร้อยแล้ว', confirmButtonColor: '#28a745' });
            
            setFormData(initialFormState);
            if(employeeCanvasRef.current) {
                 const ctx = employeeCanvasRef.current.getContext('2d');
                 ctx.clearRect(0,0, employeeCanvasRef.current.width, employeeCanvasRef.current.height);
            }
            window.scrollTo(0, 0);
            
        } catch (err) {
            console.error("Error submitting:", err); 
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || "ส่งข้อมูลไม่สำเร็จ", confirmButtonColor: '#dc3545' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="paper-container page-personal-leave">
            <form onSubmit={handleSubmit} className="paper">
                
                <h2 className="title">แบบใบลาป่วย ลากิจส่วนตัว</h2>

                {/* Header */}
                <div className="section-header">
                    <div className="row">
                        <span>เขียนที่</span>
                        <input name="writtenAt" className="line medium" style={{ width: '340px'}} value={formData.writtenAt} onChange={handleChange} />
                        
                        <span>วันที่</span>
                        <ThaiDatePicker 
                            name="date" 
                            className="line small" 
                            value={formData.date} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="subject-section">
                    <div className="row"><span>เรื่อง</span><input name="subject" className="line" value={formData.subject} onChange={handleChange} /></div>
                    <div className="row"><span>เรียน</span><input name="to" className="line" style={{ width: '400px'}} value={formData.to} onChange={handleChange} /></div>
                </div>

                {/* Employee Info */}
                <div className="content-section">
                    <div className="row">
                        <span>ข้าพเจ้า</span><input name="employeeName" className="line medium" style={{ width: '280px'}} value={formData.employeeName} onChange={handleChange} placeholder="ชื่อ-นามสกุล" />
                        <span>ตำแหน่ง</span><input name="position" className="line medium" value={formData.position} onChange={handleChange} placeholder="ตำแหน่ง" />
                    </div>
                    <div className="row">
                        <span>สังกัด</span><input name="department" className="line medium" style={{ width: '400px'}} value={formData.department} onChange={handleChange} placeholder="สังกัด" />
                    </div>
                </div>
                
                {/* Purpose */}
                <div className="section leave-purpose-area">
                    <p className="section-title">มีความประสงค์ขอลา</p>
                    <div className="row" style={{ alignItems: 'baseline', gap: '30px', marginBottom: 0 }}>
                        <label className="checkbox-label">
                            <input type="checkbox" name="leaveType.sick" checked={formData.leaveType.sick} onChange={handleChange} />
                            ป่วย เนื่องจาก <input name="sickReason" className="line large" value={formData.sickReason || ''} onChange={handleChange} disabled={!formData.leaveType.sick} />
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" name="leaveType.personal" checked={formData.leaveType.personal} onChange={handleChange} />
                            กิจส่วนตัว เนื่องจาก <input name="personalReason" className="line large" value={formData.personalReason || ''} onChange={handleChange} disabled={!formData.leaveType.personal} />
                        </label>
                    </div>
                </div>

                {/* Duration */}
                <div className="section leave-duration-area">
                    <div className="row" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <span>ตั้งแต่วันที่</span>
                        <ThaiDatePicker 
                            name="startDate" 
                            className="line small" 
                            value={formData.startDate} 
                            onChange={handleChange} 
                        />
                        
                        <span>ถึงวันที่</span>
                        <ThaiDatePicker 
                            name="endDate" 
                            className="line small" 
                            value={formData.endDate} 
                            onChange={handleChange} 
                        />

                        {/* ✅ UI: แสดงตัวเลือก เต็มวัน/ครึ่งวัน พร้อม Logic ใหม่ */}
                        {formData.startDate && formData.endDate && formData.startDate === formData.endDate && (
                            <div style={{ display: 'inline-flex', gap: '15px', margin: '0 15px', backgroundColor: '#eef2f7', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <input 
                                        type="radio" 
                                        name="leaveDurationType" 
                                        value="full" 
                                        checked={formData.leaveDurationType === 'full'} 
                                        onChange={handleDurationTypeChange} 
                                    /> 
                                    เต็มวัน (1.0)
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <input 
                                        type="radio" 
                                        name="leaveDurationType" 
                                        value="half" 
                                        checked={formData.leaveDurationType === 'half'} 
                                        onChange={handleDurationTypeChange} 
                                    /> 
                                    ครึ่งวัน (0.5)
                                    {/* แสดงสถานะช่วงเวลา */}
                                    {formData.leaveDurationType === 'half' && formData.leaveTimeSlot && (
                                        <span style={{ color: '#007bff', fontWeight: 'bold', marginLeft: '5px' }}>
                                            ({formData.leaveTimeSlot === 'morning' ? 'ช่วงเช้า' : 'ช่วงบ่าย'})
                                        </span>
                                    )}
                                </label>
                            </div>
                        )}
                        
                        <span>มีกำหนด</span>
                        <input 
                            name="durationDays" 
                            type="number" 
                            className="line tiny" 
                            value={formData.durationDays} 
                            readOnly 
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', width: '60px', textAlign: 'center' }} 
                        /> วัน
                    </div>
                </div>

                {/* Last Leave */}
                <div className="section last-leave-stats">
                    <p className="section-title">ข้าพเจ้าเคยลาครั้งสุดท้าย</p>
                    <div className="row last-leave-type-row">
                        {['sick', 'personal'].map(type => (
                            <label key={type} className="checkbox-label">
                                <input type="checkbox" name={`lastLeaveType.${type}`} checked={formData.lastLeaveType[type]} onChange={handleChange} /> 
                                {type === 'sick' ? 'ป่วย' : type === 'personal' ? 'กิจส่วนตัว' : ''}
                            </label>
                        ))}
                    </div>
                    <div className="row last-leave-duration-row">
                        <span>ตั้งแต่วันที่</span>
                        <ThaiDatePicker 
                            name="lastStartDate" 
                            className="line small" 
                            value={formData.lastStartDate} 
                            onChange={handleChange} 
                        />

                        <span>ถึงวันที่</span>
                        <ThaiDatePicker 
                            name="lastEndDate" 
                            className="line small" 
                            value={formData.lastEndDate} 
                            onChange={handleChange} 
                        />

                        <span>มีกำหนด</span>
                        <input 
                            name="lastDurationDays" 
                            type="number" 
                            className="line tiny" 
                            value={formData.lastDurationDays} 
                            readOnly 
                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                        /> วัน
                    </div>
                </div>

                {/* Contact */}
                <div className="section contact-area">
                    <div className="row">
                        <span>ติดต่อข้าพเจ้าได้ที่</span><input name="contact" className="line full-width" value={formData.contact} onChange={handleChange} />
                    </div>
                </div>

                {/* Signature */}
                <div className="signature-area">
                    <div className="sign-block" style={{ width: '100%', alignItems: 'flex-end' }}>
                        
                        <SignatureCanvas 
                            canvasRef={employeeCanvasRef} 
                            onClear={() => handleClearSignature('employee')}
                            onSave={() => handleSaveSignature('employee')}
                            label="(ลงชื่อ) ผู้ลา"
                            signatureData={formData.signature}
                        />

                        <div className="sign-name-input-wrapper">
                            (<input name="signName" className="line signature-input" value={formData.signName} placeholder="พิมพ์ชื่อ-นามสกุล" onChange={handleChange} />)
                        </div>
                    </div>
                </div>
                
                <div className="form-actions-container"> 
                    <div className="submit-button-wrapper">
                        <button className="submit-btn" type="submit" disabled={isLoading}>
                            {isLoading ? '⏳ กำลังส่งข้อมูล...' : '✅ ส่งใบลา'}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}