import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Outlet, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layout/AdminLayout";
import InquiriesPage from "./pages/InquiriesPage";
import BikesPage from "./pages/BikesPage";
import MembersPage from "./pages/MembersPage";

// Placeholder for DashboardPage if it doesn't exist yet
const AdminDashboardPage = () => <div>관리자 대시보드</div>;

const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin" replace />;
};

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminLoggedIn(true);
    } else {
      setAdminLoggedIn(false);
      // Optional: If you want to redirect to login if no token on initial load
      // navigate('/admin', { replace: true });
    }
  }, []);

  const handleAdminLoginSuccess = (token, userId) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminId', userId);
    setAdminLoggedIn(true);
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    setAdminLoggedIn(false);
    navigate('/admin/login', { replace: true });
  };

  if (!adminLoggedIn) {
    if (location.pathname === '/admin/login') {
      return <LoginPage onLoginSuccess={handleAdminLoginSuccess} />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout onLogout={handleAdminLogout} />}>
        {/* Default route for /admin, redirect to dashboard if logged in */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
        <Route path="inquiries" element={<ProtectedAdminRoute><InquiriesPage /></ProtectedAdminRoute>} />
        <Route path="bikes" element={<ProtectedAdminRoute><BikesPage /></ProtectedAdminRoute>} />
        <Route path="members" element={<ProtectedAdminRoute><MembersPage /></ProtectedAdminRoute>} />
        {/* Catch-all for any unmatched admin sub-routes, redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
