import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import CryptoJS from 'crypto-js'; 

// ✅ 2. กำหนด Secret Key
const SECRET_KEY = "secret_signature_key_for_encrypt_2026";

// ✅ 3. ฟังก์ชันเข้ารหัสและถอดรหัส
const encryptData = (text) => {
    if (!text) return "";
    try {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        return text;
    }
};

const decryptData = (cipherText) => {
    if (!cipherText) return "";
    if (cipherText.startsWith("data:image")) return cipherText;
    
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || cipherText; 
    } catch (error) {
        return cipherText;
    }
};

// ----------------------------------------------------------------------
// --- CSS Styles ---
// ----------------------------------------------------------------------
const pageStyles = `
@media screen { body { background: #f0f2f5; } }
.admin-vacation-container { display: flex; justify-content: center; padding: 20px; font-family: 'Sarabun', sans-serif; }
.detailform { width: 100%; max-width: 210mm; min-height: 297mm; background: white; padding: 40px 50px; color: #000; border: 1px solid #dcdcdc; box-shadow: 0 4px 15px rgba(0,0,0,0.1); box-sizing: border-box; line-height: 1.6; position: relative; }
.detailform .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #333; }
.status-badge { padding: 5px 12px; border-radius: 20px; font-weight: bold; color: white; font-size: 14px; display: inline-block; margin-left: 10px; vertical-align: middle; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.status-pending { background-color: #ffc107; color: #444; }
.status-pending_hr { background-color: #17a2b8; }
.status-pending_manager { background-color: #6610f2; }
.status-approved { background-color: #28a745; }
.status-rejected { background-color: #dc3545; }
.detailform .section-header { margin-bottom: 20px; display: flex; flex-direction: column; }
.detailform .header-right { display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 15px; }
.detailform .header-right .row { justify-content: flex-end; width: auto; }
.detailform .header-left { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
.detailform .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; text-decoration: underline; }
.detailform .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; font-size: 15px; }
.detailform .line { border: none; border-bottom: 1px dotted #333; padding: 2px 5px; outline: none; background: transparent; font-size: 15px; font-family: inherit; color: #000; transition: border-bottom 0.3s; }
.detailform .line:focus { border-bottom: 1px solid #007bff; }
.detailform .line:disabled { background: #fff; color: #000; opacity: 1; cursor: default; }
.line.tiny { width: 50px; text-align: center; }
.line.small { width: 220px; text-align: center; } 
.line.medium { width: 200px; }
.line.large { width: 250px; }
.line.full-width { flex: 1; min-width: 200px; }
.line.signature-input { width: 200px; text-align: center; margin-top: 5px; }
.detailform .radio-group { display: flex; flex-direction: column; align-items: flex-start; gap: 15px; margin-bottom: 15px; margin-left: 10px; width: 100%; }
.detailform .check-box { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.detailform input[type="checkbox"], .detailform input[type="radio"] { cursor: pointer; transform: scale(1.1); flex-shrink: 0; }
.detailform .rejection-box { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; width: 100%; }
.detailform .disapproval-reason { width: 250px; margin-left: 5px; }
.detailform .divider { border: none; border-top: 1px solid #e0e0e0; margin: 20px 0; }
.detailform .section { margin-bottom: 15px; }
.detailform .stats-container { margin: 20px 0; overflow-x: auto; }
.detailform .table { width: 100%; border-collapse: collapse; min-width: 400px; }
.detailform .table th, .detailform .table td { border: 1px solid #999; padding: 8px; text-align: center; font-size: 14px; }
.detailform .table th { background-color: #f8f9fa; font-weight: bold; white-space: nowrap; }
.detailform .table input { width: 90%; border: none; background: transparent; text-align: center; font-size: 14px; }
.detailform .signature-area { display: flex; justify-content: center; margin: 20px 0; }
.detailform .sign-block { text-align: center; display: flex; flex-direction: column; align-items: center; width: 100%; }
.canvas-container { background: #fff; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 5px; overflow: hidden; max-width: 100%; touch-action: none; }
.button-group { display: flex; gap: 10px; justify-content: center; }
.btn-clear, .btn-save { padding: 6px 15px; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; }
.btn-clear { background: #dc3545; color: white; }
.btn-save { background: #28a745; color: white; }
.detailform .approval-section { display: flex; justify-content: space-between; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
.detailform .foreman-section, .detailform .checker-section, .detailform .commander-section { width: 31%; min-width: 250px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #fcfcfc; box-sizing: border-box; flex-grow: 1; transition: opacity 0.3s; }
.detailform h4 { margin: 0 0 20px 0; text-align: center; text-decoration: underline; font-size: 16px; }
.submit-button-wrapper { display: flex; justify-content: center; margin-top: 30px; padding-bottom: 40px; }
.submit-btn { background: #007bff; color: white; border: none; padding: 12px 30px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background 0.2s; width: 100%; max-width: 300px; }
.submit-btn:hover:not(:disabled) { background: #0056b3; }
.submit-btn:disabled { background: #6c757d; cursor: not-allowed; }
@media screen and (max-width: 768px) {
  .admin-vacation-container { padding: 10px; }
  .detailform { padding: 20px 15px; width: 100%; min-height: auto; max-width: 100%; }
  .detailform .header-right { align-items: flex-start; width: 100%; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; }
  .detailform .header-right .row { justify-content: flex-start; width: 100%; }
  .detailform .approval-section { flex-direction: column; }
  .detailform .foreman-section, .detailform .checker-section, .detailform .commander-section { width: 100%; min-width: 0; }
}
@media print {
  body { background: white; }
  .admin-vacation-container { padding: 0; display: block; }
  .detailform { box-shadow: none; border: none; padding: 0; margin: 0 auto; width: 100%; max-width: 100%; min-height: auto; }
  .submit-button-wrapper, .button-group, nav, header, footer { display: none !important; }
  .canvas-container { border: none; }
  .approval-section { break-inside: avoid; }
}
`;

