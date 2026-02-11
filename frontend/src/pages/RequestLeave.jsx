import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LeaveTypeSelector() {

    const nav = useNavigate();

    // --- ✅ URL รูปภาพ (เปลี่ยนรูปแรกเป็นโรงพยาบาล) ---
    
    // รูป 1: โรงพยาบาล (สื่อถึง ลาป่วย)
    const generalImg = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=500&auto=format&fit=crop"; 
    
    // รูป 2: ชายหาด/ท่องเที่ยว (สื่อถึง ลาพักผ่อน)
    const vacationImg = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop";


    // --- Styles ---

    const containerStyle = {
        maxWidth: 800,
        margin: '60px auto',
        textAlign: 'center',
        fontFamily: "'Sarabun', sans-serif"
    };

    const titleStyle = {
        fontSize: 32,
        marginBottom: 40,
        fontWeight: 800,
        color: '#1f2937'
    };

    const cardsContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        flexWrap: 'wrap'
    };

    const cardBaseStyle = {
        width: '280px',
        height: '350px',
        borderRadius: '24px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '4px solid transparent'
    };

    // Layer สีดำโปร่งแสง (ปรับให้เข้มขึ้นเพื่อให้ตัวหนังสือชัด)
    const overlayStyle = {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '30px 20px',
        color: '#ffffff'
    };

    const cardTitleStyle = {
        margin: 0,
        fontSize: '26px',
        fontWeight: 700,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        letterSpacing: '0.5px'
    };

    const cardSubtitleStyle = {
        margin: '8px 0 0',
        fontSize: '15px',
        opacity: 0.95,
        fontWeight: 400,
        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>
                เลือกประเภทการลา
            </h2>
            
            <div style={cardsContainerStyle}>

                {/* --- Card 1: ลากิจ / ลาป่วย (รูปโรงพยาบาล) --- */}
                <div 
                    style={{ ...cardBaseStyle, backgroundImage: `url(${generalImg})` }}
                    onClick={() => nav('/request-personal')}
                    onMouseOver={(e) => { 
                        e.currentTarget.style.transform = 'translateY(-10px)'; 
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.4)'; 
                        e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseOut={(e) => { 
                        e.currentTarget.style.transform = 'translateY(0)'; 
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; 
                        e.currentTarget.style.borderColor = 'transparent'; 
                    }}
                >
                    <div style={overlayStyle}>
                        <h3 style={cardTitleStyle}>📄 ลากิจ / ลาป่วย</h3>
                        <p style={cardSubtitleStyle}>ลาป่วย ลากิจธุระ หรืออื่นๆ</p>
                    </div>
                </div>

                {/* --- Card 2: ลาพักผ่อน (รูปทะเล) --- */}
                <div 
                    style={{ ...cardBaseStyle, backgroundImage: `url(${vacationImg})` }}
                    onClick={() => nav('/request-vacation')}
                    onMouseOver={(e) => { 
                        e.currentTarget.style.transform = 'translateY(-10px)'; 
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.4)'; 
                        e.currentTarget.style.borderColor = '#10b981';
                    }}
                    onMouseOut={(e) => { 
                        e.currentTarget.style.transform = 'translateY(0)'; 
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; 
                        e.currentTarget.style.borderColor = 'transparent'; 
                    }}
                >
                    <div style={overlayStyle}>
                        <h3 style={cardTitleStyle}>🏖️ ลาพักผ่อน</h3>
                        <p style={cardSubtitleStyle}>ใช้วันหยุดพักร้อนประจำปี</p>
                    </div>
                </div>

            </div>
        </div>
    );
}