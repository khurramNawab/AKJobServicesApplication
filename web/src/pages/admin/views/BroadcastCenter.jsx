import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  History, 
  Users, 
  Smartphone, 
  Globe 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import api from '../../../services/api';

const BroadcastCenter = () => {
  const { handleBroadcast: onBroadcast, actionLoading: loading } = useOutletContext();
  const [form, setForm] = useState({ title: '', message: '' });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/admin/broadcasts/history');
        if (data.success) setHistory(data.data || []);
      } catch { /* silent */ }
    };
    fetchHistory();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onBroadcast(form);
    setForm({ title: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      
      {/* 🚀 Signal Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">Broadcast <span className="text-blue-500">Center</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Platform-wide signal transmission matrix.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
          <Smartphone size={14} /> <Globe size={14} /> Total Coverage
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 📟 Transmission Matrix */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 rounded-[3rem] bg-bg-surface border border-border-subtle space-y-10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-text-primary/5 opacity-20 group-hover:opacity-40 transition-opacity">
            <Terminal size={120} />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Signal Header / Title</label>
                <input 
                   type="text" 
                   required
                   value={form.title}
                   onChange={(e) => setForm({...form, title: e.target.value})}
                   placeholder="ENTER SIGNAL TITLE..."
                   className="w-full bg-white/5 border border-border-subtle rounded-2xl px-6 py-4 text-[11px] font-black text-text-primary tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Signal Payload / Message</label>
                <textarea 
                   required
                   value={form.message}
                   onChange={(e) => setForm({...form, message: e.target.value})}
                   placeholder="ENTER GLOBAL TRANSMISSION..."
                   rows={5}
                   className="w-full bg-white/5 border border-border-subtle rounded-[2.5rem] px-8 py-6 text-[11px] font-black text-text-primary tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase resize-none shadow-inner"
                />
             </div>
             
             <button 
               type="submit"
               disabled={loading}
               className="w-full py-5 rounded-3xl bg-blue-600 text-text-primary font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
             >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? 'Transmitting...' : 'Initialize Broadcast'}
             </button>
          </form>
        </motion.div>

        {/* 🛡️ Protocol Intelligence */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
           <div className="p-8 rounded-[2.5rem] bg-bg-surface border border-border-subtle space-y-6 flex flex-col items-start">
              <div className="flex items-center gap-4 text-left">
                 <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Zap size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">Transmission Protocol</h4>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Active System Policy</p>
                 </div>
              </div>
              <p className="text-gray-400 text-xs font-medium leading-relaxed text-left">
                Broadcasting sends a real-time signal to all active sectors. This message will override terminal states and appear in every user's notification neural network. 
              </p>
              <div className="w-full space-y-3">
                 {[
                   { label: 'Latency', value: '< 45ms', status: 'Optimal' },
                   { label: 'Sector Range', value: 'Global', status: 'Active' },
                   { label: 'Priority', value: 'Level 1', status: 'Immediate' },
                 ].map((p, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] dark:bg-white/[0.02] rounded-xl border border-border-subtle">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{p.label}</span>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{p.value}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 rounded-[2.5rem] bg-bg-surface border border-border-subtle space-y-6 flex flex-col items-start">
              <div className="flex items-center gap-4 text-left w-full">
                 <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <History size={20} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">Recent Signals</h4>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Historical Transmission Log</p>
                 </div>
                 <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">View All</button>
              </div>
               <div className="w-full space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                  {history.length > 0 ? history.map((item, idx) => (
                     <div key={item._id || idx} className="p-4 bg-white/[0.02] dark:bg-white/[0.02] border border-border-subtle rounded-2xl flex flex-col gap-1 group text-left">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <ShieldCheck size={14} className="text-emerald-500" />
                              <p className="text-[10px] font-black text-text-primary uppercase tracking-widest italic">{item.title}</p>
                           </div>
                           <span className="text-[8px] font-black text-gray-500 italic">
                              {new Date(item.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{item.message}</p>
                     </div>
                  )) : (
                     <div className="p-4 bg-white/[0.02] dark:bg-white/[0.02] border border-border-subtle rounded-2xl text-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        No broadcast history
                     </div>
                  )}
               </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
};

export default BroadcastCenter;