// --- API Configuration ---
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

API.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Component: Thai Date Picker ---
const ThaiDatePicker = ({ value, onChange, name, disabled, className = "line small" }) => {
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
            <input 
                className={className}
                value={toThaiDate(value)}
                disabled={disabled}
                readOnly 
                style={{ cursor: disabled ? 'default' : 'pointer', minWidth: '220px' }} 
            />
            {!disabled && (
                <input
                    type="date"
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
            )}
        </div>
    );
};

// --- Component: Signature Canvas ---
const SignatureCanvas = React.memo(({ canvasRef, onClear, onSave, label, signatureData, disabled = false }) => {
    const isDrawing = useRef(false);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
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
        const ctx = canvasRef.current.getContext('2d');
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y); ctx.stroke();
    };

    const stopDrawing = () => { isDrawing.current = false; };

    return (
        <div className="signature-control">
            <label className="sign-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{label}</label>
            <div className="canvas-container" style={{ position: 'relative', width: '100%', maxWidth: '250px', height: '100px', backgroundColor: '#fff', margin: '0 auto' }}>
                <canvas 
                    ref={canvasRef} className="signature-canvas" width="250" height="100"
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    style={{ display: signatureData ? 'none' : 'block', pointerEvents: disabled ? 'none' : 'auto', width: '100%', height: '100%' }}
                />
                {signatureData && (
                    <div className="signature-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={signatureData} alt="Signature" className="saved-signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                )}
            </div>
            {!disabled && (
                <div className="button-group" style={{ marginTop: '10px' }}>
                    <button type="button" onClick={onClear} className="btn-clear">ล้าง</button>
                    {!signatureData && <button type="button" onClick={onSave} className="btn-save">บันทึก</button>}
                </div>
            )}
        </div>
    );
});

// --- Initial State ---
const initialFormState = {
    writtenAt: '', date: new Date().toISOString().slice(0, 10), subject: 'ขอลาพักผ่อน', to: '', name: '', position: '', department: '',
    startDate: '', endDate: '', durationDays: 0, 
    vacationAccumulated: 0, vacationThisYear: 0, vacationTotal: 0, 
    stats: { vacation: { statsPreviousDays: 0, statsCurrentDays: 0, statsTotalDays: 0 } },
    contact: '', 
    foremanName: '', foremanPosition: '', foremanDate: '', foremanSignature: '', foremanVerified: false,
    checkerName: '', checkerPosition: '', checkerDate: '', checkerSignature: '', checkerVerified: false,
    managerName: '', managerPosition: '', managerSignature: '', managerDecision: '', approveDate: '', rejectReason: '',
    signName: '', signature: '', status: 'pending', userId: null 
};

