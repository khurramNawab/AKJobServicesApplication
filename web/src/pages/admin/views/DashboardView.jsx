import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  DollarSign, 
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
  const { stats, activity } = useOutletContext();
  const kpiData = [
    { label: 'Total Signal', value: stats?.totalUsers || 0, icon: Users, color: 'blue', change: '+12%', positive: true },
    { label: 'Active Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'emerald', change: '+5%', positive: true },
    { label: 'Platform Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'indigo', change: '+18%', positive: true },
    { label: 'Active Plans', value: stats?.activeSubscriptions || 0, icon: Zap, color: 'amber', change: '-2%', positive: false },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🚀 Tactical Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1 text-left">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">System <span className="text-blue-500">Overview</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Real-time operational metrics across all sectors.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            Export Report
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
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
            className="p-6 rounded-3xl bg-[#1E293B] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col items-start"
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
              <p className="text-3xl font-black text-white tracking-tighter leading-none">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 📉 Secondary Data Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Signals Feed (Activity) */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-[#1E293B] border border-white/5 space-y-8 flex flex-col items-start">
          <div className="flex justify-between items-center w-full">
            <div className="text-left">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Signals Feed</h3>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Live platform activity detection</p>
            </div>
            <Activity className="text-blue-500" size={20} />
          </div>
          
          <div className="w-full space-y-4">
            {activity.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group/item">
                <div className="flex items-center gap-6">
                  <div className={`w-2.5 h-2.5 rounded-full ${e.type === 'USER_JOINED' ? 'bg-blue-500' : 'bg-emerald-500'} animate-pulse`} />
                  <div className="text-left">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none">{e.type.replace('_', ' ')}</p>
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
        <div className="p-8 rounded-[2.5rem] bg-[#1E293B] border border-white/5 space-y-8 flex flex-col items-start">
          <div className="flex justify-between items-center w-full">
            <div className="text-left">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">System Vitals</h3>
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

    </div>
  );
};

export default DashboardView;
