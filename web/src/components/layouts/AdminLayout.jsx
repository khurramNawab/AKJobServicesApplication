import React, { useState, useContext } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
  const { user, loading } = useContext(AuthContext);
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (loading) return null;

  // STRICT ACCESS: Only admins can even mount this layout
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className={`min-h-screen flex overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0A1628] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>

      {/* 🔳 Isolated Admin Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        theme={theme}
      />

      {/* 🖥️ Admin Command Sector */}
      <main className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${collapsed ? 'ml-[72px]' : 'ml-[256px]'}`}>

        {/* 🧭 Top operational Header */}
        <AdminTopbar adminUser={user} theme={theme} />

        {/* 📄 Dynamic Content (Admin Modules) */}
        <div className={`flex-1 p-8 overflow-y-auto no-scrollbar transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0A1628]' : 'bg-[#F8FAFC]'}`}>
          <Outlet />
        </div>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default AdminLayout;
