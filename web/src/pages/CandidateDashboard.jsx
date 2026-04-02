import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Clock, CheckCircle2, XCircle, Search, MapPin, IndianRupee, ChevronRight, User, Settings, ExternalLink, Calendar, Filter, Star, Heart, Zap, ArrowRight, UserCheck, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/me');
        setApplications(res.data.data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const stats = [
    { label: 'Total Applied', value: applications.length, icon: Briefcase, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'Pending').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Accepted', value: applications.filter(a => a.status === 'Accepted').length, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Declined', value: applications.filter(a => a.status === 'Rejected').length, icon: XCircle, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' }
  ];

  const filteredApplications = activeTab === 'All' 
    ? applications 
    : applications.filter(app => app.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Dashboard Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-40 px-6 relative overflow-hidden">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto z-10 space-y-16 relative text-left">
        
        {/* Welcome Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-6">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                <Activity className="w-3 h-3" /> Candidate Operations Center
             </div>
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>.</h1>
             <p className="text-text-secondary text-xl font-medium opacity-80 leading-relaxed max-w-xl">
               Monitor your applications, manage your corporate presence, and accelerate your career trajectory.
             </p>
          </div>
          <Link to="/jobs">
            <button className="btn-power !px-12 !py-8 !rounded-[2rem] flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
               Explore New Roles <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Intelligence Stats Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-10 rounded-[3rem] border-white/5 flex flex-col gap-6 group hover:border-[#2563EB]/30 transition-all shadow-2xl relative overflow-hidden"
            >
              <div className={`p-5 rounded-2xl ${stat.bg} border border-white/10 w-fit ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-white transition-colors">{stat.label}</p>
              </div>
              {/* Subtle decorative glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-[60px] -z-10 group-hover:opacity-100 opacity-20 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Application Matrix */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-10">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                   <div className="w-1.5 h-8 bg-[#2563EB] rounded-full" /> Recent <span className="text-[#2563EB]">Applications</span>
                </h2>
                <div className="bg-white/5 p-1.5 rounded-[1.2rem] flex gap-1 border border-white/5 overflow-x-auto">
                   {['All', 'Pending', 'Accepted', 'Rejected'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${activeTab === t ? 'bg-[#2563EB] text-white shadow-xl shadow-[#2563EB]/30' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                      >
                        {t === 'Accepted' ? 'Shortlisted' : t === 'Rejected' ? 'Declined' : t}
                      </button>
                   ))}
                </div>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app, i) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ x: 10 }}
                      className="glass-card p-8 rounded-[3rem] border-white/5 hover:border-[#2563EB]/40 flex flex-col md:flex-row items-center justify-between gap-8 group transition-all relative overflow-hidden"
                    >
                      <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#2563EB]/10 group-hover:border-[#2563EB]/40 transition-all shadow-inner overflow-hidden">
                             {app.jobId?.recruiterId?.companyLogo ? (
                               <img src={app.jobId.recruiterId.companyLogo} alt="Company" className="w-full h-full object-contain" />
                             ) : (
                               <Briefcase className="w-8 h-8 text-white/20" />
                             )}
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-xl font-black text-white tracking-tight group-hover:text-[#2563EB] transition-colors line-clamp-1">{app.jobId?.title}</h3>
                             <p className="text-sm font-bold text-text-secondary opacity-60 flex items-center gap-3">
                               {app.jobId?.recruiterId?.companyName || 'Corporate Partner'} 
                               <span className="w-1.5 h-1.5 bg-white/10 rounded-full" /> 
                               <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#EF4444]" /> {app.jobId?.location}</span>
                             </p>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto">
                          <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-60">Matrix Status</p>
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-inner ${
                                app.status === 'Pending' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 
                                app.status === 'Accepted' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                                'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20'
                              }`}>
                                 {app.status === 'Accepted' ? 'Shortlisted' : app.status === 'Rejected' ? 'Declined' : 'In Review'}
                              </span>
                          </div>
                          <Link to={`/jobs/${app.jobId?._id}`}>
                            <button className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#2563EB]/40 text-text-muted hover:text-white transition-all shadow-xl">
                              <ExternalLink className="w-6 h-6" />
                            </button>
                          </Link>
                      </div>

                      {/* Decorative Background Element */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#2563EB]/0 group-hover:to-[#2563EB]/5 pointer-events-none transition-all duration-700" />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-32 text-center glass-card border-white/5 space-y-8 rounded-[4rem] group shadow-2xl">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner group-hover:border-[#2563EB]/40 transition-all">
                         <Search className="w-10 h-10 text-white/20" />
                      </div>
                      <div className="space-y-3">
                          <h3 className="text-3xl font-black text-white tracking-tight uppercase">No Matrix Data Found</h3>
                          <p className="text-text-secondary text-lg font-medium opacity-60 max-w-sm mx-auto">Your application history is currently empty in this intelligence sector.</p>
                      </div>
                      <Link to="/jobs" className="inline-block"><Button variant="secondary" className="px-10 py-5 rounded-2xl">Initialize Job Search</Button></Link>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User Intelligence Sidebar */}
          <div className="space-y-12">
             {/* Profile Status Board */}
             <div className="glass-card p-12 rounded-[4rem] border-white/5 space-y-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-bl from-[#2563EB]/10 to-transparent blur-3xl -z-10 group-hover:opacity-100 opacity-60 transition-opacity" />
                
                <div className="text-center space-y-6">
                   <div className="w-32 h-32 rounded-[3.5rem] bg-white/5 border-2 border-white/10 mx-auto flex items-center justify-center shadow-2xl relative group-hover:border-[#2563EB]/40 transition-all">
                      <User className="w-12 h-12 text-white/30 group-hover:text-white transition-all" />
                      <div className="absolute bottom-1 right-1 p-2.5 bg-emerald-500 rounded-full border-[6px] border-[#020617] shadow-lg animate-pulse" />
                   </div>
                   <div className="space-y-2">
                       <h3 className="text-3xl font-black text-white tracking-tight">{user?.name}</h3>
                       <div className="flex items-center justify-center gap-2 text-[#2563EB] text-[10px] font-black uppercase tracking-[0.2em] active-pulse">
                          Candidate ID Verified
                       </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <Link to="/profile">
                     <button className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 hover:border-[#2563EB]/30 rounded-[2rem] transition-all group/item shadow-inner">
                        <div className="flex items-center gap-4">
                           <Settings className="w-6 h-6 text-white/20 group-hover/item:text-[#2563EB] transition-colors" />
                           <span className="text-xs font-black text-white/60 uppercase tracking-widest group-hover/item:text-white transition-colors">Complete Profile</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover/item:translate-x-1 group-hover/item:text-white transition-all" />
                     </button>
                   </Link>
                </div>

                <div className="pt-10 border-t border-white/10 space-y-8">
                   <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Market Bookmarks</h4>
                     <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:animate-bounce" />
                   </div>
                   <div className="text-center py-8 px-4 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed group-hover:border-white/20 transition-all">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-loose">
                           Vault Intelligence System<br/>Establishing Secure Protocol...
                       </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
