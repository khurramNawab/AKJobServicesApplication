import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Globe, 
  Bell, 
  Lock, 
  Server, 
  Save, 
  RefreshCw, 
  ShieldAlert,
  Terminal,
  Database,
  Cloud
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsView = () => {
  const [activeSubTab, setActiveSubTab] = useState('general');

  const configs = [
    { id: 'general', label: 'Platform Core', icon: Globe },
    { id: 'security', label: 'Auth Protocols', icon: Shield },
    { id: 'notifications', label: 'Transmission', icon: Bell },
    { id: 'database', label: 'Signal Storage', icon: Database },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      
      {/* 🚀 System Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">System <span className="text-blue-500">Node</span> Settings.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Platform-wide protocol configuration and security.</p>
        </div>
        <button className="px-8 py-3 rounded-2xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2">
           <Save size={14} /> Synchronize Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* 🧭 Operational Menu */}
        <div className="lg:col-span-1 space-y-4">
           {configs.map((c) => (
             <button
               key={c.id}
               onClick={() => setActiveSubTab(c.id)}
               className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border ${
                 activeSubTab === c.id 
                 ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                 : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/[0.08]'
               }`}
             >
                <c.icon size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{c.label}</span>
             </button>
           ))}
           <div className="h-px bg-white/5 my-8" />
           <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all shadow-lg">
                <ShieldAlert size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Maintenance Mode</span>
           </button>
        </div>

        {/* 📟 Dynamic Config Workspace */}
        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
              {activeSubTab === 'general' && (
                <motion.div 
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-10 rounded-[3rem] bg-[#1E293B] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden"
                >
                   <div className="flex items-center gap-4 text-left">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                         <Globe size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tight">Core Protocol</h3>
                         <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Global system configuration</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-4">Platform Identity</label>
                         <input type="text" defaultValue="Elite Job Matrix 2.4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[11px] font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-4">Transmission Domain</label>
                         <input type="text" defaultValue="matrix.jobportal.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[11px] font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase" />
                      </div>
                      <div className="space-y-3 md:col-span-2">
                         <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-4">System Description</label>
                         <textarea rows={3} defaultValue="Professional Industrial Hub for high-performance sector management." className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-[11px] font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase resize-none" />
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           {/* 🛡️ Secure Vitals Overlay */}
           <div className="mt-8 p-10 rounded-[3rem] bg-indigo-600/5 border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-8 border-dashed shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-indigo-500 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                 <Terminal size={120} />
              </div>
              <div className="flex items-center gap-6 text-left">
                 <div className="p-4 rounded-[2rem] bg-indigo-500/10 text-indigo-500 shadow-xl">
                    <Lock size={28} />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-indigo-400 uppercase tracking-tight italic">Root Key Node</h4>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol Version: 1.0.2-LTS</p>
                 </div>
              </div>
              <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg active:scale-95">
                 Re-initialize Signal Keys
              </button>
           </div>
        </div>

      </div>

    </div>
  );
};

// Help helper for AnimatePresence
import { AnimatePresence } from 'framer-motion';

export default SettingsView;
