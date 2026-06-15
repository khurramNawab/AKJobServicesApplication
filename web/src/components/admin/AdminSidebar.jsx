import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Settings,
  BarChart,
  ShieldCheck,
  Radio,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';

import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const { logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'overview',       label: 'Dashboard',     icon: LayoutDashboard, path: '' },
    { id: 'users',          label: 'User Directory', icon: Users,           path: 'users' },
    { id: 'jobs',           label: 'Jobs Moderator', icon: Briefcase,       path: 'jobs' },
    { id: 'applications',   label: 'Applications',   icon: FileText,        path: 'applications' },
    { id: 'subscriptions',  label: 'Subscriptions',  icon: Sparkles,        path: 'subscriptions' },
    { id: 'payments',       label: 'Payments',       icon: CreditCard,      path: 'payments' },
    { id: 'reports',        label: 'Reports',        icon: BarChart,        path: 'reports' },
    { id: 'broadcast',      label: 'Broadcaster',    icon: Radio,           path: 'broadcast' },
    { id: 'settings',       label: 'Settings',       icon: Settings,        path: 'settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? '72px' : '256px' }}
      className="fixed left-0 top-0 h-screen bg-[#0A1628] border-r border-[rgba(255,255,255,0.06)] z-50 flex flex-col"
      style={{ transition: 'width 0.25s ease' }}
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)]">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="w-7 h-7 bg-[#4F8EF7] rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight text-sm whitespace-nowrap">Admin Matrix</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-[#4F8EF7] rounded-lg flex items-center justify-center mx-auto">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-white/[0.05] text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === ''}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative
              ${isActive
                ? 'admin-sidebar-active'
                : 'text-text-muted hover:bg-white/[0.04] hover:text-text-secondary'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={`flex-shrink-0 ${isActive ? 'text-[#4F8EF7]' : 'group-hover:text-[#4F8EF7] transition-colors'}`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium tracking-tight whitespace-nowrap">{item.label}</span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#162035] text-text-primary text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-[rgba(255,255,255,0.08)] shadow-xl">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#F05674] hover:bg-[#F05674]/[0.08] transition-colors group relative"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium tracking-tight">Sign out</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#3D0A14] text-[#F05674] text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-[#F05674]/20 shadow-xl">
              Sign out
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
