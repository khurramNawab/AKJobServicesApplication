import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, IndianRupee, TrendingUp, BarChart3, Briefcase, MapPin, MousePointer2, Info, ArrowUpRight, ArrowDownRight, Activity, ArrowRight, Zap } from 'lucide-react';
import Button from '../components/ui/Button';

const Salaries = () => {
   const [searchQuery, setSearchQuery] = useState('');

   const salaryData = [
      { role: 'Senior Software Engineer', avg: '₹22L - ₹38L', trend: '+12%', growth: 'up' },
      { role: 'Product Manager', avg: '₹18L - ₹32L', trend: '+8%', growth: 'up' },
      { role: 'UI/UX Designer', avg: '₹12L - ₹24L', trend: '+15%', growth: 'up' },
      { role: 'Full Stack Developer', avg: '₹15L - ₹28L', trend: '+5%', growth: 'up' },
      { role: 'Data Scientist', avg: '₹20L - ₹40L', trend: '+20%', growth: 'up' },
      { role: 'Digital Marketer', avg: '₹8L - ₹16L', trend: '-2%', growth: 'down' },
      { role: 'DevOps Engineer', avg: '₹16L - ₹30L', trend: '+18%', growth: 'up' },
      { role: 'Cybersecurity Analyst', avg: '₹14L - ₹26L', trend: '+25%', growth: 'up' },
   ];

   const filteredData = salaryData.filter(d =>
      d.role.toLowerCase().includes(searchQuery.toLowerCase())
   );

   return (
      <div className="min-h-screen bg-bg-main pt-6 pb-28 px-6 relative overflow-hidden">
         {/* 🌌 Advanced Background System */}
         <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#4F8EF7]/10 blur-[120px] rounded-full animate-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#F05674]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
         </div>

         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

         <div className="max-w-7xl mx-auto space-y-24 relative z-10 text-left">

            {/* Header Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7]">
                     <TrendingUp className="w-3 h-3" /> Financial Intelligence Matrix
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">Know your <span className="gradient-text">Worth</span>.</h1>
                  <p className="text-text-secondary text-xl font-medium opacity-80 leading-relaxed max-w-xl">
                     Navigate the financial landscape of the modern job market with real-time data and corporate trends across India.
                  </p>
               </div>
               {/* Quick Insights Cards */}
               <div className="grid grid-cols-2 gap-6">
                  {[
                     { label: 'Avg Increase', val: '14.2%', icon: TrendingUp, color: 'text-emerald-400' },
                     { label: 'High Demand', val: 'Management', icon: Activity, color: 'text-[#4F8EF7]' }
                  ].map((stat, i) => (
                     <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6 group hover:border-white/10 transition-all shadow-2xl">
                        <div className={`p-5 rounded-2xl bg-white/5 border border-white/10 w-fit ${stat.color} group-hover:scale-110 transition-transform`}>
                           <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-white">{stat.val}</p>
                           <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Search Matrix - Glass Island */}
            <div className="glass-island p-3 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-3 transition-all hover:border-white/10 group shadow-2xl">
               <div className="flex-1 w-full relative flex items-center">
                  <Search className="absolute left-8 w-6 h-6 text-[#4F8EF7]" />
                  <input
                     type="text"
                     placeholder="Job Role / Domain / Industry..."
                     className="w-full bg-transparent border-none outline-none text-white placeholder:text-text-muted pl-20 pr-6 py-8 font-black text-2xl tracking-tight"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="hidden md:block w-[1px] h-14 bg-white/10" />
               <div className="px-8 flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-[#F05674]" />
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">PAN INDIA MARKET</span>
               </div>
               <button className="btn-power w-full md:w-64 !py-8 !rounded-[1.8rem] !shadow-none hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] text-lg flex items-center justify-center gap-3">
                  Scan Worth <ArrowUpRight className="w-5 h-5 flex-shrink-0" />
               </button>
            </div>

            {/* Result Deck - Elite Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <AnimatePresence mode="popLayout">
                  {filteredData.length > 0 ? (
                     filteredData.map((data, i) => (
                        <motion.div
                           key={data.role}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           whileHover={{ y: -10 }}
                           className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8 group hover:border-[#4F8EF7]/30 transition-all shadow-2xl relative flex flex-col h-full"
                        >
                           <div className="flex justify-between items-start">
                              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#4F8EF7]/10 group-hover:border-[#4F8EF7]/40 transition-all">
                                 <BarChart3 className="w-6 h-6 text-white/40 group-hover:text-[#4F8EF7] transition-colors" />
                              </div>
                              <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full border shadow-inner ${data.growth === 'up' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-[#F05674]/10 border-[#F05674]/20 text-[#F05674]'}`}>
                                 {data.growth === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                 {data.trend}
                              </div>
                           </div>
                           <div className="flex-1 space-y-2">
                              <h4 className="text-xl font-black text-white tracking-tight group-hover:text-[#4F8EF7] transition-colors line-clamp-2 leading-snug">{data.role}</h4>
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] opacity-60">Avg Package / Annum</p>
                           </div>
                           <div className="pt-4 border-t border-white/5">
                              <p className="text-2xl font-black text-white tracking-tighter">
                                 {data.avg}
                              </p>
                           </div>
                           <Link to="/jobs" className="text-[10px] font-black text-[#4F8EF7] hover:text-white transition-all uppercase tracking-[0.2em] flex items-center justify-between group/link pt-2 leading-none">
                              View Openings <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                           </Link>

                           {/* Decorative Hover Glow */}
                           <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/0 to-[#4F8EF7]/0 group-hover:from-[#4F8EF7]/5 group-hover:to-transparent pointer-events-none transition-all duration-500 rounded-[3rem]" />
                        </motion.div>
                     ))
                  ) : (
                     <div className="col-span-full py-32 text-center glass-card border-white/5 space-y-8 rounded-[4rem]">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                           <BarChart3 className="w-10 h-10 text-text-muted opacity-40" />
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">Intelligence Not Found</h3>
                        <Button variant="secondary" className="px-10 py-5 rounded-2xl" onClick={() => setSearchQuery('')}>Reset Matrix</Button>
                     </div>
                  )}
               </AnimatePresence>
            </div>

            {/* Intelligence Disclosure */}
            <div className="glass-card p-12 rounded-[4rem] border-white/5 flex flex-col md:flex-row items-center gap-12 group hover:border-[#4F8EF7]/30 transition-all shadow-2xl relative overflow-hidden text-left">
               <div className="absolute top-0 right-0 w-96 h-full bg-[#4F8EF7]/5 blur-[100px] rounded-full translate-x-1/2 -z-10" />
               <div className="w-24 h-24 rounded-3xl bg-[#4F8EF7]/10 flex items-center justify-center border border-[#4F8EF7]/20 flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <Info className="w-10 h-10 text-[#4F8EF7]" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Data Precision Intelligence</h3>
                  <p className="text-base font-medium text-text-secondary opacity-80 leading-relaxed max-w-4xl">
                     Salary intelligence is aggregated from real-time corporate data points and is strictly meant for market positioning. Individual valuation depends on core competencies, specialized certifications, and current market deployment demand.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Salaries;

