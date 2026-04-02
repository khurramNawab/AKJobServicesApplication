import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, Plus, LayoutDashboard, Search, Filter, Edit, Trash2, ChevronRight, BarChart3, TrendingUp, Building2, Calendar, MoreVertical, MessageSquare, UserCheck, Star, MapPin, IndianRupee, ArrowRight, Zap, Target, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    newApplicants: 0
  });

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const res = await api.get('/jobs/me');
        const jobsData = res.data.data;
        setJobs(jobsData);
        
        setStats({
          activeJobs: jobsData.length,
          totalApplicants: jobsData.reduce((acc, job) => acc + (job.applicantsCount || 0), 0),
          shortlisted: 0,
          newApplicants: jobsData.reduce((acc, job) => acc + (job.newApplicantsCount || 0), 0)
        });
      } catch (err) {
        console.error('Failed to fetch recruiter data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, []);

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
        try {
            setJobs(jobs.filter(job => job._id !== id));
        } catch (err) {
            console.error('Failed to delete job:', err);
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 px-6 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Recruitment Cluster...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-40 px-6 relative overflow-hidden">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto z-10 space-y-20 relative text-left">
        
        {/* Recruitment Command Center Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                 <Target className="w-3 h-3" /> Talent Acquisition Hub
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">Command your <span className="gradient-text">Hiring</span>.</h1>
              <p className="text-text-secondary text-xl font-medium opacity-80 leading-relaxed max-w-2xl">
                Control your corporate trajectory, manage elite talent pipelines, and architect your future global team.
              </p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={() => navigate('/post-job')} 
                className="btn-power w-full md:w-auto !px-12 !py-8 !rounded-[2rem] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)] text-lg"
              >
                 <Plus className="w-6 h-6" /> Initialize Posting
              </button>
           </div>
        </div>

        {/* Intelligence Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Active Sector', value: stats.activeJobs, icon: Briefcase, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10', trend: '+2 this month' },
             { label: 'Total Signal', value: stats.totalApplicants, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: '+12% growth' },
             { label: 'New Activity', value: stats.newApplicants, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: 'Critical attention' },
             { label: 'Selected Elite', value: stats.shortlisted, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: 'Ongoing review' }
           ].map((stat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               whileHover={{ y: -5 }}
               className="glass-card p-10 rounded-[3rem] border-white/5 flex flex-col gap-6 group hover:border-[#2563EB]/40 transition-all shadow-2xl relative overflow-hidden h-full"
             >
                <div className="flex justify-between items-start">
                   <div className={`p-5 rounded-2xl ${stat.bg} border border-white/10 ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-[#2563EB]/30 transition-all">
                      <BarChart3 className="w-5 h-5 text-white/20 group-hover:text-[#2563EB]" />
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
                <div className="pt-6 mt-auto border-t border-white/5 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] opacity-60 italic">{stat.trend}</p>
                </div>
                {/* Visual Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[80px] -z-10 opacity-20 group-hover:opacity-40 transition-opacity`} />
             </motion.div>
           ))}
        </div>

        {/* Posting Matrix */}
        <div className="space-y-12">
           <div className="flex items-center justify-between border-b border-white/10 pb-10">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                 <div className="w-1.5 h-8 bg-[#EF4444] rounded-full" /> Pipeline <span className="text-[#2563EB]">Intelligence</span>
              </h2>
              <div className="hidden sm:flex gap-4">
                  <div className="bg-white/5 p-1.5 rounded-2xl flex gap-1 border border-white/5">
                     {['Grid', 'Table'].map(v => (
                        <button key={v} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${v === 'Grid' ? 'bg-[#2563EB] text-white shadow-xl shadow-[#2563EB]/30' : 'text-text-muted hover:text-white'}`}>{v}</button>
                     ))}
                  </div>
              </div>
           </div>

           <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {jobs.length > 0 ? (
                  jobs.map((job, i) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ x: 10 }}
                      className="glass-card p-10 rounded-[4rem] border-white/5 group hover:border-[#2563EB]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-12 shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-96 h-full bg-[#2563EB]/5 blur-[120px] -z-10 group-hover:bg-[#2563EB]/10 transition-colors pointer-events-none" />
                      
                      <div className="flex items-center gap-10">
                          <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center p-6 shadow-inner group-hover:scale-105 group-hover:border-[#2563EB]/40 transition-all">
                             {user?.companyLogo ? (
                               <img src={user.companyLogo} alt="Corp" className="w-full h-full object-contain" />
                             ) : (
                               <Building2 className="w-full h-full text-white/20 group-hover:text-white transition-all" />
                             )}
                          </div>
                          <div className="space-y-4 text-left">
                             <h3 className="text-3xl font-black text-white tracking-tight group-hover:text-[#2563EB] transition-colors leading-none">{job.title}</h3>
                             <div className="flex flex-wrap items-center gap-6 text-text-muted font-black text-[10px] uppercase tracking-[0.2em] opacity-70">
                                 <span className="flex items-center gap-2.5">
                                    <MapPin className="w-4 h-4 text-[#EF4444]" /> {job.location}
                                 </span>
                                 <span className="flex items-center gap-2.5">
                                    <Calendar className="w-4 h-4 text-[#2563EB]" /> {new Date(job.createdAt).toLocaleDateString('en-IN')}
                                 </span>
                                 <span className="flex items-center gap-2.5">
                                    <IndianRupee className="w-4 h-4 text-emerald-400" /> 
                                    {job.salaryRange ? `${job.salaryRange.min || 0}-${job.salaryRange.max || 0} ${job.salaryRange.currency || 'INR'}` : 'Market Competitive'}
                                 </span>
                             </div>
                          </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 lg:gap-12">
                          {/* Intensity Status Board */}
                          <div className="flex gap-10 px-10 py-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] min-w-[280px] justify-between shadow-inner group-hover:border-[#2563EB]/30 transition-all">
                              <div className="text-center space-y-1">
                                 <p className="text-3xl font-black text-white tracking-tighter">{job.applicantsCount || 0}</p>
                                 <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Signals</p>
                              </div>
                              <div className="w-[1px] h-12 bg-white/10" />
                              <div className="text-center space-y-1">
                                 <p className="text-3xl font-black text-emerald-400 tracking-tighter">0</p>
                                 <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Elite</p>
                              </div>
                          </div>

                          <div className="flex gap-4 w-full sm:w-auto">
                              <button 
                                  onClick={() => navigate(`/jobs/${job._id}/applications`)}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-10 py-6 bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.8rem] hover:bg-[#2563EB] hover:text-white transition-all shadow-xl shadow-[#2563EB]/5 active:scale-95"
                              >
                                 Screen Talent <ArrowRight className="w-5 h-5" />
                              </button>
                              <div className="relative group/more">
                                  <button className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.8rem] transition-all text-text-muted hover:text-white shadow-lg">
                                      <MoreVertical className="w-6 h-6" />
                                  </button>
                                  <div className="absolute right-0 top-full mt-4 w-56 hidden group-hover/more:block z-50">
                                     <div className="glass-island border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2rem] flex flex-col p-2">
                                        <button className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em] text-text-secondary hover:bg-white/5 hover:text-white rounded-xl transition-all"><Edit className="w-4 h-4 text-[#2563EB]" /> Edit Posting</button>
                                        <button 
                                          onClick={() => handleDeleteJob(job._id)}
                                          className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em] text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /> Decommission</button>
                                     </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-32 text-center glass-card border-white/5 space-y-10 rounded-[5rem] group shadow-2xl max-w-4xl mx-auto overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB]/5 to-transparent pointer-events-none" />
                      <div className="w-32 h-32 bg-white/5 rounded-[3.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-inner group-hover:scale-110 transition-all group-hover:border-[#2563EB]/40 relative">
                         <Activity className="w-12 h-12 text-white/20 group-hover:text-white transition-all" />
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">Scale your next <br/> <span className="gradient-text">Global Elite Team</span>.</h3>
                          <p className="text-text-secondary text-lg font-medium opacity-60 px-12 leading-relaxed">Your corporate hiring sectors are currently inactive. Initialize a new recruitment matrix to start sourcing top-tier performers.</p>
                      </div>
                      <button onClick={() => navigate('/post-job')} className="btn-power !px-12 !py-6 !rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#2563EB]/20">Create Hiring Matrix</button>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
