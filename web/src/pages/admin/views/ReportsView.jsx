import React from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Briefcase, 
  IndianRupee, 
  Download, 
  Calendar,
  PieChart,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

const ReportsView = () => {
  const { stats } = useOutletContext();

  const handleExport = () => {
    const reportData = [
      ['PLATFORM INTELLIGENCE REPORT', new Date().toLocaleString()],
      ['---------------------------', '---------------------------'],
      ['METRIC', 'DATA NODE'],
      ['Total Users', stats?.totalUsers || 0],
      ['Total Active Jobs', stats?.totalJobs || 0],
      ['Platform Revenue (INR)', stats?.totalRevenue || 0],
      ['New Growth (7 Days)', stats?.newUsersLast7Days || 0],
      ['Active Subscriptions', stats?.activeSubscriptions || 0],
      ['Pending Reconfigurations', stats?.pendingPayments || 0]
    ];

    // Sanitize cell contents to prevent Excel Formula Injection (CSV Injection)
    const sanitizeCSVCell = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      
      // Escape execution/formula initiation characters
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`; // Prefix with a single quote to block formula evaluation
      }
      
      // Escape double quotes inside the string by doubling them
      if (str.includes('"')) {
        str = str.replace(/"/g, '""');
      }
      
      // Wrap cell in double quotes if it contains separator, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = `"${str}"`;
      }
      
      return str;
    };

    // Format all cells and build rows
    const csvContent = reportData
      .map(row => row.map(cell => sanitizeCSVCell(cell)).join(','))
      .join('\n');

    // High performance Blob generation with UTF-8 Byte Order Mark (BOM) for Excel compatibility
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `intel_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Free up browser memory
  };
  const analyticsData = [
    { label: 'Growth Vector', value: stats?.newUsersLast7Days || 0, icon: TrendingUp, color: 'blue' },
    { label: 'Conversion Signal', value: '12.4%', icon: Activity, color: 'emerald' },
    { label: 'Market Cap (Total)', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'indigo' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      
      {/* 🚀 Analytics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Intelligence <span className="text-blue-500">Reports</span>.</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Data visualization and platform performance metrics.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 shadow-lg">
             <Calendar size={14} /> Last 30 Days
           </button>
           <button 
             onClick={handleExport}
             className="px-6 py-2.5 rounded-xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2"
           >
             <Download size={14} /> Intelligence Export
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {analyticsData.map((d, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-8 rounded-[3rem] bg-[#1E293B] border border-white/5 space-y-6 flex flex-col items-start shadow-2xl relative overflow-hidden group"
           >
              <div className={`p-4 rounded-2xl bg-${d.color}-500/10 text-${d.color}-500 border border-${d.color}-500/20 transition-transform group-hover:scale-110`}>
                 <d.icon size={24} />
              </div>
              <div className="space-y-1 text-left">
                 <p className="text-4xl font-black text-white tracking-tighter leading-none">{d.value}</p>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{d.label}</p>
              </div>
              <div className="absolute top-8 right-8 flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                 <ArrowUpRight size={12} /> 2.4%
              </div>
           </motion.div>
         ))}
      </div>

      {/* 📈 Visualized Data Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Revenue Projection (Mimicked with CSS Bars) */}
         <div className="p-10 rounded-[3rem] bg-[#1E293B] border border-white/5 space-y-10 flex flex-col items-start shadow-2xl">
            <div className="flex justify-between items-center w-full">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Revenue Vectors</h3>
               <BarChart className="text-blue-500" size={24} />
            </div>
            
            <div className="w-full flex items-end justify-between h-48 gap-4 px-4">
               {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                 <div key={i} className="flex-1 space-y-4 flex flex-col items-center group">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-xl group-hover:from-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    />
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">OCT {i+1}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Sector Distribution */}
         <div className="p-10 rounded-[3rem] bg-[#1E293B] border border-white/5 space-y-10 flex flex-col items-start shadow-2xl overflow-hidden relative">
            <div className="flex justify-between items-center w-full">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Sector Distribution</h3>
               <PieChart className="text-indigo-500" size={24} />
            </div>
            
            <div className="w-full space-y-6">
               {[
                 { label: 'CANDIDATE SIGNAL', percent: 68, color: 'bg-blue-500' },
                 { label: 'RECRUITER SIGNAL', percent: 24, color: 'bg-indigo-500' },
                 { label: 'ADMIN NODES', percent: 8, color: 'bg-slate-500' },
               ].map((s, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-left">
                       <span className="text-gray-400">{s.label}</span>
                       <span className="text-white">{s.percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${s.percent}%` }}
                          transition={{ delay: 0.5 + (i * 0.2), duration: 0.8 }}
                          className={`h-full ${s.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} 
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

export default ReportsView;
