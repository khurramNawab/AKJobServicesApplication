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
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '' },
    { id: 'users', label: 'User Directory', icon: Users, path: 'users' },
    { id: 'jobs', label: 'Jobs Moderator', icon: Briefcase, path: 'jobs' },
    { id: 'applications', label: 'Applications', icon: FileText, path: 'applications' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Sparkles, path: 'subscriptions' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: 'payments' },
    { id: 'reports', label: 'Reports', icon: BarChart, path: 'reports' },
    { id: 'broadcast', label: 'Broadcaster', icon: Radio, path: 'broadcast' },
    { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? '80px' : '260px' }}
      className="fixed left-0 top-0 h-screen bg-[#0F172A] border-r border-white/5 z-50 flex flex-col transition-all duration-300"
    >
      {/* 🏙️ Logo Cluster */}
      <div className="p-6 flex items-center justify-between overflow-hidden">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black tracking-tighter text-xl uppercase italic">Matrix</span>
          </motion.div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* 🧭 Navigation Matrix */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === ''}
            className={({ isActive }) => `
              w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} />
                {!collapsed && (
                  <span className="text-sm font-semibold tracking-tight whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <motion.div 
                    layoutId="active-pill" 
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                  />
                )}
                
                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 shadow-2xl">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 👤 Exit Node */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group relative"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-bold tracking-tight">Logout Matrix</span>}
          {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-red-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-red-500/20 shadow-2xl">
              Logout
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
