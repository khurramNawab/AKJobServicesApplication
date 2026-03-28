import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, IndianRupee, TrendingUp, BarChart3, Briefcase, MapPin, MousePointer2, Info, ArrowUpRight, ArrowDownRight, Activity, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header Section */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary-light italic">
                   SALARY EXPLORER
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">Know your <span className="gradient-text">Worth</span>.</h1>
                <p className="text-slate-400 font-medium text-lg max-w-lg">
                  Navigate the financial landscape of the modern job market with real-time data and market trends across the nation.
                </p>
            </div>
            {/* Quick Insights Cards */}
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Avg Increase', val: '14.2%', icon: TrendingUp, color: 'text-emerald-400' },
                 { label: 'High Demand', val: 'Cloud Arch', icon: Activity, color: 'text-primary-light' }
               ].map((stat, i) => (
                 <div key={i} className="glass-card p-6 rounded-3xl border-white/5 space-y-4">
                    <div className={`p-4 rounded-xl bg-white/5 border border-white/10 w-fit ${stat.color}`}>
                       <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-black">{stat.val}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                 </div>
               ))}
            </div>
        </div>

        {/* Search Matrix */}
        <div className="glass-card p-2 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-2">
           <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 blur-3xl rounded-full translate-x-1/2" />
           
           <div className="flex-1 relative flex items-center">
              <Search className="absolute left-6 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Job Role / Domain..." 
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 pl-16 pr-4 py-6 font-black text-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="hidden md:block w-[1px] h-12 self-center bg-white/10" />
           <div className="px-6 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Across India</span>
           </div>
           <Button variant="cta" className="md:w-48 rounded-[1.5rem] py-6 text-lg font-black group">
              Scan <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </Button>
        </div>

        {/* Result Deck */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <AnimatePresence mode="popLayout">
              {filteredData.length > 0 ? (
                filteredData.map((data, i) => (
                  <motion.div
                    key={data.role}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6 group hover:border-white/10 transition-all shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all">
                          <BarChart3 className="w-6 h-6 text-slate-500 group-hover:text-primary-light transition-colors" />
                       </div>
                       <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest py-1 px-2 rounded-lg ${data.growth === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-secondary/10 text-secondary-soft'}`}>
                          {data.growth === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {data.trend}
                       </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-lg font-bold group-hover:text-primary-light transition-colors line-clamp-1">{data.role}</h4>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Average Package / yr</p>
                    </div>
                    <div className="pt-2">
                        <p className="text-2xl font-black text-white flex items-center gap-1">
                           <IndianRupee className="w-5 h-5 text-primary-light" /> {data.avg}
                        </p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <Link to="/jobs" className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2 group/btn">
                          View Openings <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center glass-card rounded-[3rem] border-white/5 space-y-6">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <BarChart3 className="w-10 h-10 text-slate-700" />
                   </div>
                   <h3 className="text-xl font-bold">No data found</h3>
                   <Button variant="outline" className="w-auto px-8" onClick={() => setSearchQuery('')}>Rest Exploration</Button>
                </div>
              )}
           </AnimatePresence>
        </div>

        {/* Final Disclaimer/Info */}
        <div className="glass-card p-10 rounded-[3rem] border-white/5 flex flex-col md:flex-row items-center gap-10">
           <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 flex-shrink-0">
              <Info className="w-10 h-10 text-primary-light" />
           </div>
           <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold">Data Precision Information</h3>
              <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                Salary figures are based on real-time anonymous data points and are strictly meant for approximate market positioning. Actual offers depend on factors including individual experience, location, and overall market demand at the time of hiring.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Salaries;
