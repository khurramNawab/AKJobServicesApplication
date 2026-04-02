import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  User, 
  Briefcase, 
  CheckCircle, 
  XSquare, 
  Clock, 
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const ApplicationsView = () => {
  const [search, setSearch] = useState('');
  
  // Mock Data for Applications
  const applications = [
    { id: 'APP-001', candidate: 'Rahul Sharma', job: 'Senior React Dev', status: 'SHORTLISTED', date: '2026-04-02' },
    { id: 'APP-002', candidate: 'Ananya Iyer', job: 'Backend Engineer', status: 'REVIEWING', date: '2026-04-02' },
    { id: 'APP-003', candidate: 'Vikram Singh', job: 'Product Manager', status: 'HIRED', date: '2026-04-01' },
    { id: 'APP-004', candidate: 'Sanya Gupta', job: 'UX Designer', status: 'REJECTED', date: '2026-03-31' },
    { id: 'APP-005', candidate: 'Arjun Mehra', job: 'DevOps Architect', status: 'APPLIED', date: '2026-03-30' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      
      {/* 🚀 Tactical Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Application <span className="text-blue-500">Matrix</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Platform-wide candidate submission ledger.</p>
        </div>
        <div className="relative flex-1 md:max-w-md group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="FILTER BY CANDIDATE OR ROLE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase shadow-lg shadow-black/20"
          />
        </div>
      </div>

      {/* 🧾 Data Grid */}
      <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Identify Cluster</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Applied Role</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Status</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Moderation</th>
                </tr>
             </thead>
             <tbody>
                {applications.map((a, i) => (
                   <motion.tr 
                     key={a.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                   >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                               <User size={18} />
                            </div>
                            <div className="text-left">
                               <p className="text-white font-black text-sm tracking-tight">{a.candidate}</p>
                               <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{a.date}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3 text-gray-300 font-bold text-xs uppercase cursor-pointer hover:text-blue-400 transition-colors">
                            <Briefcase size={14} className="text-gray-500" />
                            {a.job}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                           a.status === 'HIRED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                           a.status === 'APPLIED' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                           a.status === 'REJECTED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                           'bg-amber-500/10 border-amber-500/20 text-amber-400'
                         }`}>
                            {a.status === 'HIRED' ? <CheckCircle size={10} /> : a.status === 'REJECTED' ? <XSquare size={10} /> : <Clock size={10} />}
                            {a.status}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                            <ExternalLink size={16} />
                         </button>
                      </td>
                   </motion.tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsView;
