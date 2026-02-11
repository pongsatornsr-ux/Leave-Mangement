import React, { useState } from 'react'
import API from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/auth/register', { name, email, password, role })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      nav('/')
    } catch (err) {
      alert(err.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #ffffffff, #9333ea)"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 450,
        background: "#fff",
        padding: "32px 28px",
        borderRadius: 16,
        boxShadow: "0 12px 35px rgba(0,0,0,0.1)",
        animation: "fadeIn 0.4s ease"
      }}>
        
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 20,
          textAlign: "center",
          color: "#1e293b"
        }}>
          สมัครสมาชิก
        </h2>

        <form onSubmit={onSubmit}>
          
          <label style={{ fontWeight: 600 }}>ชื่อ - นามสกุล</label>
          <input
            style={inputStyle}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="กรอกชื่อ-นามสกุล"
          />

          <label style={{ fontWeight: 600 }}>อีเมล</label>
          <input
            style={inputStyle}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@email.com"
          />

          <label style={{ fontWeight: 600 }}>รหัสผ่าน</label>
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <label style={{ fontWeight: 600 }}>สิทธิ์ผู้ใช้งาน</label>
          <select
            style={inputStyle}
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="user">User</option>
          </select>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: 14,
              background: "linear-gradient(90deg, #2563eb, #4f46e5)",
              border: "none",
              color: "#fff",
              fontSize: 16,
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s"
            }}
            onMouseOver={(e) => e.target.style.opacity = "0.9"}
            onMouseOut={(e) => e.target.style.opacity = "1"}
          >
            สมัครสมาชิก
          </button>

        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "6px 0 16px",
  borderRadius: 10,
  border: "1.5px solid #d1d5db",
  fontSize: 15,
  outline: "none",
  transition: "0.2s",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
}
