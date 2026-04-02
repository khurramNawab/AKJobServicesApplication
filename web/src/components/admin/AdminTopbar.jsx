import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  User, 
  HelpCircle, 
  Command,
  Sun,
  Moon,
  Inbox
} from 'lucide-react';

const AdminTopbar = ({ adminUser }) => {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      
      {/* 🔍 Universal Search Node */}
      <div className="flex-1 max-w-lg relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Command + K to Search Portal..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
            <Command size={8} /> K
          </div>
        </div>
      </div>

      {/* ⚡ Action Cluster */}
      <div className="flex items-center gap-6 ml-10">
        
        {/* Toggle Dark/Light Placeholder */}
        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all">
          <Sun size={18} />
        </button>

        {/* Notifications Matrix */}
        <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        </button>

        {/* 👤 Admin Profile Hub */}
        <div className="h-8 w-px bg-white/5 mx-2" />
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-white uppercase tracking-tighter leading-none">{adminUser?.name || 'Administrator'}</p>
            <p className="text-[9px] font-medium text-gray-500 mt-1 uppercase tracking-widest">{adminUser?.role || 'Root'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-white/10 flex items-center justify-center text-white font-black shadow-lg">
            {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>

      </div>
    </header>
  );
};

export default AdminTopbar;
