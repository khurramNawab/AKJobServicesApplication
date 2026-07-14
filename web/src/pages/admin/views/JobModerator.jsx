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
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import Pagination from '../../../components/ui/Pagination';

const JobModerator = () => {
  const { jobs, pagination, fetchAdminData, handleDeleteJob: onDelete } = useOutletContext();
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  
  const filtered = jobs.filter(j => 
    j.title?.toLowerCase().includes(search.toLowerCase()) || 
    j.companyName?.toLowerCase().includes(search.toLowerCase())
  );
  
  const handlePageChange = (newPage) => {
    fetchAdminData(pagination.users.current, newPage);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">Job <span className="text-blue-500">Moderator</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Manage platform postings and sector integrity.</p>
        </div>
        <div className="relative flex-1 md:max-w-md group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="FILTER BY POSITION OR ENTITY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
          />
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
                <tr className="border-b border-border-subtle bg-white/[0.02] dark:bg-white/[0.02]">
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
                     className="border-b border-border-subtle hover:bg-white/[0.02] dark:bg-white/[0.02] transition-all group"
                   >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                               {j.recruiterId?.companyLogo ? (
                                  <img src={j.recruiterId.companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                               ) : (
                                  <Briefcase size={20} />
                               )}
                            </div>
                            <div className="text-left">
                               <p className="text-text-primary font-black text-sm tracking-tight">{j.title}</p>
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                 <Building2 size={10} /> {j.companyName || j.recruiterId?.companyName || 'Corporate Entity'}
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
                            <IndianRupee size={14} /> 
                            {j.salaryRange?.min ? `${j.salaryRange.min} - ${j.salaryRange.max} ${j.salaryRange.currency || 'INR'}` : 'Confidential'}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3 transition-all">
                            <button onClick={() => setSelectedJob(j)} className="p-3 bg-white/5 hover:bg-white/10 border border-border-subtle rounded-xl text-gray-500 hover:text-text-primary transition-all">
                               <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => onDelete(j._id)}
                              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-border-subtle hover:border-rose-500/30 rounded-xl text-rose-500 transition-all"
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
        
        {/* 📟 Pager Subsystem */}
        <div className="p-8 border-t border-border-subtle px-10">
          <Pagination 
             currentPage={pagination.jobs.current} 
             totalPages={pagination.jobs.pages} 
             onPageChange={handlePageChange} 
          />
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
         {selectedJob && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
               onClick={(e) => e.target === e.currentTarget && setSelectedJob(null)}
            >
               <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#0F172A] border border-border-subtle rounded-[2.5rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-8"
               >
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">{selectedJob.title}</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{selectedJob.companyName || selectedJob.recruiterId?.companyName || 'Corporate Entity'}</p>
                     </div>
                     <button onClick={() => setSelectedJob(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-text-primary transition-all">
                        ✕
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-400 text-xs">
                     <div>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Location</p>
                        <p className="text-text-primary font-bold mt-1 flex items-center gap-1.5"><MapPin size={12} /> {selectedJob.location}</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Salary / Year</p>
                        <p className="text-text-primary font-bold mt-1 flex items-center gap-1.5"><IndianRupee size={12} /> {selectedJob.salaryRange?.min || selectedJob.salaryRange} - {selectedJob.salaryRange?.max || ''} {selectedJob.salaryRange?.currency || 'INR'}</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Vacancies</p>
                        <p className="text-text-primary font-bold mt-1">{selectedJob.vacancies || 1}</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Interview Mode</p>
                        <p className="text-text-primary font-bold mt-1">{selectedJob.interviewMode || 'Online'}</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Education Required</p>
                        <p className="text-text-primary font-bold mt-1">{selectedJob.educationQualification || 'N/A'}</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Deadline</p>
                        <p className="text-text-primary font-bold mt-1">{selectedJob.applicationDeadline ? new Date(selectedJob.applicationDeadline).toLocaleDateString() : 'None'}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Description</p>
                     <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>

                  {selectedJob.requirements && (
                     <div className="space-y-3">
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Requirements</p>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                     </div>
                  )}
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default JobModerator;
