import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Pages Imports ---
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestLeave from './pages/RequestLeave'; 
import AdminPanel from './pages/AdminPanel';
import HRPage from './pages/HRPage';
import AdminCalendar from './pages/AdminCalendar';
import DashboardLayout from './pages/DashboardLayout'; 
import PersonalLeave from './pages/PersonalLeave';
import VacationLeave from './pages/VacationLeave';
import LeaveDetailVacation from './pages/LeaveDetailVacation';
import LeaveDetail from "./pages/LeaveDetail";
import AdminLeaveDetail from "./pages/AdminLeaveDetail";
import AdminLeaveDetailVacation from "./pages/AdminLeaveDetailVacation";
import HRtable from "./pages/HRtable";
import LeaveDetailA4 from "./pages/LeaveDetailA4";
import LeaveDetailVacationA4 from "./pages/LeaveDetailVacationA4";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardHR from "./pages/DashboardHR";
import AddEmployee from "./pages/AddEmployee";
import UserManagement from "./pages/UserManagement";
import EditEmployee from "./pages/EditEmployee";
import Profile from "./pages/Profile"; // ✅ 1. เพิ่ม Import หน้า Profile
import DashboardForeman from "./pages/DashboardForeman";
import ForemanPanel from "./pages/ForemanPanel";
import ForemanCalendar from "./pages/ForemanCalendar";
import SidebarLayout from './components/SidebarLayout';
import HRCalendar from './pages/HRCalendar';
// ✅ ตรวจสอบ token สำหรับ PrivateRoute
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      
      {/* ========================================= */}
      {/* 1. Public Routes (ไม่ต้องมี Sidebar)      */}
      {/* ========================================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ========================================= */}
      {/* 2. Protected Routes (มี Sidebar)          */}
      {/* ========================================= */}
      
      {/* ใช้ SidebarLayout ครอบ Route ทั้งหมดที่ต้องการเมนูซ้าย */}
      <Route element={<SidebarLayout />}>
        
        {/* User Pages */}
        <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /> 
        
        <Route path="/request" element={<PrivateRoute><RequestLeave /></PrivateRoute>} /> 
        <Route path="/request-personal" element={<PrivateRoute><PersonalLeave /></PrivateRoute>} />
        <Route path="/request-vacation" element={<PrivateRoute><VacationLeave /></PrivateRoute>} />
        <Route path="/das" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* Detail Pages (User View) */}
        <Route path="/personalleaves/:id" element={<PrivateRoute><LeaveDetail /></PrivateRoute>} />
        <Route path="/vacationleaves/:id" element={<PrivateRoute><LeaveDetailVacation /></PrivateRoute>} />

        {/* Admin Pages */}
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/admin/calendar" element={<PrivateRoute><AdminCalendar /></PrivateRoute>} />
        <Route path="/admin/personalleaves/:id" element={<PrivateRoute><AdminLeaveDetail /></PrivateRoute>} />
        <Route path="/admin/vacationleaves/:id" element={<PrivateRoute><AdminLeaveDetailVacation /></PrivateRoute>} />
        <Route path="/admin/dasadmin" element={<PrivateRoute><DashboardAdmin /></PrivateRoute>} />

        {/* HR Pages */}
        <Route path="/HR" element={<PrivateRoute><HRPage /></PrivateRoute>} />
        <Route path="/HRtable" element={<PrivateRoute><HRtable /></PrivateRoute>} />
        <Route path="/dasHR" element={<PrivateRoute><DashboardHR /></PrivateRoute>} />
        <Route path="/hr/add" element={<PrivateRoute><AddEmployee /></PrivateRoute>} />
        <Route path="/hr/Manage" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/hr/personalleaves/:id" element={<PrivateRoute><AdminLeaveDetail /></PrivateRoute>} />
        <Route path="/hr/vacationleaves/:id" element={<PrivateRoute><AdminLeaveDetailVacation /></PrivateRoute>} />
        <Route path="/foreman/calendar" element={<PrivateRoute><ForemanCalendar /></PrivateRoute>} />
        {/* HR Print/View A4 Pages */}
        <Route path="/hr/personalleavesdetail/:id" element={<PrivateRoute><LeaveDetailA4 /></PrivateRoute>} />
        <Route path="/hr/vacationleavesdetail/:id" element={<PrivateRoute><LeaveDetailVacationA4 /></PrivateRoute>} />
        <Route path="/hr/edit/:id" element={<PrivateRoute><EditEmployee /></PrivateRoute>} />
        <Route path="/dasF" element={<PrivateRoute><DashboardForeman /></PrivateRoute>} />
        <Route path="/fo" element={<PrivateRoute><ForemanPanel /></PrivateRoute>} />
        <Route path="/hr/calendar" element={<PrivateRoute><HRCalendar /></PrivateRoute>} />
      </Route>

    </Routes>
  );
}