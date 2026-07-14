import React, { useContext } from 'react';
import { Search, Bell, User, Command, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminTopbar = ({ adminUser, theme }) => {
  const { toggleTheme } = useTheme();
  
  return (
    <header className={`h-16 border-b backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between transition-colors ${
      theme === 'dark' ? 'bg-[#0A1628]/90 border-[rgba(255,255,255,0.06)]' : 'bg-white/90 border-gray-200 shadow-sm'
    }`}>

      {/* Search */}
      <div className="flex-1 max-w-md relative group">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search size={15} className={`transition-colors ${theme === 'dark' ? 'text-gray-400 group-focus-within:text-[#4F8EF7]' : 'text-gray-400 group-focus-within:text-blue-600'}`} />
        </div>
        <input
          type="text"
          placeholder="Search portal..."
          className={`w-full rounded-lg py-2 pl-10 pr-14 text-sm focus:outline-none focus:ring-2 transition-all ${
            theme === 'dark'
              ? 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-gray-500 focus:ring-[#4F8EF7]/20 focus:border-[#4F8EF7]/50'
              : 'bg-gray-50 border border-gray-200 text-slate-900 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500/50'
          }`}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-medium ${
            theme === 'dark'
              ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-gray-500'
              : 'border-gray-200 bg-white text-gray-400'
          }`}>
            <Command size={8} /> K
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-6">
        <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-white/[0.04] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-slate-800'}`}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className={`p-2 rounded-lg transition-all relative ${theme === 'dark' ? 'hover:bg-white/[0.04] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-slate-800'}`}>
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#4F8EF7] shadow-[0_0_6px_rgba(79,142,247,0.6)]" />
        </button>

        <div className={`h-6 w-px mx-2 ${theme === 'dark' ? 'bg-[rgba(255,255,255,0.07)]' : 'bg-gray-200'}`} />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className={`text-xs font-semibold leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{adminUser?.name || 'Administrator'}</p>
            <p className={`text-[10px] mt-0.5 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{adminUser?.role || 'Admin'}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4F8EF7] to-[#38BDF8] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white font-bold text-sm shadow-md">
            {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
