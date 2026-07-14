import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  IndianRupee, 
  Zap, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import api from '../../../services/api';

import { useOutletContext } from 'react-router-dom';

const DashboardView = () => {
  const { stats, activity, fetchAdminData } = useOutletContext();
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLog, setManualLog] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 4000);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/audit-logs/manual', { details: manualLog });
      if (res.data.success) {
         showToast('success', 'Manual entry successfully committed to audit ledger.');
         fetchAdminData();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to commit manual log entry.');
    } finally {
      setShowManualModal(false);
      setManualLog('');
    }
  };

  const handleExport = () => {
    const reportData = [
      ['DASHBOARD OPERATIONAL REPORT', new Date().toLocaleString()],
      ['---------------------------', '---------------------------'],
      ['KPI METRIC', 'VALUE SIGNAL'],
      ['Total Users', stats?.totalUsers || 0],
      ['Active Jobs', stats?.totalJobs || 0],
      ['Platform Revenue', stats?.totalRevenue || 0],
      ['System Health', 'Optimal']
    ];
    const csvContent = "data:text/csv;charset=utf-8," + reportData.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `operational_summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpiData = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'blue', 
      change: stats?.userChangePct !== undefined ? `${parseFloat(stats.userChangePct) >= 0 ? '+' : ''}${stats.userChangePct}%` : '+0%', 
      positive: stats?.userChangePct !== undefined ? parseFloat(stats.userChangePct) >= 0 : true 
    },
    { 
      label: 'Active Jobs', 
      value: stats?.totalJobs || 0, 
      icon: Briefcase, 
      color: 'emerald', 
      change: stats?.jobChangePct !== undefined ? `${parseFloat(stats.jobChangePct) >= 0 ? '+' : ''}${stats.jobChangePct}%` : '+0%', 
      positive: stats?.jobChangePct !== undefined ? parseFloat(stats.jobChangePct) >= 0 : true 
    },
    { 
      label: 'Platform Revenue', 
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, 
      icon: IndianRupee, 
      color: 'indigo', 
      change: stats?.revenueChangePct !== undefined ? `${parseFloat(stats.revenueChangePct) >= 0 ? '+' : ''}${stats.revenueChangePct}%` : '+0%', 
      positive: stats?.revenueChangePct !== undefined ? parseFloat(stats.revenueChangePct) >= 0 : true 
    },
    { 
      label: 'Active Plans', 
      value: stats?.activeSubscriptions || 0, 
      icon: Zap, 
      color: 'amber', 
      change: stats?.subscriptionChangePct !== undefined ? `${parseFloat(stats.subscriptionChangePct) >= 0 ? '+' : ''}${stats.subscriptionChangePct}%` : '+0%', 
      positive: stats?.subscriptionChangePct !== undefined ? parseFloat(stats.subscriptionChangePct) >= 0 : true 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🚀 Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1 text-left">
          <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">Dashboard <span className="text-blue-500">Overview</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Real-time operational statistics of the portal.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="px-6 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-[10px] font-black text-text-primary uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            Export Report
          </button>
          <button 
            onClick={() => setShowManualModal(true)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-[10px] font-black text-text-primary uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> New Manual Entry
          </button>
        </div>
      </div>

      {/* 📊 High-Performance KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-bg-surface border border-border-subtle hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col items-start"
          >
            <div className="flex w-full justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20 transition-all group-hover:scale-110`}>
                <stat.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <div className="space-y-1 text-left">
              <p className="text-3xl font-black text-text-primary tracking-tighter leading-none">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 📉 Secondary Data Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Signals Feed (Activity) */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-bg-surface border border-border-subtle space-y-8 flex flex-col items-start">
          <div className="flex justify-between items-center w-full">
            <div className="text-left">
              <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Signals Feed</h3>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Live platform activity detection</p>
            </div>
            <Activity className="text-blue-500" size={20} />
          </div>
          
          <div className="w-full space-y-4">
            {activity.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] dark:bg-white/[0.02] border border-border-subtle rounded-2xl hover:bg-white/[0.04] transition-all group/item">
                <div className="flex items-center gap-6">
                  <div className={`w-2.5 h-2.5 rounded-full ${e.type === 'USER_JOINED' ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`} />
                  <div className="text-left">
                    <p className="text-[11px] font-black text-text-primary uppercase tracking-widest leading-none">{e.type.replace('_', ' ')}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase italic tracking-tighter">{e.detail}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-gray-600 italic uppercase">
                  {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Vitals */}
        <div className="p-8 rounded-[2.5rem] bg-bg-surface border border-border-subtle space-y-8 flex flex-col items-start">
          <div className="flex justify-between items-center w-full">
            <div className="text-left">
              <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">System Vitals</h3>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Core protocol health</p>
            </div>
            <ShieldCheck className="text-emerald-500" size={20} />
          </div>

          <div className="w-full space-y-5">
            {[
              { label: 'Auth Subsystem', status: 'Stable', color: 'bg-emerald-500', load: '12% CPU' },
              { label: 'Signal DB', status: 'Optimal', color: 'bg-emerald-500', load: '4ms latency' },
              { label: 'Transmission Grid', status: 'Active', color: 'bg-emerald-500', load: 'Nominal' },
              { label: 'Worker Node 01', status: 'Online', color: 'bg-emerald-500', load: '24% RAM' },
            ].map((v, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">{v.label}</span>
                  <span className="text-gray-600 italic tracking-tighter">{v.load}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: i * 0.2, duration: 1 }}
                    className={`h-full ${v.color} shadow-[0_0_10px_rgba(16,185,129,0.3)]`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 🛡️ Manual Entry Modal Interface */}
      {showManualModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 space-y-8 shadow-2xl shadow-blue-500/10"
           >
              <div className="space-y-2 text-left">
                 <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Manual <span className="text-blue-500">Node Entry</span>.</h3>
                 <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Inject manual protocol logs into system matrix.</p>
              </div>
              
              <form onSubmit={handleManualSubmit} className="space-y-6">
                 <textarea 
                   required
                   value={manualLog}
                   onChange={(e) => setManualLog(e.target.value)}
                   placeholder="DESCRIBE MANUAL ACTION / LOG ENTRY..."
                   className="w-full bg-white/5 border border-border-subtle rounded-3xl px-6 py-5 text-[11px] font-black text-text-primary tracking-widest focus:outline-none focus:border-blue-500 transition-all min-h-[120px] resize-none uppercase shadow-inner"
                 />
                 <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowManualModal(false)}
                      className="flex-1 py-4 rounded-2xl bg-white/5 border border-border-subtle text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-text-primary transition-all"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit"
                      className="flex-2 px-8 py-4 rounded-2xl bg-blue-600 text-text-primary text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                    >
                      Commit Entry
                    </button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* Top screen Toast Notification */}
      <AnimatePresence>
          {toast && (
              <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 20 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-sm font-semibold uppercase tracking-wider"
                  style={{
                      backgroundColor: toast.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      borderColor: toast.type === 'success' ? '#34D399' : '#EF4444',
                      color: toast.type === 'success' ? '#34D399' : '#EF4444',
                      backdropFilter: 'blur(10px)',
                      borderWidth: '1px'
                  }}
              >
                  {toast.type === 'success' ? '✓' : '✗'} {toast.message}
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;
