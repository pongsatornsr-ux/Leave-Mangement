import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import CryptoJS from 'crypto-js';

// ⚠️ สำคัญ: ต้องเป็น Key เดียวกับที่ใช้ในหน้าอื่น ๆ (เช่น RequestLeave.js)
const SECRET_KEY = "secret_signature_key_for_encrypt_2026"; 

// ✅ ฟังก์ชันถอดรหัส (พร้อม Debug Log)
const decryptData = (cipherText, fieldName) => {
    if (!cipherText) return "";

    // 1. ถ้าข้อมูลเป็นรูปอยู่แล้ว (ไม่ได้เข้ารหัส) ให้คืนค่าเดิม
    if (cipherText.startsWith("data:image")) {
        return cipherText;
    }

    try {
        // 2. พยายามถอดรหัส
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // ถ้าถอดได้แล้วเป็นค่าว่าง หรือไม่ใช่ string ที่ถูกต้อง ให้คืนค่าเดิม
        return originalText || cipherText; 
    } catch (error) {
        // console.error(`${fieldName}: เกิดข้อผิดพลาดในการถอดรหัส`, error);
        return cipherText; // คืนค่าเดิมกรณี Error
    }
};

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600&display=swap');

  /* General Body */
  @media screen { body { background: #f0f2f5; } }

  .admin-leave-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    font-family: 'Sarabun', sans-serif;
  }

  /* Paper Sheet */
  .detailform {
    width: 100%;
    max-width: 210mm;
    min-height: 297mm;
    background: white;
    padding: 40px 50px;
    color: #333;
    border: 1px solid #dcdcdc;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    box-sizing: border-box;
    line-height: 1.6;
    position: relative;
  }

  /* Typography */
  .title { text-align: center; font-weight: bold; font-size: 24px; margin-bottom: 20px; }
  .section-title { font-weight: bold; margin-bottom: 10px; font-size: 16px; text-decoration: underline; }
  .subtitle { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }

  /* Badge */
  .status-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: bold;
    color: white;
    font-size: 14px;
    display: inline-block;
    margin-left: 10px;
    vertical-align: middle;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  .status-pending { background-color: #ffc107; color: #444; }
  .status-pending_hr { background-color: #17a2b8; }
  .status-pending_manager { background-color: #6610f2; }
  .status-approved { background-color: #28a745; }
  .status-rejected { background-color: #dc3545; }

  /* Input Lines */
  .line {
    border: none;
    border-bottom: 1px dotted #999;
    background: transparent;
    padding: 2px 5px;
    font-size: 16px;
    color: #000;
    outline: none;
    font-family: inherit;
    transition: border-bottom 0.3s;
  }
  .line:focus { border-bottom: 1px solid #007bff; }
  .line:disabled { background: #fff; color: #000; opacity: 1; cursor: default; }

  /* Sizes */
  .line.tiny { width: 50px; text-align: center; }
  .line.small { width: 160px; text-align: center; }
  .line.medium { width: 220px; text-align: center; }
  .line.large { width: 280px; text-align: center; }
  .line.full-width { flex: 1; min-width: 200px; width: 100%; }
  .line.signature-input { width: 200px; text-align: center; margin-top: 5px; }

  /* Layout Utilities */
  .section-header { margin-bottom: 20px; display: flex; flex-direction: column; }
  .header-right { display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 15px; }
  .header-left { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
  
  .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; font-size: 15px; }
  
  .check-box, .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  input[type="checkbox"], input[type="radio"] { transform: scale(1.1); margin: 0; cursor: pointer; }

  .divider { border: 0; border-top: 1px solid #ccc; margin: 25px 0; }

  /* Table */
  .stats-container { margin: 20px 0; overflow-x: auto; }
  .table { width: 100%; border-collapse: collapse; min-width: 400px; }
  .table th, .table td { border: 1px solid #ccc; padding: 8px; text-align: center; font-size: 14px; }
  .table th { background-color: #f9f9f9; font-weight: bold; }
  .table input { width: 90%; border: none; background: transparent; text-align: center; }

  /* Signature Canvas */
  .signature-area { display: flex; justify-content: center; margin: 20px 0; }
  .sign-block { text-align: center; display: flex; flex-direction: column; align-items: center; width: 100%; }
  .canvas-container { background: #fff; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 5px; overflow: hidden; max-width: 100%; }
  .button-group { display: flex; gap: 10px; justify-content: center; margin-top: 5px; }
  .btn-clear, .btn-save { padding: 4px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; color: white; }
  .btn-clear { background: #dc3545; }
  .btn-save { background: #28a745; }

  /* Approval Cards */
  .approval-section { display: flex; justify-content: space-between; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
  .foreman-section, .checker-section, .commander-section {
    flex: 1; min-width: 250px;
    border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #fafafa;
    display: flex; flex-direction: column; align-items: center;
    transition: opacity 0.3s;
  }
  .detailform h4 { margin: 0 0 15px 0; text-align: center; text-decoration: underline; font-size: 16px; width: 100%; }

  /* Submit Button */
  .submit-button-wrapper { display: flex; justify-content: center; margin-top: 30px; padding-bottom: 40px; }
  .submit-btn { background: #007bff; color: white; border: none; padding: 12px 30px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background 0.2s; min-width: 200px; }
  .submit-btn:hover:not(:disabled) { background: #0056b3; }
  .submit-btn:disabled { background: #6c757d; cursor: not-allowed; }

  @media print {
    .admin-leave-container { padding: 0; display: block; }
    .detailform { box-shadow: none; border: none; padding: 0; margin: 0 auto; width: 100%; max-width: 100%; }
    .submit-button-wrapper, .button-group, nav, header, footer { display: none !important; }
    .approval-section { break-inside: avoid; }
  }
`;

// ----------------------------------------------------------------------
// --- 2. Configuration & Initialization ---
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

const initialFormState = {
    writtenAt: "", date: "", subject: "", to: "",
    employeeName: "", position: "", department: "",
    leaveType: { sick: false, personal: false, maternity: false }, sickReason: "", personalReason: "",
    startDate: "", endDate: "", durationDays: "",
    lastLeaveType: { sick: false, personal: false, maternity: false }, lastStartDate: "", lastEndDate: "", lastTotalDays: "", contact: "",
    stats: { sick: { taken: "", current: "", total: "" }, personal: { taken: "", current: "", total: "" },},
    signature: "", signName: "",
    status: "pending", 
    foremanVerified: false, foremanName: "", foremanPosition: "", foremanDate: "", foremanSignature: "",
    checkerVerified: false, checkerName: "", checkerPosition: "", checkerDate: "", checkerSignature: "",
    managerDecision: "", rejectReason: "", managerName: "", managerPosition: "", approveDate: "", managerSignature: ""
};

// ----------------------------------------------------------------------
// --- 3. Component: Thai Date Picker (With Buddhist Era) ---
// ----------------------------------------------------------------------
const ThaiDatePicker = ({ value, onChange, name, disabled, className = "line small" }) => {
    // ฟังก์ชันแปลงวันที่ YYYY-MM-DD เป็น "23 มกราคม พ.ศ. 2569"
    const toThaiDate = (dateString) => {
        if (!dateString) return "";
        const dateParts = dateString.split('-');
        if (dateParts.length !== 3) return dateString;

        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);

        const date = new Date(year, month, day);
        const thaiMonth = date.toLocaleDateString("th-TH", { month: 'long' });
        const thaiYear = year + 543;

        return `${day} ${thaiMonth} พ.ศ. ${thaiYear}`;
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Input แสดงผล */}
            <input 
                className={className}
                value={toThaiDate(value)}
                disabled={disabled}
                readOnly 
                style={{ cursor: disabled ? 'default' : 'pointer', minWidth: '220px' }} 
            />
            {/* Input Date ซ่อนอยู่ด้านหลังเพื่อให้กดเลือกได้ */}
            {!disabled && (
                <input
                    type="date"
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer'
                    }}
                />
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// --- 4. Component: Signature Canvas ---
// ----------------------------------------------------------------------
const SignatureCanvas = React.memo(({ canvasRef, onClear, onSave, label, signatureData, disabled = false }) => {
    const isDrawing = useRef(false);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { 
            x: ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) * scaleX, 
            y: ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) * scaleY 
        };
    };

    const startDrawing = (e) => {
        if (disabled || signatureData) return;
        isDrawing.current = true;
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#000';
        const { x, y } = getCoords(e);
        ctx.beginPath(); ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing.current || disabled || signatureData) return;
        if (e.type === 'touchmove') e.preventDefault(); 
        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y); ctx.stroke();
    };

    const stopDrawing = () => { isDrawing.current = false; };

    return (
        <div className="signature-control" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="canvas-container" style={{ position: 'relative', width: '250px', height: '100px' }}>
                <canvas 
                    ref={canvasRef} className="signature-canvas" width="250" height="100"
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    style={{ display: signatureData ? 'none' : 'block', pointerEvents: disabled ? 'none' : 'auto', width: '100%', height: '100%', touchAction: 'none' }}
                />
                {signatureData && (
                    <div className="signature-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={signatureData} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                )}
            </div>
            {!disabled && (
                <div className="button-group">
                    <button type="button" onClick={onClear} className="btn-clear">ล้าง</button>
                    {!signatureData && <button type="button" onClick={onSave} className="btn-save">บันทึก</button>}
                </div>
            )}
            <div style={{marginTop: '5px', fontSize: '14px'}}>{label}</div>
        </div>
    );
});

// ----------------------------------------------------------------------
// --- 5. MAIN COMPONENT ---
// ----------------------------------------------------------------------
export default function AdminLeaveDetail() { 
    const [formData, setFormData] = useState(initialFormState); 
    const [isLoading, setIsLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userRole, setUserRole] = useState(""); 
    
    const { id } = useParams(); 
    const navigate = useNavigate();

    // Roles & Refs
    const isCurrentUserForeman = userRole.toLowerCase() === 'foreman';
    const isCurrentUserChecker = userRole.toLowerCase() === 'hr'; 
    const isCurrentUserManager = userRole.toLowerCase() === 'manager' || userRole.toLowerCase() === 'admin'; 
    const isViewingMode = !(isCurrentUserChecker || isCurrentUserManager || isCurrentUserForeman); 
    
    const foremanCanvasRef = useRef(null); 
    const checkerCanvasRef = useRef(null); 
    const managerCanvasRef = useRef(null); 

    const getTodayDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const safeDate = (dateStr) => dateStr ? dateStr.slice(0, 10) : "";

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { setUserRole(JSON.parse(userStr).role || ""); } catch (e) {}
        }

        if (!id) return;
        
        const fetchLeaveDetail = async () => {
            try {
                const res = await API.get(`/personalleaves/admindetail/${id}`); 
                const apiData = Array.isArray(res.data) ? res.data[0] : res.data; 
                
                // คำนวณ Stats (เหมือนเดิม)
                let sickTaken = 0, personalTaken = 0;
                if (apiData.previousLeave) {
                    sickTaken = Number(apiData.previousLeave.stat_sick_total) || 0;
                    personalTaken = Number(apiData.previousLeave.stat_personal_total) || 0;
                } else if (apiData.personalUser) {
                    sickTaken = Number(apiData.personalUser.stat_sick_used) || 0;
                    personalTaken = Number(apiData.personalUser.stat_personal_used) || 0;
                }
                const sickCurrent = Number(apiData.stat_sick_current) || 0;
                const personalCurrent = Number(apiData.stat_personal_current) || 0;

                const mappedData = {
                    ...initialFormState,
                    ...apiData,
                    
                    // ✅✅✅ 1. ถอดรหัส sickReason ✅✅✅
                    sickReason: (apiData.type === 'sick' && apiData.sickReason) ? decryptData(apiData.sickReason, "sickReason") : apiData.sickReason || '',
                    
                    date: safeDate(apiData.date),
                    startDate: safeDate(apiData.startDate),
                    endDate: safeDate(apiData.endDate),
                    lastStartDate: safeDate(apiData.lastStartDate),
                    lastEndDate: safeDate(apiData.lastEndDate),
                    foremanDate: safeDate(apiData.foremanDate),
                    checkerDate: safeDate(apiData.checkerDate),
                    approveDate: safeDate(apiData.approveDate),
                    
                    // ✅✅✅ 2. ถอดรหัสลายเซ็น ✅✅✅
                    signature: decryptData(apiData.signature, "User Signature"),
                    foremanSignature: decryptData(apiData.foremanSignature, "Foreman Signature"),
                    checkerSignature: decryptData(apiData.checkerSignature, "Checker Signature"),
                    managerSignature: decryptData(apiData.managerSignature, "Manager Signature"),
                    
                    employeeName: apiData.name || apiData.employeeName || '',
                    durationDays: Number(apiData.totalDays) || Number(apiData.durationDays) || 0,
                    
                    foremanVerified: apiData.foremanVerified === 1 || apiData.foremanVerified === true,
                    checkerVerified: apiData.checkerVerified === 1 || apiData.checkerVerified === true,
                    
                    leaveType: { sick: apiData.type === 'sick', personal: apiData.type === 'personal', maternity: apiData.type === 'maternity' },
                    lastLeaveType: { sick: apiData.lastLeaveType?.includes('sick'), personal: apiData.lastLeaveType?.includes('personal') },

                    stats: {
                        sick: { taken: sickTaken, current: sickCurrent, total: (sickTaken + sickCurrent).toString() },
                        personal: { taken: personalTaken, current: personalCurrent, total: (personalTaken + personalCurrent).toString() }
                    },
                    status: apiData.status ? apiData.status.toLowerCase() : 'pending',
                    managerDecision: apiData.status === 'approved' ? 'approve' : (apiData.status === 'rejected' ? 'reject' : ''),
                };
                setFormData(mappedData);
            } catch (err) {
                console.error("Error fetching leave detail:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaveDetail();
    }, [id]);

    // Auto Date Fill
    useEffect(() => {
        if (isLoading || !formData.status) return;
        const today = getTodayDate();
        let updates = {};
        let hasUpdates = false;
        const currentStatus = formData.status.toLowerCase();

        if (isCurrentUserForeman && currentStatus === 'pending' && !formData.foremanDate) {
            updates.foremanDate = today; hasUpdates = true;
        }
        if (isCurrentUserChecker && currentStatus === 'pending_hr' && !formData.checkerDate) {
            updates.checkerDate = today; hasUpdates = true;
        }
        if (isCurrentUserManager && currentStatus === 'pending_manager' && !formData.approveDate) {
            updates.approveDate = today; hasUpdates = true;
        }

        if (hasUpdates) setFormData(prev => ({ ...prev, ...updates }));
    }, [isLoading, userRole, formData.status, formData.foremanDate, formData.checkerDate, formData.approveDate]);

    // Handlers
    const handleClearSignature = useCallback((type) => {
        let fieldName, canvasRef;
        if (type === 'manager') { canvasRef = managerCanvasRef; fieldName = 'managerSignature'; }
        else if (type === 'checker') { canvasRef = checkerCanvasRef; fieldName = 'checkerSignature'; }
        else if (type === 'foreman') { canvasRef = foremanCanvasRef; fieldName = 'foremanSignature'; }
        setFormData(prev => ({ ...prev, [fieldName]: "" })); 
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, []);

    const handleSaveSignature = useCallback((type) => {
        let fieldName, canvasRef;
        if (type === 'manager') { canvasRef = managerCanvasRef; fieldName = 'managerSignature'; }
        else if (type === 'checker') { canvasRef = checkerCanvasRef; fieldName = 'checkerSignature'; }
        else if (type === 'foreman') { canvasRef = foremanCanvasRef; fieldName = 'foremanSignature'; }
        
        const today = getTodayDate();
        if (canvasRef.current) {
            const dataURL = canvasRef.current.toDataURL('image/png');
            setFormData(prev => ({ 
                ...prev, 
                [fieldName]: dataURL,
                ...(type === 'foreman' && !prev.foremanDate ? { foremanDate: today } : {}),
                ...(type === 'checker' && !prev.checkerDate ? { checkerDate: today } : {}),
                ...(type === 'manager' && !prev.approveDate ? { approveDate: today } : {})
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('stats')) {
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
        } else if (name === 'managerDecision') {
            setFormData(prev => ({ ...prev, [name]: value, rejectReason: value === 'approve' ? '' : prev.rejectReason }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const isCanvasBlank = (canvas) => {
        const context = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        return !pixelBuffer.some(color => color !== 0);
    }

    // ฟังก์ชันเข้ารหัสสำหรับการส่งข้อมูลกลับไปบันทึก
    const encryptData = (text) => {
        if (!text) return "";
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation Logic (Same as before)
        if (isCurrentUserForeman && formData.status !== 'pending') { Swal.fire('ผิดขั้นตอน', "ไม่อยู่ในขั้นตอนของท่าน", 'error'); return; }
        if (isCurrentUserChecker && formData.status !== 'pending_hr') { Swal.fire('ผิดขั้นตอน', "ไม่อยู่ในขั้นตอนของท่าน", 'error'); return; }
        if (isCurrentUserManager && formData.status !== 'pending_manager') { Swal.fire('ผิดขั้นตอน', "ไม่อยู่ในขั้นตอนของท่าน", 'error'); return; }

        let finalCheckerSig = formData.checkerSignature, finalManagerSig = formData.managerSignature, finalForemanSig = formData.foremanSignature;
        if (isCurrentUserChecker && !finalCheckerSig && checkerCanvasRef.current && !isCanvasBlank(checkerCanvasRef.current)) finalCheckerSig = checkerCanvasRef.current.toDataURL('image/png');
        if (isCurrentUserManager && !finalManagerSig && managerCanvasRef.current && !isCanvasBlank(managerCanvasRef.current)) finalManagerSig = managerCanvasRef.current.toDataURL('image/png');
        if (isCurrentUserForeman && !finalForemanSig && foremanCanvasRef.current && !isCanvasBlank(foremanCanvasRef.current)) finalForemanSig = foremanCanvasRef.current.toDataURL('image/png');

        let nextStatus = formData.status;
        if (isCurrentUserForeman) {
            if (!formData.foremanVerified || !finalForemanSig) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาติ๊กรับทราบและลงลายเซ็น', 'warning'); return; }
            nextStatus = 'pending_hr'; 
        } else if (isCurrentUserChecker) {
            if (!formData.checkerVerified || !finalCheckerSig) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาติ๊กตรวจสอบและลงลายเซ็น', 'warning'); return; }
            nextStatus = 'pending_manager'; 
        } else if (isCurrentUserManager) {
            if (!formData.managerDecision) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือกผลการอนุมัติ', 'warning'); return; }
            if (formData.managerDecision === 'reject' && !formData.rejectReason) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุเหตุผล', 'warning'); return; }
            if (!finalManagerSig) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาลงลายเซ็น', 'warning'); return; }
            nextStatus = formData.managerDecision === 'approve' ? 'approved' : 'rejected';
        }

        const dataToSend = {
            stat_sick_used: Number(formData.stats.sick.taken) || 0,
            stat_sick_current: Number(formData.stats.sick.current) || 0,
            stat_sick_total: Number(formData.stats.sick.total) || 0,
            stat_personal_used: Number(formData.stats.personal.taken) || 0,
            stat_personal_current: Number(formData.stats.personal.current) || 0,
            stat_personal_total: Number(formData.stats.personal.total) || 0,
            
            // ✅ เข้ารหัส (Encrypt) ลายเซ็นก่อนส่งกลับไป Server
            ...(isCurrentUserForeman && { foremanVerified: formData.foremanVerified, foremanName: formData.foremanName, foremanPosition: formData.foremanPosition, foremanDate: formData.foremanDate, foremanSignature: encryptData(finalForemanSig) }),
            ...(isCurrentUserChecker && { checkerVerified: formData.checkerVerified, checkerName: formData.checkerName, checkerPosition: formData.checkerPosition, checkerDate: formData.checkerDate, checkerSignature: encryptData(finalCheckerSig) }),
            ...(isCurrentUserManager && { managerDecision: formData.managerDecision, rejectReason: formData.rejectReason, managerSignature: encryptData(finalManagerSig), managerName: formData.managerName, managerPosition: formData.managerPosition, approveDate: formData.approveDate }),
            
            status: nextStatus, 
        };

        setIsSubmitting(true);
        try {
            await API.patch(`/personalleaves/approve/${id}`, dataToSend);
            setFormData(prev => ({ 
                ...prev, ...dataToSend, 
                status: nextStatus, 
                // คืนค่า Signature แบบ Decrypted (Base64) เพื่อให้แสดงผลในหน้าจอได้ต่อเนื่อง
                checkerSignature: finalCheckerSig, 
                managerSignature: finalManagerSig, 
                foremanSignature: finalForemanSig 
            }));
            Swal.fire({ icon: 'success', title: 'สำเร็จ!', text: `สถานะเปลี่ยนเป็น: ${nextStatus}`, showConfirmButton: false, timer: 1500 })
                .then(() => {
                    if (userRole.toLowerCase() === 'hr') navigate('/hr');
                    else if (userRole.toLowerCase() === 'foreman') navigate('/fo');
                    else navigate('/admin');
                });
        } catch (err) { Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error'); } 
        finally { setIsSubmitting(false); }
    };

    const isApproverFieldDisabled = (section) => {
        const currentStatus = formData.status ? formData.status.toLowerCase() : 'pending';
        if (section === 'foreman') return !(isCurrentUserForeman && currentStatus === 'pending');
        if (section === 'checker') return !(isCurrentUserChecker && currentStatus === 'pending_hr');
        if (section === 'manager') return !(isCurrentUserManager && currentStatus === 'pending_manager');
        return true; 
    };

    const getStatusText = (s) => {
        switch(s) {
            case 'pending': return 'รอหัวหน้างานตรวจสอบ';
            case 'pending_hr': return 'รอ HR ตรวจสอบ';
            case 'pending_manager': return 'รอผู้บังคับบัญชาอนุมัติ';
            case 'approved': return 'อนุมัติเรียบร้อย';
            case 'rejected': return 'ไม่อนุมัติ';
            default: return s;
        }
    };

    if (isLoading || !formData) return <div style={{ padding: 80, textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;

    return (
    <div className="admin-leave-container">
        <style>{pageStyles}</style>

        <form onSubmit={handleSubmit} className="detailform">
            <div className="title">
                แบบใบลาป่วย ลากิจส่วนตัว
            </div>

            <div className="section-header">
                <div className="header-right">
                    <div className="row">
                        <span>เขียนที่</span> 
                        <input className="line" style={{ width: '300px', textAlign: 'center' }} value={formData.writtenAt || ""} disabled />
                    </div>
                    <div className="row">
                        <span>วันที่</span> 
                        {/* ✅ วันที่ไทย */}
                        <ThaiDatePicker value={formData.date} disabled={true} />
                    </div>
                </div>
                <div className="header-left">
                    <div className="row"><span>เรื่อง</span> <input className="line" value={formData.subject || ""} disabled /></div>
                    <div className="row">
                        <span>เรียน</span> 
                        <input className="line" style={{ width: '300px', textAlign: 'center' }} value={formData.to || ""} disabled />
                    </div>
                </div>
            </div>

            <hr className="divider" />

            {/* ✅ ส่วนข้อมูลพนักงาน */}
            <div className="section">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '5px' }}>ข้าพเจ้า</span>
                        <input className="line" style={{ width: '270px', textAlign: 'center' }} value={formData.employeeName || ""} disabled />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '5px' }}>ตำแหน่ง</span>
                        <input className="line" style={{ width: '270px', textAlign: 'center' }} value={formData.position || ""} disabled />
                    </div>
                </div>
                <div className="row">
                    <span>สังกัด</span> 
                    <input className="line" style={{ width: '300px', textAlign: 'center' }} value={formData.department || ""} disabled />
                </div>
            </div>

            <hr className="divider" />

            <div className="section">
                <p className="section-title">มีความประสงค์ขอลา</p>
                {['sick', 'personal'].map(type => (
                    <div key={type} className="row" style={{alignItems: 'flex-start'}}>
                        <label className="checkbox-label" style={{minWidth: '100px'}}>
                            <input type="checkbox" checked={formData.leaveType[type] || false} disabled />
                            {type === 'sick' ? 'ป่วย' : 'กิจส่วนตัว'} 
                        </label>
                        <input className="line medium" value={formData[`${type}Reason`] || ''} disabled placeholder="" />
                    </div>
                ))}
            </div>

            <div className="section">
                <div className="row">
                    <span>ตั้งแต่วันที่</span> 
                    <ThaiDatePicker value={formData.startDate} disabled={true} />
                    
                    <span>ถึงวันที่</span> 
                    <ThaiDatePicker value={formData.endDate} disabled={true} />
                    
                    <span>มีกำหนด</span> <input type="number" className="line tiny" value={formData.durationDays || 0} disabled /> วัน
                </div>
            </div>

            <hr className="divider" />

            <div className="section">
                <p className="section-title">ข้าพเจ้าเคยลาครั้งสุดท้าย</p>
                <div className="row">
                    {['sick', 'personal'].map(type => (
                        <label key={type} className="checkbox-label" style={{marginRight: '15px'}}>
                            <input type="checkbox" checked={formData.lastLeaveType[type] || false} disabled />
                            {type === 'sick' ? 'ป่วย' : type === 'personal' ? 'กิจส่วนตัว' : ''}
                        </label>
                    ))}
                </div>
                <div className="row">
                    <span>ครั้งสุดท้าย ตั้งแต่วันที่</span> 
                    <ThaiDatePicker value={formData.lastStartDate} disabled={true} />
                    
                    <span>ถึงวันที่</span> 
                    <ThaiDatePicker value={formData.lastEndDate} disabled={true} />
                    
                    <span>มีกำหนด</span> <input type="number" className="line tiny" value={formData.lastTotalDays || 0} disabled /> วัน
                </div>
            </div>

            <hr className="divider" />

            <div className="section">
                <div className="row"><span>ในระหว่างลาจะติดต่อข้าพเจ้าได้ที่</span> <input className="line full-width" value={formData.contact || ""} disabled /></div>
            </div>

            <hr className="divider" />

            {/* Signature User (View Only) */}
            <div className="signature-area">
                <div className="sign-block">
                    <span>(ลงชื่อ)</span>
                    {formData.signature ? <img src={formData.signature} alt="user signature" style={{width: '200px', height: '60px', objectFit: 'contain'}} /> : <div style={{height: '50px', display: 'flex', alignItems: 'center'}}>__________________________</div>}
                    <div className="row" style={{ justifyContent: 'center' }}>
                        ( <input className="line signature-input" value={formData.signName || ""} disabled /> )
                    </div>
                </div>
            </div>

            <hr className="divider" />

            {/* Stats Table */}
            <div className="stats-container">
                <table className="table">
                    <thead><tr><th>ประเภทการลา</th><th>ลามาแล้ว (วัน)</th><th>ลาครั้งนี้ (วัน)</th><th>รวมเป็น (วัน)</th></tr></thead>
                    <tbody>
                        {['sick','personal'].map(type => (
                            <tr key={type}>
                                <td>{type === 'sick' ? 'ป่วย' : 'กิจส่วนตัว'}</td>
                                <td><input type="number" name={`stats.${type}.taken`} value={formData.stats[type].taken || 0} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} /></td>
                                <td><input type="number" name={`stats.${type}.current`} value={formData.stats[type].current || 0} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} /></td>
                                <td><input type="number" value={formData.stats[type].total || 0} disabled /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <hr className="divider" />

            {/* Approval Section */}
            <div className="approval-section">
                
                {/* Foreman */}
                <div className="foreman-section" style={{ opacity: formData.status === 'pending' || formData.status === 'pending_hr' || formData.status === 'pending_manager' || formData.status === 'approved' || formData.status === 'rejected' ? 1 : 0.5 }}>
                    <h4>**ความเห็นหัวหน้างาน**</h4>
                    <div className="check-box">
                        <input type="checkbox" name="foremanVerified" checked={formData.foremanVerified} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')} /> 
                        รับทราบ / เห็นควรอนุญาต
                    </div>
                    <div className="sign-block">
                        <SignatureCanvas canvasRef={foremanCanvasRef} onClear={() => handleClearSignature('foreman')} onSave={() => handleSaveSignature('foreman')} label="(ลงชื่อ) หัวหน้างาน" signatureData={formData.foremanSignature} disabled={isApproverFieldDisabled('foreman')} />
                        <div className="row" style={{ justifyContent: 'center', marginTop: '10px' }}> 
                            (<input name="foremanName" className="line signature-input" value={formData.foremanName || ""} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')} />) 
                        </div>
                    </div>
                    <div className="row"><span>ตำแหน่ง</span> <input name="foremanPosition" className="line medium" value={formData.foremanPosition || ""} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')}/></div>
                    <div className="row">
                        <span>วันที่</span> 
                        <ThaiDatePicker name="foremanDate" value={formData.foremanDate} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')} className="line medium" />
                    </div>
                </div>

                {/* Checker */}
                <div className="checker-section" style={{ opacity: formData.status === 'pending' ? 0.5 : 1 }}>
                    <h4>**ความเห็นผู้ตรวจสอบ**</h4>
                    <div className="check-box">
                        <input type="checkbox" name="checkerVerified" checked={formData.checkerVerified} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} /> 
                        ตรวจสอบแล้ว ข้อมูลถูกต้อง
                    </div>
                    <div className="sign-block">
                        <SignatureCanvas canvasRef={checkerCanvasRef} onClear={() => handleClearSignature('checker')} onSave={() => handleSaveSignature('checker')} label="(ลงชื่อ) ผู้ตรวจสอบ" signatureData={formData.checkerSignature} disabled={isApproverFieldDisabled('checker')} />
                        <div className="row" style={{ justifyContent: 'center', marginTop: '10px' }}> 
                            (<input name="checkerName" className="line signature-input" value={formData.checkerName || ""} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} />) 
                        </div>
                    </div>
                    <div className="row"><span>ตำแหน่ง</span> <input name="checkerPosition" className="line medium" value={formData.checkerPosition || ""} onChange={handleChange} disabled={isApproverFieldDisabled('checker')}/></div>
                    <div className="row">
                        <span>วันที่</span> 
                        <ThaiDatePicker name="checkerDate" value={formData.checkerDate} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} className="line medium" />
                    </div>
                </div>

                {/* Manager */}
                <div className="commander-section" style={{ opacity: (formData.status === 'pending' || formData.status === 'pending_hr') ? 0.5 : 1 }}>
                    <h4>**คำสั่ง/ความเห็นผู้อำนวยการ**</h4>
                    <div className="radio-group">
                        <div className="check-box"><input type="radio" name="managerDecision" value="approve" checked={formData.managerDecision === 'approve'} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} /> อนุญาต</div>
                        <div className="check-box rejection-box" style={{alignItems: 'flex-start'}}>
                            <input type="radio" name="managerDecision" value="reject" checked={formData.managerDecision === 'reject'} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} style={{marginTop: '5px'}}/> 
                            <div style={{flex: 1}}>
                                ไม่อนุญาต เนื่องจาก <input name="rejectReason" className="line disapproval-reason full-width" style={{width: '90%'}} value={formData.rejectReason || ""} onChange={handleChange} disabled={isApproverFieldDisabled('manager') || formData.managerDecision !== 'reject'} />
                            </div>
                        </div>
                    </div>
                    <div className="sign-block">
                        <SignatureCanvas canvasRef={managerCanvasRef} onClear={() => handleClearSignature('manager')} onSave={() => handleSaveSignature('manager')} label="(ลงชื่อ) ผู้อำนวยการ" signatureData={formData.managerSignature} disabled={isApproverFieldDisabled('manager')} />
                        <div className="row" style={{ justifyContent: 'center', marginTop: '10px' }}> 
                            (<input name="managerName" className="line signature-input" value={formData.managerName || ""} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} />) 
                        </div>
                    </div>
                    <div className="row"><span>ตำแหน่ง</span> <input name="managerPosition" className="line medium" value={formData.managerPosition || ""} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} /></div>
                    <div className="row">
                        <span>วันที่</span> 
                        <ThaiDatePicker name="approveDate" value={formData.approveDate} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} className="line medium" />
                    </div>
                </div>
            </div>
        </form>
    </div>
    );
}