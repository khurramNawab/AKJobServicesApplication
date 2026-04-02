import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar';
import AdminTopbar from '../admin/AdminTopbar';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, loading } = React.useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (loading) return null;

  // STRICT ACCESS: Only admins can even mount this layout
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex overflow-hidden">
      
      {/* 🔳 Isolated Admin Sidebar */}
      <AdminSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        // Note: activeTab logic and setTab will now be handled via nested routes (e.g. /admin/users)
      />

      {/* 🖥️ Admin Command Sector */}
      <main className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${collapsed ? 'ml-[80px]' : 'ml-[260px]'}`}>
        
        {/* 🧭 Top operational Header */}
        <AdminTopbar adminUser={user} />

        {/* 📄 Dynamic Content (Admin Modules) */}
        <div className="flex-1 p-10 overflow-y-auto no-scrollbar bg-[#0F172A]">
          <Outlet />
        </div>

      </main>

      {/* Global Admin Styles Overlay (Localized here instead of page as it's the root of Admin) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default AdminLayout;
