import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js'; 

// ----------------------------------------------------------------------
// --- CSS Styles ---
// ----------------------------------------------------------------------
const pageStyles = `
@media screen { body { background: #f0f2f5; } }
.paper-container { display: flex; justify-content: center; padding: 20px; font-family: 'Sarabun', sans-serif; }
.paper { width: 100%; max-width: 210mm; min-height: 297mm; background: white; padding: 40px 50px; color: #000; border: 1px solid #dcdcdc; box-shadow: 0 4px 15px rgba(0,0,0,0.1); box-sizing: border-box; line-height: 1.6; position: relative; }
.paper .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333; }
.section-header { margin-bottom: 20px; }
.row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; font-size: 15px; }

/* Line Input Styles */
.line { border: none; border-bottom: 1px dotted #333; padding: 2px 5px; outline: none; background: transparent; font-size: 15px; font-family: inherit; color: #000; transition: border-bottom 0.3s; }
.line:focus { border-bottom: 1px solid #007bff; }
.line:disabled, .line[readonly] { background: #fff; color: #000; opacity: 1; cursor: default; }

.line.tiny { width: 60px; text-align: center; }
.line.small { width: 130px; text-align: center; } 
.line.medium { width: 200px; }
.line.large { width: 250px; }
.line.full-width { flex: 1; min-width: 200px; }
.line.signature-input { width: 200px; text-align: center; margin-top: 5px; }

.divider { border: none; border-top: 1px solid #e0e0e0; margin: 20px 0; }
.content-section { margin-bottom: 15px; }
.signature-area { display: flex; justify-content: center; margin: 30px 0; }
.sign-block { text-align: center; display: flex; flex-direction: column; align-items: center; }
.canvas-container { background: #fff; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 5px; overflow: hidden; }
.button-group { display: flex; gap: 10px; justify-content: center; margin-top: 5px; }
.btn-clear, .btn-save { padding: 4px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; }
.btn-clear { background: #dc3545; color: white; }
.btn-save { background: #28a745; color: white; }
.submit-button-wrapper { display: flex; justify-content: center; margin-top: 30px; }
.submit-btn { background: #007bff; color: white; border: none; padding: 12px 30px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
.submit-btn:hover:not(:disabled) { background: #0056b3; }
.submit-btn:disabled { background: #6c757d; cursor: not-allowed; }

@media print {
  .paper-container { padding: 0; display: block; }
  .paper { box-shadow: none; border: none; padding: 0; margin: 0 auto; width: 100%; max-width: 100%; }
  .submit-button-wrapper, .button-group, nav, header, footer { display: none !important; }
  .canvas-container { border: none; }
}
`;

// --- Config API ---
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
    try { return CryptoJS.AES.encrypt(text, SECRET_KEY).toString(); } 
    catch (error) { console.error("Encryption failed:", error); return text; }
};

// --- Initial State ---
const initialFormState = {
    writtenAt: "", 
    date: new Date().toISOString().slice(0, 10),
    subject: "ขอลาพักผ่อน",
    to: "",
    employeeName: "", 
    position: "",
    department: "",
    vacationAccumulated: "", // เริ่มต้นเป็นค่าว่าง
    vacationThisYear: "",    // เริ่มต้นเป็นค่าว่าง
    vacationTotal: "",       // เริ่มต้นเป็นค่าว่าง
    startDate: "",
    endDate: "",
    durationDays: "",        // เริ่มต้นเป็นค่าว่าง
    leaveDurationType: "full", 
    contact: "",
    statsPreviousDays: "", 
    statsCurrentDays: "", 
    statsTotalDays: "", 
    signature: "", 
    signName: "",
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

const ThaiDatePicker = ({ name, value, onChange, width = '150px' }) => {
    const dateInputRef = useRef(null);
    const handleClick = () => {
        if (dateInputRef.current) {
            try {
                if (dateInputRef.current.showPicker) dateInputRef.current.showPicker();
                else { dateInputRef.current.focus(); dateInputRef.current.click(); }
            } catch (error) {}
        }
    };
    return (
        <div style={{ position: 'relative', display: 'inline-block', width: width }} onClick={handleClick}>
            <input type="text" className="line" value={formatDateToThai(value)} placeholder="วว/ดด/ปปปป" readOnly style={{ width: '100%', textAlign: 'center', cursor: 'pointer', pointerEvents: 'none' }} />
            <input ref={dateInputRef} type="date" name={name} value={value} onChange={onChange} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
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
            <label className="sign-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{label}</label>
            <div className="canvas-container" style={{ position: 'relative', width: '250px', height: '100px', backgroundColor: '#fff', border: '1px solid #ccc' }}>
                <canvas ref={canvasRef} className="signature-canvas" width="250" height="100" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} style={{ display: signatureData ? 'none' : 'block', pointerEvents: disabled ? 'none' : 'auto', width: '100%', height: '100%', touchAction: 'none' }} />
                {signatureData && <div className="signature-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><img src={signatureData} alt="Signature" className="saved-signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></div>}
            </div>
            {!disabled && <div className="button-group"><button type="button" onClick={onClear} className="btn-clear">ล้าง</button>{!signatureData && <button type="button" onClick={onSave} className="btn-save">บันทึก</button>}</div>}
        </div>
    );
});

