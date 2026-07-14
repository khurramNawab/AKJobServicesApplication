import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  ArrowUpDown,
  CheckCircle,
  Clock,
  ShieldCheck,
  Eye,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../../../components/ui/Pagination';

const UserView = () => {
  const { 
    users, 
    pagination, 
    fetchAdminData,
    handleRoleUpdate, 
    handleToggleVerification, 
    handleDeleteUser 
  } = useOutletContext();
  
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  // Server-side debounced search & role filtering
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdminData(1, pagination.jobs.current, filterRole, search);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filterRole]);

  // Use the fetched users directly (server-side pagination and filter)
  const filteredItems = users;

  const handlePageChange = (newPage) => {
    fetchAdminData(newPage, pagination.jobs.current, filterRole, search);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🧭 Operational Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1 text-left">
          <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">User <span className="text-blue-500">Directory</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Manage registered users and roles.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME OR EMAIL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-[10px] font-black text-text-primary focus:outline-none focus:border-blue-500 uppercase tracking-widest cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* 🧾 High-Performance Master Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="border-b border-border-subtle bg-white/[0.02] dark:bg-white/[0.02]">
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <div className="flex items-center gap-2 cursor-pointer hover:text-text-primary transition-colors">
                         User Info <ArrowUpDown size={12} />
                      </div>
                   </th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Verification Status</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
             </thead>
             <tbody>
                {filteredItems.map((u, i) => (
                   <motion.tr 
                     key={u._id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="border-b border-border-subtle hover:bg-white/[0.02] dark:bg-white/[0.02] transition-colors group"
                   >
                      <td className="px-8 py-6 text-left">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg overflow-hidden">
                                {u.profilePhoto || u.companyLogo ? (
                                   <img src={u.profilePhoto || u.companyLogo} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                   u.name?.charAt(0).toUpperCase()
                                )}
                             </div>
                            <div className="text-left">
                               <p className="text-text-primary font-black text-sm tracking-tight">{u.name}</p>
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{u.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <select 
                           value={u.role}
                           onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                           className="bg-white/5 border border-border-subtle rounded-xl px-4 py-2 text-[10px] font-black text-text-primary focus:outline-none focus:border-blue-500 transition-all uppercase tracking-widest cursor-pointer"
                         >
                            <option value="CANDIDATE">Candidate</option>
                            <option value="RECRUITER">Recruiter</option>
                            <option value="ADMIN">Admin</option>
                         </select>
                      </td>
                      <td className="px-8 py-6">
                         <button 
                           onClick={() => handleToggleVerification(u._id, u.isVerified)}
                           className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all bg-white/5 border-border-subtle text-text-primary"
                         >
                            {u.isVerified ? <CheckCircle size={12} className="text-emerald-400" /> : <Clock size={12} className="text-amber-400" />}
                            {u.isVerified ? 'Verified Account' : 'Pending Verification'}
                         </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3 transition-all">
                            <button 
                              onClick={() => setSelectedUser(u)}
                              className="p-3 bg-white/5 hover:bg-white/10 border border-border-subtle rounded-xl text-gray-500 hover:text-text-primary transition-all"
                            >
                               <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-border-subtle hover:border-rose-500/30 rounded-xl text-rose-500 transition-all shadow-lg"
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
             currentPage={pagination.users.current} 
             totalPages={pagination.users.pages} 
             onPageChange={handlePageChange} 
          />
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
         {selectedUser && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
               onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}
            >
               <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#0F172A] border border-border-subtle rounded-[2.5rem] p-10 w-full max-w-md space-y-8 text-left"
               >
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">User Details</h3>
                     <button onClick={() => setSelectedUser(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-text-primary transition-all">
                        ✕
                     </button>
                  </div>

                  <div className="flex items-center gap-4 border-b border-border-subtle pb-6">
                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center text-blue-400 font-black text-2xl border border-blue-500/20 overflow-hidden">
                        {selectedUser.profilePhoto || selectedUser.companyLogo ? (
                           <img src={selectedUser.profilePhoto || selectedUser.companyLogo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           selectedUser.name?.charAt(0).toUpperCase()
                        )}
                     </div>
                     <div>
                        <h4 className="text-lg font-black text-text-primary">{selectedUser.name}</h4>
                        <p className="text-xs text-gray-500 font-bold">{selectedUser.email}</p>
                     </div>
                  </div>

                  <div className="space-y-4 text-xs text-slate-400">
                     <div className="flex justify-between py-2 border-b border-border-subtle">
                        <span className="font-bold text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5"><Info size={12} /> User ID</span>
                        <span className="text-text-primary font-bold">{selectedUser._id}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-border-subtle">
                        <span className="font-bold text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5"><ShieldCheck size={12} /> Platform Sector</span>
                        <span className="text-blue-400 font-bold">{selectedUser.role}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-border-subtle">
                        <span className="font-bold text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5"><Zap size={12} /> Plan Type</span>
                        <span className="text-text-primary font-bold">{selectedUser.planType || 'FREE'}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-border-subtle">
                        <span className="font-bold text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5"><Calendar size={12} /> Registered On</span>
                        <span className="text-text-primary font-bold">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-border-subtle">
                        <span className="font-bold text-gray-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5"><CheckCircle size={12} /> Identity status</span>
                        <span className={`font-black ${selectedUser.isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                           {selectedUser.isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                     </div>
                  </div>

                  <button
                     onClick={() => setSelectedUser(null)}
                     className="w-full py-4 bg-white/5 hover:bg-white/10 text-text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest border border-border-subtle transition-all"
                  >
                     Close Details
                  </button>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default UserView;
