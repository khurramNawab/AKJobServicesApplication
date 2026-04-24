import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  ArrowUpDown,
  CheckCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  // ⚡ Performance/UX Fix: Only fetch from backend when the sector (role) changes
  // Local search (useMemo below) handles real-time filtering without flooding the API
  React.useEffect(() => {
    fetchAdminData(1, pagination.jobs.current);
  }, [filterRole]);

  // Local filtering (optional if backend is also filtering, but good for instant UI feel on current page)
  const filteredItems = useMemo(() => {
    return users.filter(u => 
        (filterRole === 'ALL' || u.role === filterRole) &&
        (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search, filterRole]);

  const handlePageChange = (newPage) => {
    fetchAdminData(newPage, pagination.jobs.current);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🧭 Operational Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1 text-left">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">User <span className="text-blue-500">Directory</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Platform identity and sector management.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY IDENTITY..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1E293B] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
            />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-[#1E293B] border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black text-white focus:outline-none focus:border-blue-500 uppercase tracking-widest cursor-pointer"
          >
            <option value="ALL">All Sectors</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* 🧾 High-Performance Master Table */}
      <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        Signal Identify <ArrowUpDown size={12} />
                      </div>
                   </th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Sector</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status Matrix</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Operational Actions</th>
                </tr>
             </thead>
             <tbody>
                {filteredItems.map((u, i) => (
                   <motion.tr 
                     key={u._id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                   >
                      <td className="px-8 py-6 text-left">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg">
                               {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                               <p className="text-white font-black text-sm tracking-tight">{u.name}</p>
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{u.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <select 
                           value={u.role}
                           onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                           className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white focus:outline-none focus:border-blue-500 transition-all uppercase tracking-widest cursor-pointer"
                         >
                            <option value="CANDIDATE">Candidate</option>
                            <option value="RECRUITER">Recruiter</option>
                            <option value="ADMIN">Admin</option>
                         </select>
                      </td>
                      <td className="px-8 py-6">
                         <button 
                           onClick={() => handleToggleVerification(u._id, u.isVerified)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                             u.isVerified 
                             ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                             : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                           }`}
                         >
                            {u.isVerified ? <CheckCircle size={12} /> : <Clock size={12} />}
                            {u.isVerified ? 'Verified Account' : 'Pending Verification'}
                         </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 rounded-xl text-rose-500 transition-all shadow-lg"
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
        <div className="p-8 border-t border-white/5 px-10">
          <Pagination 
             currentPage={pagination.users.current} 
             totalPages={pagination.users.pages} 
             onPageChange={handlePageChange} 
          />
        </div>
      </div>

    </div>
  );
};

export default UserView;