// ----------------------------------------------------------------------
// --- Main Component: VacationLeave ---
// ----------------------------------------------------------------------
export default function VacationLeave() {
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [holidays, setHolidays] = useState([]); 
    const employeeCanvasRef = useRef(null);
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [userRes, holidayRes] = await Promise.allSettled([
                    API.get('/vacationleaves/auth/me'),
                    API.get('/holidays')
                ]);

                if (userRes.status === 'fulfilled') {
                    const user = userRes.value.data; 
                    setFormData(prev => ({
                        ...prev,
                        employeeName: user.name || "",      
                        position: user.position || "",      
                        department: user.department || "",  
                        signName: user.name || "",
                        // ถ้าอยากให้เริ่มต้นเป็นค่าว่าง ไม่ต้องเซ็ต 0
                        // vacationAccumulated: user.vacation_accumulated || "", 
                        // vacationThisYear: user.vacation_quota || "" 
                    }));
                } else if (userRes.reason?.response?.status === 401) {
                    Swal.fire('Session หมดอายุ', 'กรุณาเข้าสู่ระบบใหม่', 'error').then(() => navigate('/login'));
                }

                if (holidayRes.status === 'fulfilled') {
                    const data = holidayRes.value.data;
                    const holidayDates = Array.isArray(data) ? data.map(h => h.date || h.Date || h.start || h) : [];
                    setHolidays(holidayDates);
                }
            } catch (error) { console.error("Error fetching data:", error); }
        };
        fetchUserData();
    }, [navigate]);

    // ✅ Calculation Logic for Duration
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            start.setHours(0,0,0,0); end.setHours(0,0,0,0);

            if (end < start) {
                Swal.fire({ icon: 'warning', title: 'วันที่ไม่ถูกต้อง', text: 'วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น', showConfirmButton: false, timer: 1500 });
                setFormData(prev => ({ ...prev, endDate: "", durationDays: "" }));
                return;
            }

             // Reset เป็น full ถ้าเลือกหลายวัน
             if (formData.startDate !== formData.endDate && formData.leaveDurationType !== 'full') {
                setFormData(prev => ({ ...prev, leaveDurationType: 'full' }));
            }
        }

        let days = calculateWorkingDays(formData.startDate, formData.endDate, holidays);
        
        // Logic: ถ้าลาวันเดียว และเลือกครึ่งวัน -> ให้เป็น 0.5
        if (formData.startDate === formData.endDate && formData.startDate !== "" && days === 1) {
            if (formData.leaveDurationType === 'half') {
                days = 0.5;
            }
        }

        // ✅ ถ้าผลลัพธ์เป็น 0 ให้เก็บเป็นค่าว่าง ""
        const daysToSet = days === 0 ? "" : days.toString();

        if (daysToSet !== formData.durationDays) {
            setFormData(prev => ({ ...prev, durationDays: daysToSet }));
        }

    }, [formData.startDate, formData.endDate, holidays, formData.leaveDurationType]);

    // ✅ Update Total Vacation Days Logic
    useEffect(() => {
        const accumulated = parseFloat(formData.vacationAccumulated) || 0;
        const thisYear = parseFloat(formData.vacationThisYear) || 0;
        const total = accumulated + thisYear;

        // ✅ ถ้าผลรวมเป็น 0 ให้เก็บเป็นค่าว่าง ""
        setFormData(prev => ({ 
            ...prev, 
            vacationTotal: total === 0 ? "" : total.toString() 
        }));
    }, [formData.vacationAccumulated, formData.vacationThisYear]);


    const handleClearSignature = useCallback(() => {
        setFormData(prev => ({ ...prev, signature: "" }));
        if (employeeCanvasRef.current) {
            const ctx = employeeCanvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, employeeCanvasRef.current.width, employeeCanvasRef.current.height);
        }
    }, []);

    const handleSaveSignature = useCallback(() => {
        if (employeeCanvasRef.current) {
            const dataURL = employeeCanvasRef.current.toDataURL('image/png');
            setFormData(prev => ({ ...prev, signature: dataURL }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.writtenAt || !formData.date || !formData.subject || !formData.to || !formData.employeeName || !formData.position || !formData.department || !formData.contact) {
            Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณากรอกข้อมูลทั่วไปและข้อมูลการติดต่อให้ครบถ้วน', confirmButtonColor: '#f39c12' }); return;
        }
        if (!formData.startDate || !formData.endDate || !formData.durationDays) {
            Swal.fire({ icon: 'warning', title: 'ข้อมูลไม่ครบถ้วน', text: 'กรุณาระบุวันลาและจำนวนวันลาให้ครบถ้วน', confirmButtonColor: '#f39c12' }); return;
        }
        if (!formData.signature) {
            Swal.fire({ icon: 'warning', title: 'ยังไม่ได้ลงนาม', text: "กรุณาลงลายเซ็นของผู้ลาและกดปุ่ม 'บันทึก' ก่อนส่งคำขอ", confirmButtonColor: '#f39c12' }); return;
        }

        setIsLoading(true);
        try {
            const finalSignature = encryptData(formData.signature); 

            const dataToSend = {
                ...formData,
                vacationAccumulated: parseFloat(formData.vacationAccumulated) || 0,
                vacationThisYear: parseFloat(formData.vacationThisYear) || 0,
                vacationTotal: parseFloat(formData.vacationTotal) || 0,
                durationDays: parseFloat(formData.durationDays), 
                statsPreviousDays: parseFloat(formData.statsPreviousDays) || 0,
                statsCurrentDays: parseFloat(formData.durationDays),
                statsTotalDays: (parseFloat(formData.statsPreviousDays) || 0) + parseFloat(formData.durationDays),
                signature: finalSignature,
                name: formData.employeeName, 
                signName: formData.signName || formData.employeeName,
                status: 'pending' 
            };
            
            await API.post('/vacationleaves/create', dataToSend); 
            await Swal.fire({ icon: 'success', title: 'ส่งข้อมูลสำเร็จ', text: `ระบบได้บันทึกใบลาพักผ่อนเรียบร้อยแล้ว`, confirmButtonColor: '#28a745' });
            
            setFormData(initialFormState);
            handleClearSignature();
            window.scrollTo(0, 0);

        } catch (err) {
            console.error("Error submitting:", err); 
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.message || "ไม่สามารถส่งข้อมูลได้", confirmButtonColor: '#dc3545' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="paper-container page-vacation-leave">
            <style>{pageStyles}</style>
            
            <form onSubmit={handleSubmit} className="paper">
                <h2 className="title">แบบใบลาพักผ่อน</h2>

                {/* Header Section */}
                <div className="section-header">
                    <div className="row">
                        <span>เขียนที่</span> 
                        <input name="writtenAt" className="line"style={{ width: '340px'}} value={formData.writtenAt} onChange={handleChange} />
                        
                        <span>วันที่</span> 
                        <ThaiDatePicker name="date" value={formData.date} onChange={handleChange} width="190px" />
                    </div>
                    <div className="row">
                        <span>เรื่อง</span> 
                        <input name="subject" className="line" value={formData.subject} onChange={handleChange} />
                    </div>
                    <div className="row">
                        <span>เรียน</span> 
                        <input name="to" className="line"style={{ width: '400px'}} value={formData.to} onChange={handleChange} />
                    </div>
                </div>

                <hr className="divider" />

                {/* Employee Info */}
                <div className="content-section">
                    <div className="row">
                        <span>ข้าพเจ้า</span> 
                        <input name="employeeName" className="line large" value={formData.employeeName} onChange={handleChange} placeholder="ชื่อ-นามสกุล" />
                        <span>ตำแหน่ง</span> 
                        <input name="position" className="line medium" value={formData.position} onChange={handleChange} placeholder="ตำแหน่ง" />
                    </div>
                    <div className="row">
                        <span>สังกัด</span> 
                        <input name="department" className="line "style={{ width: '400px'}} value={formData.department} onChange={handleChange} placeholder="แผนก/ฝ่าย" />
                    </div>

                    <div className="row day-stats-row" style={{ marginTop: '15px', alignItems: 'center' }}>
                        <span>มีวันลาพักผ่อนสะสม</span> 
                        <input 
                            name="vacationAccumulated" 
                            type="number" 
                            step="0.5" 
                            className="line tiny" 
                            /* ✅ ถ้าเป็น 0 หรือว่าง ให้แสดงว่าง */
                            value={formData.vacationAccumulated == 0 ? "" : formData.vacationAccumulated} 
                            onChange={handleChange} 
                        /> วันทำการ

                        <span style={{ marginLeft: '10px' }}>มีสิทธิลาพักผ่อนประจำปีนี้อีก</span> 
                        <input 
                            name="vacationThisYear" 
                            type="number" 
                            step="0.5" 
                            className="line tiny" 
                            /* ✅ ถ้าเป็น 0 หรือว่าง ให้แสดงว่าง */
                            value={formData.vacationThisYear == 0 ? "" : formData.vacationThisYear} 
                            onChange={handleChange} 
                        /> วันทำการ

                        <span style={{ marginLeft: '10px' }}>รวมเป็น</span> 
                        <input 
                            name="vacationTotal" 
                            type="text" 
                            className="line tiny" 
                            /* ✅ ถ้าเป็น 0 หรือว่าง ให้แสดงว่าง */
                            value={formData.vacationTotal == 0 ? "" : formData.vacationTotal} 
                            readOnly 
                            style={{ fontWeight: 'bold' }} 
                        /> วันทำการ
                    </div>

                    <div className="row" style={{ marginTop: '15px', alignItems: 'center' }}>
                        <span>ขอลาพักผ่อนตั้งแต่วันที่</span> 
                        <ThaiDatePicker name="startDate" value={formData.startDate} onChange={handleChange} width="190px" />
                        
                        <span>ถึงวันที่</span> 
                        <ThaiDatePicker name="endDate" value={formData.endDate} onChange={handleChange} width="190px" />

                        {/* ตัวเลือก เต็มวัน/ครึ่งวัน */}
                        {formData.startDate && formData.endDate && formData.startDate === formData.endDate && (
                             <div style={{ display: 'inline-flex', gap: '10px', margin: '0 10px', backgroundColor: '#eef2f7', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="radio" name="leaveDurationType" value="full" checked={formData.leaveDurationType === 'full'} onChange={handleChange} /> เต็มวัน
                                </label>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input type="radio" name="leaveDurationType" value="half" checked={formData.leaveDurationType === 'half'} onChange={handleChange} /> ครึ่งวัน
                                </label>
                            </div>
                        )}
                        
                        <span>มีกำหนด</span> 
                        <input 
                            name="durationDays" 
                            type="text" 
                            className="line tiny" 
                            /* ✅ ถ้าคำนวณได้ 0 ให้แสดงว่าง */
                            value={formData.durationDays == 0 ? "" : formData.durationDays} 
                            readOnly 
                            style={{ backgroundColor: '#f0f0f0', width: '50px', textAlign: 'center' }} 
                        /> วัน
                    </div>

                    <div className="row" style={{ marginTop: '15px' }}>
                        <span>ในระหว่างลาจะติดต่อข้าพเจ้าได้ที่</span> 
                        <input name="contact" className="line full-width" value={formData.contact} onChange={handleChange} />
                    </div>
                </div>

                <hr className="divider" />

                {/* Signature User */}
                <div className="signature-area">
                    <div className="sign-block" style={{ width: '100%', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '10px' }}>ขอแสดงความนับถือ</div>
                        
                        <SignatureCanvas 
                            canvasRef={employeeCanvasRef} 
                            onClear={handleClearSignature}
                            onSave={handleSaveSignature}
                            label="(ลงชื่อ) ผู้ลา"
                            signatureData={formData.signature}
                        />
                        
                        <div style={{ marginTop: '5px' }}>
                            (<input name="signName" className="line signature-input" value={formData.signName} onChange={handleChange} placeholder="พิมพ์ชื่อ-นามสกุล" />)
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="submit-button-wrapper">
                    <button className="submit-btn" type="submit" disabled={isLoading}>
                        {isLoading ? '⏳ กำลังส่งข้อมูล...' : '✅ ส่งใบลา'}
                    </button>
                </div>

            </form>
        </div>
    );
}