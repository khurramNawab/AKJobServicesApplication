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
  Sparkles,
  Video,
  Building2
} from 'lucide-react';

import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminSidebar = ({ collapsed, setCollapsed, theme = 'dark' }) => {
  const { logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'overview',       label: 'Dashboard',       icon: LayoutDashboard, path: '' },
    { id: 'users',          label: 'User Directory',   icon: Users,           path: 'users' },
    { id: 'jobs',           label: 'Jobs Moderator',   icon: Briefcase,       path: 'jobs' },
    { id: 'applications',   label: 'Applications',     icon: FileText,        path: 'applications' },
    { id: 'companies',      label: 'Companies',        icon: Building2,       path: 'companies' },
    { id: 'subscriptions',  label: 'Subscriptions',    icon: Sparkles,        path: 'subscriptions' },
    { id: 'payments',       label: 'Payments',         icon: CreditCard,      path: 'payments' },
    { id: 'reports',        label: 'Reports',          icon: BarChart,        path: 'reports' },
    { id: 'broadcast',      label: 'Broadcaster',      icon: Radio,           path: 'broadcast' },
    { id: 'promo-video',    label: 'Promo Video',      icon: Video,           path: 'promo-video' },
    { id: 'settings',       label: 'Settings',         icon: Settings,        path: 'settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? '72px' : '256px' }}
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-[#0A1628] border-r border-[rgba(255,255,255,0.06)]' 
          : 'bg-white border-r border-gray-200'
      }`}
      style={{ transition: 'width 0.25s ease' }}
    >
      {/* Logo */}
      <div className={`h-16 px-4 flex items-center justify-between border-b ${theme === 'dark' ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-200'}`}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="w-7 h-7 bg-[#4F8EF7] rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold tracking-tight text-sm whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Admin Matrix</span>
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
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${theme === 'dark' ? 'hover:bg-white/[0.05] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`mx-auto mt-2 p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/[0.05] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
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
                ? (theme === 'dark' ? 'bg-[#4F8EF7]/10 text-[#4F8EF7]' : 'bg-blue-50 text-blue-600')
                : (theme === 'dark' ? 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200' : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900')
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
                  <div className={`absolute left-full ml-3 px-3 py-1.5 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border shadow-xl ${theme === 'dark' ? 'bg-[#162035] text-white border-[rgba(255,255,255,0.08)]' : 'bg-white text-slate-800 border-gray-200'}`}>
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={`p-3 border-t ${theme === 'dark' ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-200'}`}>
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
