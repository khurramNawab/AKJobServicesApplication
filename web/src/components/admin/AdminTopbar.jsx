import React from 'react';
import { Search, Bell, User, Command, Sun } from 'lucide-react';

const AdminTopbar = ({ adminUser }) => {
  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.06)] bg-[#0A1628]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">

      {/* Search */}
      <div className="flex-1 max-w-md relative group">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search size={15} className="text-text-muted group-focus-within:text-[#4F8EF7] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search portal..."
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg py-2 pl-10 pr-14 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#4F8EF7]/20 focus:border-[#4F8EF7]/50 transition-all"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[9px] font-medium text-text-muted">
            <Command size={8} /> K
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-6">
        <button className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-text-secondary transition-all">
          <Sun size={17} />
        </button>

        <button className="p-2 rounded-lg hover:bg-white/[0.04] text-text-muted hover:text-text-secondary transition-all relative">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#4F8EF7] shadow-[0_0_6px_rgba(79,142,247,0.6)]" />
        </button>

        <div className="h-6 w-px bg-[rgba(255,255,255,0.07)] mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-text-primary leading-none">{adminUser?.name || 'Administrator'}</p>
            <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">{adminUser?.role || 'Admin'}</p>
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
