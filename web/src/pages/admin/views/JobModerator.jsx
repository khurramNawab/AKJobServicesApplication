import React, { useState } from 'react';
import { 
  Briefcase, 
  Trash2, 
  Building2, 
  Calendar, 
  MapPin, 
  Search, 
  CheckCircle, 
  XSquare,
  ArrowUpDown,
  Filter,
  Eye,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

const JobModerator = () => {
  const { jobs, handleDeleteJob: onDelete } = useOutletContext();
  const [search, setSearch] = useState('');
  
  const filtered = jobs.filter(j => 
    j.title?.toLowerCase().includes(search.toLowerCase()) || 
    j.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Job <span className="text-blue-500">Moderator</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Manage platform postings and sector integrity.</p>
        </div>
        <div className="relative flex-1 md:max-w-md group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="FILTER BY POSITION OR ENTITY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
          />
        </div>
      </div>

      <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Position / Company</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Recruiter Signal</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Package Status</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Moderation</th>
                </tr>
             </thead>
             <tbody>
                {filtered.map((j, i) => (
                   <motion.tr 
                     key={j._id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="border-b border-white/5 hover:bg-white/[0.02] transition-all group"
                   >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                               <Briefcase size={20} />
                            </div>
                            <div className="text-left">
                               <p className="text-white font-black text-sm tracking-tight">{j.title}</p>
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                 <Building2 size={10} /> {j.companyName}
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="text-left">
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-tighter">{j.recruiterId?.name || 'External Recruiter'}</p>
                            <p className="text-[9px] font-black text-gray-600 uppercase italic mt-1 tracking-widest flex items-center gap-2">
                              <Calendar size={10} /> {new Date(j.createdAt).toLocaleDateString()}
                            </p>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-indigo-400 font-black text-[11px] uppercase tracking-tighter">
                            <DollarSign size={14} /> 
                            {j.salaryRange?.min ? `${j.salaryRange.min} - ${j.salaryRange.max} ${j.salaryRange.currency}` : 'Confidential'}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
                               <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => onDelete(j._id)}
                              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 rounded-xl text-rose-500 transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
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

export default JobModerator;