// ----------------------------------------------------------------------
// --- MAIN COMPONENT ---
// ----------------------------------------------------------------------
export default function AdminLeaveDetailVacation() { 
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [userRole, setUserRole] = useState(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { return JSON.parse(userStr).role || ""; } catch (e) { return ""; }
        }
        return "";
    });
    
    const { id } = useParams(); 
    const navigate = useNavigate();

    const isCurrentUserForeman = userRole.toLowerCase() === 'foreman';
    const isCurrentUserChecker = userRole.toLowerCase() === 'hr'; 
    const isCurrentUserManager = userRole.toLowerCase() === 'manager' || userRole.toLowerCase() === 'admin'; 
    const isViewingMode = !(isCurrentUserForeman || isCurrentUserChecker || isCurrentUserManager); 
    
    const foremanCanvasRef = useRef(null); 
    const checkerCanvasRef = useRef(null); 
    const managerCanvasRef = useRef(null); 

    const getTodayDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; 
    };

    // --- Fetch Data ---
    useEffect(() => {
        if (!id) return;

        const fetchLeaveDetail = async () => {
            try {
                const res = await API.get(`/vacationleaves/admindetail/${id}`); 
                const apiData = Array.isArray(res.data) ? res.data[0] : res.data; 

                const sanitize = (val) => (val === null || val === undefined) ? '' : val;
                const duration = Number(apiData.durationDays) || 0;
                const userId = apiData.userId; 

                // --- 1. จัดการข้อมูล Stats ---
                let previousStats = Number(apiData.statsPreviousDays) || 0;
                
                // ✅ FIX: เช็ค status ก่อน ถ้า approved หรือ rejected แล้ว ห้ามไปดึงข้อมูลใหม่มาทับ
                // กรณี previousStats เป็น 0 ให้ลองไปดึงจากข้อมูลล่าสุด (เฉพาะเมื่อยังไม่อนุมัติ)
                if (previousStats === 0 && userId && apiData.status !== 'approved' && apiData.status !== 'rejected') {
                    try {
                        const statsRes = await API.get(`/vacationleaves/latest-stats/${userId}`);
                        const fetchedPrevious = Number(statsRes.data.lastTotalDays) || 0;
                        if (fetchedPrevious > 0) previousStats = fetchedPrevious;
                    } catch (statsErr) { console.warn("Stats fetch warning:", statsErr.message); }
                }

                let currentStats = Number(apiData.statsCurrentDays) || 0;

                // --- ✅ FIX Logic: บังคับค่าลาครั้งนี้ เท่ากับ จำนวนวันที่ลา (เฉพาะเมื่อยังไม่อนุมัติ/ปฏิเสธ) ---
                if (apiData.status !== 'approved' && apiData.status !== 'rejected') {
                    currentStats = duration;
                }
                // (ถ้า approved/rejected แล้ว จะข้าม block นี้ไป ใช้ค่าเดิมจาก DB)

                const totalStats = previousStats + currentStats;

                const mappedData = {
                    ...initialFormState,
                    ...apiData,
                    
                    writtenAt: sanitize(apiData.writtenAt),
                    date: apiData.date ? apiData.date.slice(0, 10) : '',
                    subject: sanitize(apiData.subject) || 'ขอลาพักผ่อน',
                    to: sanitize(apiData.to),
                    name: sanitize(apiData.name),
                    position: sanitize(apiData.position),
                    department: sanitize(apiData.department),
                    contact: sanitize(apiData.contact),
                    
                    startDate: apiData.startDate ? apiData.startDate.slice(0, 10) : '',
                    endDate: apiData.endDate ? apiData.endDate.slice(0, 10) : '',
                    
                    vacationAccumulated: sanitize(apiData.vacationAccumulated),
                    vacationThisYear: sanitize(apiData.vacationThisYear),
                    vacationTotal: sanitize(apiData.vacationTotal),
                    durationDays: duration,

                    foremanName: sanitize(apiData.foremanName),
                    foremanPosition: sanitize(apiData.foremanPosition),
                    foremanDate: apiData.foremanDate ? apiData.foremanDate.slice(0, 10) : '',
                    
                    checkerName: sanitize(apiData.checkerName),
                    checkerPosition: sanitize(apiData.checkerPosition),
                    checkerDate: apiData.checkerDate ? apiData.checkerDate.slice(0, 10) : '',
                    
                    managerName: sanitize(apiData.managerName),
                    managerPosition: sanitize(apiData.managerPosition),
                    approveDate: apiData.approveDate ? apiData.approveDate.slice(0, 10) : '',
                    rejectReason: sanitize(apiData.rejectReason),
                    
                    signName: sanitize(apiData.signName),
                    
                    // ✅ 4. ถอดรหัสลายเซ็น (Decrypt) ก่อนนำมาแสดง
                    signature: decryptData(apiData.signature),
                    foremanSignature: decryptData(apiData.foremanSignature),
                    checkerSignature: decryptData(apiData.checkerSignature),
                    managerSignature: decryptData(apiData.managerSignature),
                    
                    foremanVerified: apiData.foremanVerified === 1 || apiData.foremanVerified === true || apiData.foremanVerified === 'true',
                    checkerVerified: apiData.checkerVerified === 1 || apiData.checkerVerified === true || apiData.checkerVerified === 'true',
                    managerDecision: apiData.managerDecision === 'approve' ? 'approve' : (apiData.managerDecision === 'reject' ? 'reject' : apiData.status === 'approved' ? 'approve' : apiData.status === 'rejected' ? 'reject' : ''),
                    stats: {
                        vacation: { 
                            statsPreviousDays: previousStats, 
                            statsCurrentDays: currentStats, 
                            statsTotalDays: totalStats 
                        }
                    }
                };
                setFormData(mappedData);
            } catch (err) {
                console.error("Error fetching detail:", err);
                Swal.fire({ icon: 'error', title: 'Error', text: "ไม่สามารถดึงข้อมูลได้" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaveDetail();
    }, [id]);

    // --- Auto Date Fill Logic ---
    useEffect(() => {
        if (isLoading || !formData.userId) return;

        // ✅ FIX: เพิ่มเงื่อนไข ถ้าอนุมัติหรือปฏิเสธแล้ว ห้ามเติมวันที่เอง
        if (formData.status === 'approved' || formData.status === 'rejected') return;

        const today = getTodayDate();
        let updates = {};
        let hasUpdates = false;

        if (isCurrentUserForeman && formData.status === 'pending' && !formData.foremanDate) {
            updates.foremanDate = today;
            hasUpdates = true;
        }
        if (isCurrentUserChecker && formData.status === 'pending_hr' && !formData.checkerDate) {
            updates.checkerDate = today;
            hasUpdates = true;
        }
        if (isCurrentUserManager && formData.status === 'pending_manager' && !formData.approveDate) {
            updates.approveDate = today;
            hasUpdates = true;
        }

        if (hasUpdates) {
            setFormData(prev => ({ ...prev, ...updates }));
        }
    }, [isLoading, formData.status, formData.userId, formData.foremanDate, formData.checkerDate, formData.approveDate, isCurrentUserForeman, isCurrentUserChecker, isCurrentUserManager]);

    // Handlers
    const handleClearSignature = useCallback((type) => {
        let canvasRef, fieldName;
        if (type === 'manager') { canvasRef = managerCanvasRef; fieldName = 'managerSignature'; }
        else if (type === 'checker') { canvasRef = checkerCanvasRef; fieldName = 'checkerSignature'; }
        else if (type === 'foreman') { canvasRef = foremanCanvasRef; fieldName = 'foremanSignature'; }
        else return;

        setFormData(prev => ({ ...prev, [fieldName]: "" })); 
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, []);

    const handleSaveSignature = useCallback((type) => {
        let canvasRef, fieldName;
        if (type === 'manager') { canvasRef = managerCanvasRef; fieldName = 'managerSignature'; }
        else if (type === 'checker') { canvasRef = checkerCanvasRef; fieldName = 'checkerSignature'; }
        else if (type === 'foreman') { canvasRef = foremanCanvasRef; fieldName = 'foremanSignature'; }
        else return;
        
        if (canvasRef.current) {
            const dataURL = canvasRef.current.toDataURL('image/png');
            setFormData(prev => ({ ...prev, [fieldName]: dataURL }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('stats')) {
             const [_, leaveType, field] = name.split('.'); 
             setFormData(prev => {
                const currentStats = prev.stats[leaveType] || {};
                const updatedLeaf = { ...currentStats, [field]: value };
                if (field === 'statsPreviousDays' || field === 'statsCurrentDays') {
                    const prevDays = field === 'statsPreviousDays' ? Number(value) : Number(currentStats.statsPreviousDays || 0);
                    const currDays = field === 'statsCurrentDays' ? Number(value) : Number(currentStats.statsCurrentDays || 0);
                    updatedLeaf.statsTotalDays = prevDays + currDays;
                }
                return { ...prev, stats: { ...prev.stats, [leaveType]: updatedLeaf } };
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isCurrentUserForeman && formData.status !== 'pending') {
             Swal.fire({ icon: 'error', title: 'ผิดขั้นตอน', text: "หัวหน้างานอนุมัติไปแล้ว หรือไม่อยู่ในขั้นตอนของท่าน" }); return;
        }
        if (isCurrentUserChecker && formData.status !== 'pending_hr') {
             Swal.fire({ icon: 'error', title: 'ผิดขั้นตอน', text: "ต้องรอหัวหน้างานอนุมัติก่อน หรือไม่อยู่ในขั้นตอนของท่าน" }); return;
        }
        if (isCurrentUserManager && formData.status !== 'pending_manager') {
             Swal.fire({ icon: 'error', title: 'ผิดขั้นตอน', text: "ต้องรอ HR ตรวจสอบก่อน หรือไม่อยู่ในขั้นตอนของท่าน" }); return;
        }

        let finalForemanSignature = formData.foremanSignature; 
        let finalCheckerSignature = formData.checkerSignature;
        let finalManagerSignature = formData.managerSignature;

        if (isCurrentUserForeman && !finalForemanSignature && foremanCanvasRef.current && !isCanvasBlank(foremanCanvasRef.current)) {
            finalForemanSignature = foremanCanvasRef.current.toDataURL('image/png');
        }
        if (isCurrentUserChecker && !finalCheckerSignature && checkerCanvasRef.current && !isCanvasBlank(checkerCanvasRef.current)) {
            finalCheckerSignature = checkerCanvasRef.current.toDataURL('image/png');
        }
        if (isCurrentUserManager && !finalManagerSignature && managerCanvasRef.current && !isCanvasBlank(managerCanvasRef.current)) {
            finalManagerSignature = managerCanvasRef.current.toDataURL('image/png');
        }

        if (isCurrentUserForeman && (!formData.foremanVerified || !finalForemanSignature)) {
            Swal.fire('ข้อมูลไม่ครบ', 'กรุณาติ๊กรับทราบและลงลายเซ็น', 'warning'); return;
        }
        if (isCurrentUserChecker && (!formData.checkerVerified || !finalCheckerSignature)) {
            Swal.fire('ข้อมูลไม่ครบ', 'กรุณาติ๊กตรวจสอบและลงลายเซ็น', 'warning'); return;
        }
        if (isCurrentUserManager) {
            if (!formData.managerDecision) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือกผลการอนุมัติ', 'warning'); return; }
            if (formData.managerDecision === 'reject' && !formData.rejectReason) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุเหตุผลที่ไม่อนุมัติ', 'warning'); return; }
            if (!finalManagerSignature) { Swal.fire('ข้อมูลไม่ครบ', 'กรุณาลงลายเซ็น', 'warning'); return; }
        }

        let nextStatus = formData.status;
        if (isCurrentUserForeman) nextStatus = 'pending_hr'; 
        else if (isCurrentUserChecker) nextStatus = 'pending_manager'; 
        else if (isCurrentUserManager) nextStatus = formData.managerDecision === 'approve' ? 'approved' : 'rejected'; 

        const dataToSend = {
            statsPreviousDays: Number(formData.stats.vacation.statsPreviousDays),
            statsCurrentDays: Number(formData.stats.vacation.statsCurrentDays),
            statsTotalDays: Number(formData.stats.vacation.statsTotalDays),
            
            // ✅ 5. เข้ารหัส (Encrypt) ลายเซ็นก่อนส่งไป API
            ...(isCurrentUserForeman && { 
                foremanVerified: formData.foremanVerified, 
                foremanName: formData.foremanName, 
                foremanPosition: formData.foremanPosition, 
                foremanDate: formData.foremanDate, 
                foremanSignature: encryptData(finalForemanSignature) // Encrypt
            }),
            ...(isCurrentUserChecker && { 
                checkerVerified: formData.checkerVerified, 
                checkerName: formData.checkerName, 
                checkerPosition: formData.checkerPosition, 
                checkerDate: formData.checkerDate, 
                checkerSignature: encryptData(finalCheckerSignature) // Encrypt
            }),
            ...(isCurrentUserManager && { 
                managerDecision: formData.managerDecision, 
                rejectReason: formData.rejectReason, 
                managerSignature: encryptData(finalManagerSignature), // Encrypt
                managerName: formData.managerName, 
                managerPosition: formData.managerPosition, 
                approveDate: formData.approveDate 
            }),

            status: nextStatus
        };

        setIsSubmitting(true);
        try {
            await API.patch(`/vacationleaves/approve/${id}`, dataToSend); 
            setFormData(prev => ({ 
                ...prev, ...dataToSend, 
                // คืนค่าเป็น Base64 (Decrypted) เพื่อแสดงผลต่อเนื่อง
                foremanSignature: finalForemanSignature,
                checkerSignature: finalCheckerSignature,
                managerSignature: finalManagerSignature,
                status: nextStatus
            }));

            Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ!', text: `ส่งต่อสถานะเป็น: ${nextStatus}`, timer: 2000, showConfirmButton: false })
                .then(() => {
                    if (userRole.toLowerCase() === 'hr') navigate('/hr');
                    else if (userRole.toLowerCase() === 'foreman') navigate('/fo');
                    else navigate('/admin');
                });
        } catch (err) {
            console.error("Error:", err); 
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isApproverFieldDisabled = (section) => {
        const currentStatus = formData.status;
        if (section === 'foreman') return !(isCurrentUserForeman && currentStatus === 'pending');
        if (section === 'checker') return !(isCurrentUserChecker && currentStatus === 'pending_hr');
        if (section === 'manager') return !(isCurrentUserManager && currentStatus === 'pending_manager');
        return true; 
    };

    const getStatusText = (s) => {
        switch(s) {
            case 'pending': return 'รอหัวหน้างานอนุมัติ';
            case 'pending_hr': return 'รอ HR ตรวจสอบ';
            case 'pending_manager': return 'รอผู้บังคับบัญชาอนุมัติ';
            case 'approved': return 'อนุมัติเรียบร้อย';
            case 'rejected': return 'ไม่อนุมัติ';
            default: return s;
        }
    };

    const isTableStatsDisabled = isApproverFieldDisabled('foreman') && isApproverFieldDisabled('checker');

    if (isLoading || !formData) return <div style={{ padding: 80, textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;

    return (
    <div className="admin-vacation-container">
        <style>{pageStyles}</style>

        <form onSubmit={handleSubmit} className="detailform">
            <div className="title">
                ใบลาพักผ่อน 
                <span className={`status-badge status-${formData.status}`}>
                    {getStatusText(formData.status)}
                </span>
            </div>

            <div className="section-header">
                <div className="header-right">
                    <div className="row"><span>เขียนที่</span> <input className="line"style={{width: '300px', textAlign: 'center'}} value={formData.writtenAt} disabled /></div>
                    <div className="row">
                        <span>วันที่</span> 
                        <ThaiDatePicker value={formData.date} disabled={true} />
                    </div>
                </div>
                <div className="header-left">
                    <div className="row"><span>เรื่อง</span> <input className="line" value={formData.subject} disabled /></div>
                    <div className="row"><span>เรียน</span> <input className="line"style={{width: '300px', textAlign: 'center'}} value={formData.to} disabled /></div>
                </div>
            </div>

            <hr className="divider" />
            
            <div className="section">
                <div className="row">
                    <span>ข้าพเจ้า</span> <input className="line large" value={formData.name} disabled />
                    <span>ตำแหน่ง</span> <input className="line medium" value={formData.position} disabled />
                </div>
                <div className="row"><span>สังกัด</span> <input className="line full-width" value={formData.department} disabled /></div>
            </div>

            <hr className="divider" />

            <div className="section day-stats-row">
                <div className="row">
                    <span>มีวันลาพักผ่อนสะสม</span> <input className="line"style={{width: '80px', textAlign: 'center'}} value={formData.vacationAccumulated} disabled /> วันทำการ
                    <span>มีสิทธิลาพักผ่อนประจำปีนี้อีก</span> <input className="line"style={{width: '80px', textAlign: 'center'}} value={formData.vacationThisYear} disabled /> วันทำการ
                    <span>รวมเป็น</span> <input className="line tiny" value={formData.vacationTotal} disabled /> วันทำการ
                </div>
            </div>
            
            <div className="section leave-duration-area">
                <div className="row">
                    <span>ขอลาพักผ่อนตั้งแต่วันที่</span> 
                    <ThaiDatePicker value={formData.startDate} disabled={true} />
                    
                    <span>ถึงวันที่</span> 
                    <ThaiDatePicker value={formData.endDate} disabled={true} />
                    
                    <span>มีกำหนด</span> <input type="number" className="line tiny" value={formData.durationDays} disabled /> วัน
                </div>
            </div>

            <hr className="divider" />
             <div className="section contact-area">
                <div className="row"><span>ในระหว่างลาจะติดต่อข้าพเจ้าได้ที่</span> <input className="line full-width" value={formData.contact} disabled /></div>
            </div>

            <hr className="divider" />
            
            <div className="signature-area">
                <div className="sign-block">
                    <span>(ลงชื่อ)</span>
                    {formData.signature ? <img src={formData.signature} alt="user signature" style={{ width: "250px", height: "80px", objectFit: "contain", display: "block", marginTop: "5px" }} /> : <span>__________________________</span>}
                    <div>( <input className="line small signature-input" value={formData.signName} disabled /> )</div>
                </div>
            </div>
            
            <hr className="divider" />

            <div className="stats-container">
                <table className="table">
                    <thead><tr><th>ลามาแล้ว (วัน)</th><th>ลาครั้งนี้ (วัน)</th><th>รวมเป็น (วัน)</th></tr></thead>
                    <tbody>
                        <tr>
                            <td><input type="number" name="stats.vacation.statsPreviousDays" value={formData.stats.vacation.statsPreviousDays} onChange={handleChange} disabled={isTableStatsDisabled} /></td>
                            <td><input type="number" name="stats.vacation.statsCurrentDays" value={formData.stats.vacation.statsCurrentDays} onChange={handleChange} disabled={isTableStatsDisabled} /></td>
                            <td><input type="number" value={formData.stats.vacation.statsTotalDays} disabled /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <hr className="divider" />

            <div className="approval-section">
                {/* 1. Foreman Section */}
                <div className="foreman-section" style={{ opacity: formData.status === 'pending' || formData.status === 'pending_hr' || formData.status === 'pending_manager' || formData.status === 'approved' || formData.status === 'rejected' ? 1 : 0.5 }}>
                    <h4>**ความเห็นหัวหน้างาน**</h4>
                    <div className="check-box">
                        <input type="checkbox" name="foremanVerified" checked={formData.foremanVerified} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')} /> 
                        รับทราบ
                    </div>
                    <div className="sign-block" style={{ margin: '15px 0' }}>
                        <SignatureCanvas canvasRef={foremanCanvasRef} onClear={() => handleClearSignature('foreman')} onSave={() => handleSaveSignature('foreman')} label="(ลงชื่อ) หัวหน้างาน" signatureData={formData.foremanSignature} disabled={isApproverFieldDisabled('foreman')} />
                        <div className="row" style={{ justifyContent: 'center' }}> (<input name="foremanName" className="line signature-input" value={formData.foremanName} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')} />) </div>
                    </div>
                    <div className="row"><span>ตำแหน่ง</span> <input name="foremanPosition" className="line medium" value={formData.foremanPosition} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')} /></div>
                    <div className="row">
                        <span>วันที่</span> 
                        <ThaiDatePicker name="foremanDate" value={formData.foremanDate} onChange={handleChange} disabled={isApproverFieldDisabled('foreman')} className="line medium" />
                    </div>
                </div>

                {/* 2. Checker Section (HR) */}
                <div className="checker-section" style={{ opacity: formData.status === 'pending' ? 0.5 : 1 }}>
                    <h4>**ความเห็นผู้ตรวจสอบ**</h4>
                    <div className="check-box">
                        <input type="checkbox" name="checkerVerified" checked={formData.checkerVerified} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} /> 
                        ตรวจสอบแล้ว ข้อมูลถูกต้อง
                    </div>
                    <div className="sign-block" style={{ margin: '15px 0' }}>
                        <SignatureCanvas canvasRef={checkerCanvasRef} onClear={() => handleClearSignature('checker')} onSave={() => handleSaveSignature('checker')} label="(ลงชื่อ) ผู้ตรวจสอบ" signatureData={formData.checkerSignature} disabled={isApproverFieldDisabled('checker')} />
                        <div className="row" style={{ justifyContent: 'center' }}> (<input name="checkerName" className="line signature-input" value={formData.checkerName} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} />) </div>
                    </div>
                    <div className="row"><span>ตำแหน่ง</span> <input name="checkerPosition" className="line medium" value={formData.checkerPosition} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} /></div>
                    <div className="row">
                        <span>วันที่</span> 
                        <ThaiDatePicker name="checkerDate" value={formData.checkerDate} onChange={handleChange} disabled={isApproverFieldDisabled('checker')} className="line medium" />
                    </div>
                </div>

                {/* 3. Manager Section */}
                <div className="commander-section" style={{ opacity: (formData.status === 'pending' || formData.status === 'pending_hr') ? 0.5 : 1 }}>
                    <h4>**คำสั่ง/ความเห็นผู้บังคับบัญชา**</h4>
                    <div className="radio-group">
                        <div className="check-box">
                            <input type="radio" name="managerDecision" value="approve" checked={formData.managerDecision === 'approve'} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} /> 
                            อนุญาต
                        </div>
                        <div className="check-box rejection-box">
                            <input type="radio" name="managerDecision" value="reject" checked={formData.managerDecision === 'reject'} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} /> 
                            ไม่อนุญาต เนื่องจาก <input name="rejectReason" className="line disapproval-reason" value={formData.rejectReason} onChange={handleChange} disabled={isApproverFieldDisabled('manager') || formData.managerDecision !== 'reject'} />
                        </div>
                    </div>

                    <div className="sign-block" style={{ margin: '15px 0' }}>
                        <SignatureCanvas canvasRef={managerCanvasRef} onClear={() => handleClearSignature('manager')} onSave={() => handleSaveSignature('manager')} label="(ลงชื่อ) ผู้บังคับบัญชา" signatureData={formData.managerSignature} disabled={isApproverFieldDisabled('manager')} />
                        <div className="row" style={{ justifyContent: 'center' }}> (<input name="managerName" className="line signature-input" value={formData.managerName} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} />) </div>
                    </div>
                    <div className="row"><span>ตำแหน่ง</span> <input name="managerPosition" className="line medium" value={formData.managerPosition} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} /></div>
                    <div className="row">
                        <span>วันที่</span> 
                        <ThaiDatePicker name="approveDate" value={formData.approveDate} onChange={handleChange} disabled={isApproverFieldDisabled('manager')} className="line medium" />
                    </div>
                </div>
            </div>
            
            <div className="submit-button-wrapper">
                <button className="submit-btn" type="submit" disabled={isSubmitting || isViewingMode || isApproverFieldDisabled(isCurrentUserForeman ? 'foreman' : isCurrentUserChecker ? 'checker' : 'manager')}>
                    {isSubmitting ? '⏳ กำลังบันทึก...' : '💾 บันทึกและส่งต่อ'}
                </button>
            </div>
        </form>
    </div>
    );
}