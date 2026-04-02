import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentsView = () => {
  const [search, setSearch] = useState('');
  
  // Mock Transaction Data based on seeded signals
  const transactions = [
    { id: 'TXN-A8F2K9', user: 'Khurram Nawab', plan: 'ELITE', amount: 2499, status: 'SUCCESS', date: '2026-04-02' },
    { id: 'TXN-J3R7L1', user: 'Siddhant Sharma', plan: 'PRO', amount: 999, status: 'SUCCESS', date: '2026-04-01' },
    { id: 'TXN-P0Q5M2', user: 'Digital Solutions', plan: 'PRO', amount: 999, status: 'PENDING', date: '2026-04-01' },
    { id: 'TXN-G4V6X9', user: 'Tech Corp', plan: 'ELITE', amount: 2499, status: 'FAILED', date: '2026-03-31' },
    { id: 'TXN-M1N8B3', user: 'Rahul Verma', plan: 'BASIC', amount: 0, status: 'SUCCESS', date: '2026-03-30' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      
      {/* 🚀 Financial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Payment <span className="text-blue-500">Ledger</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Platform-wide financial transaction matrix.</p>
        </div>
        <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* 🧾 Transaction Grid */}
      <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Transaction Signal</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Identity</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Operational Value</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status Node</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
             </thead>
             <tbody>
                {transactions.map((t, i) => (
                   <motion.tr 
                     key={t.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="border-b border-white/5 hover:bg-white/[0.02] transition-all group"
                   >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                               <CreditCard size={18} />
                            </div>
                            <div className="text-left">
                               <p className="text-white font-black text-sm tracking-tight">{t.id}</p>
                               <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{t.date}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-gray-300 font-bold text-xs uppercase tracking-tighter">{t.user}</p>
                         <p className="text-[9px] font-black text-blue-500 mt-1 uppercase tracking-widest italic">{t.plan} TIER</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1 text-white font-black text-sm tracking-tighter">
                            <DollarSign size={14} className="text-gray-500" /> {t.amount.toLocaleString()}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                           t.status === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                           t.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                           'bg-rose-500/10 border-rose-500/20 text-rose-500'
                         }`}>
                            {t.status === 'SUCCESS' ? <CheckCircle size={10} /> : t.status === 'PENDING' ? <Clock size={10} /> : <XCircle size={10} />}
                            {t.status}
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

export default PaymentsView;
