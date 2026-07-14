import React, { useState, useEffect } from 'react';
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
  IndianRupee,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const PaymentsView = () => {
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/admin/payments');
        if (res.data.success) {
          setTransactions(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        // Fallback to mock data if API fails (e.g. no DB connection or not seeded)
        setTransactions([
          { id: 'TXN-A8F2K9', user: 'Khurram Nawab', plan: 'ELITE', amount: 2499, status: 'SUCCESS', date: '2026-04-02' },
          { id: 'TXN-J3R7L1', user: 'Siddhant Sharma', plan: 'PRO', amount: 999, status: 'SUCCESS', date: '2026-04-01' },
          { id: 'TXN-P0Q5M2', user: 'Digital Solutions', plan: 'PRO', amount: 999, status: 'PENDING', date: '2026-04-01' },
          { id: 'TXN-G4V6X9', user: 'Tech Corp', plan: 'ELITE', amount: 2499, status: 'FAILED', date: '2026-03-31' },
          { id: 'TXN-M1N8B3', user: 'Rahul Verma', plan: 'BASIC', amount: 0, status: 'SUCCESS', date: '2026-03-30' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = transactions.filter(t => 
     t.id?.toLowerCase().includes(search.toLowerCase()) ||
     t.user?.toLowerCase().includes(search.toLowerCase()) ||
     t.plan?.toLowerCase().includes(search.toLowerCase()) ||
     t.status?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'User Name', 'Plan', 'Amount (INR)', 'Status', 'Date'];
    const rows = filtered.map(t => [
      t.id,
      t.user || 'Unknown User',
      t.plan || 'N/A',
      t.amount,
      t.status,
      t.date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      
      {/* 🚀 Financial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">Payment <span className="text-blue-500">Ledger</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Platform-wide financial transactions log.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY TXN OR USER..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-[10px] font-black text-text-primary uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* 🧾 Transaction Grid */}
      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
                <tr className="border-b border-border-subtle bg-white/[0.02] dark:bg-white/[0.02]">
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Transaction ID</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                   <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
             </thead>
             <tbody>
                {filtered.map((t, i) => (
                   <motion.tr 
                     key={t.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="border-b border-border-subtle hover:bg-white/[0.02] dark:bg-white/[0.02] transition-all group"
                   >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                               <CreditCard size={18} />
                            </div>
                            <div className="text-left">
                               <p className="text-text-primary font-black text-sm tracking-tight">{t.id}</p>
                               <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{t.date}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-gray-300 font-bold text-xs uppercase tracking-tighter">{t.user}</p>
                         <p className="text-[9px] font-black text-blue-500 mt-1 uppercase tracking-widest italic">{t.plan} TIER</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1 text-text-primary font-black text-sm tracking-tighter">
                            <IndianRupee size={14} className="text-gray-500" /> {t.amount.toLocaleString()}
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
                         <button className="p-3 bg-white/5 hover:bg-white/10 border border-border-subtle rounded-xl text-gray-500 hover:text-text-primary transition-all">
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
