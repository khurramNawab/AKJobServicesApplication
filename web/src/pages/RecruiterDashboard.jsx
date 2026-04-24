import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Users, Plus, Building2, Edit, Trash2, ChevronRight, BarChart3, TrendingUp, MoreVertical, MapPin, ArrowRight, Target, Activity, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('Table');
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    newApplicants: 0
  });
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    if (window.confirm('Are you sure you want to delete this job posting? This will also remove all associated applications.')) {
        try {
            await api.delete(`/jobs/${id}`);
            setJobs(jobs.filter(job => job._id !== id));
            setStats(prev => ({
               ...prev,
               activeJobs: prev.activeJobs - 1
            }));
        } catch (err) {
            console.error('Failed to delete job:', err);
            alert(err.response?.data?.message || 'Failed to delete job');
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
    <div className="min-h-[60vh] bg-[#020617] pt-24 pb-6 px-6 relative overflow-hidden text-left">
      {/* 🌌 Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="max-w-7xl mx-auto z-10 space-y-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                 <Target className="w-3 h-3" /> Talent Acquisition Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">Command your <span className="gradient-text">Hiring</span>.</h1>
              <p className="text-text-secondary text-base font-medium opacity-80 leading-relaxed max-w-2xl">
                Control your corporate trajectory, manage elite talent pipelines, and architect your future global team.
              </p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button onClick={() => navigate('/post-job')} className="btn-power w-full md:w-auto !px-6 !py-4 !rounded-xl flex items-center justify-center gap-2 text-sm">
                 <Plus className="w-5 h-5" /> Initialize Posting
              </button>
           </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10', trend: 'Live Sector' },
             { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: 'Global Reach' },
             { label: 'Shortlisted', value: 0, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: 'Awaiting Review' },
             { label: 'Elite Tier', value: 0, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: 'Verified Talent' }
           ].map((stat, i) => (
             <div key={i} className="glass-card p-5 rounded-xl border-white/10 flex flex-col gap-4 group hover:border-[#2563EB]/40 transition-all h-full">
                <div className="flex justify-between items-start">
                   <div className={`p-3 rounded-lg ${stat.bg} border border-white/10 ${stat.color} transition-transform`}><stat.icon className="w-5 h-5" /></div>
                   <BarChart3 className="w-4 h-4 text-white/20" />
                </div>
                <div className="flex flex-col items-start gap-1">
                   <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                   <p className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-[0.1em]">{stat.label}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                 <div className="w-1 h-6 bg-[#EF4444] rounded-full" /> Pipeline <span className="text-[#2563EB]">Intelligence</span>
              </h2>
              <div className="hidden sm:flex gap-4">
                  <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/5">
                     {['Grid', 'Table'].map(v => (
                        <button key={v} onClick={() => setViewMode(v)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === v ? 'bg-[#2563EB] text-white shadow-lg' : 'text-text-muted hover:text-white'}`}>{v}</button>
                     ))}
                  </div>
              </div>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {jobs.length > 0 ? (
                  viewMode === 'Grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {jobs.map((job) => (
                         <div key={job._id} className="glass-card p-5 rounded-xl border-white/5 bg-white/[0.01] flex flex-col gap-5 hover:border-[#2563EB]/40 transition-all">
                            <div className="flex justify-between items-start">
                               <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-2">
                                  {user?.companyLogo ? <img src={user.companyLogo} alt="Logo" className="w-full h-full object-contain" /> : <Building2 className="w-5 h-5 text-white/20" />}
                               </div>
                               <div className="relative">
                                 <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === job._id ? null : job._id); }} className={`p-2 rounded-lg transition-colors ${activeMenuId === job._id ? 'bg-primary text-white' : 'text-text-muted hover:bg-white/5'}`}><MoreVertical className="w-4 h-4" /></button>
                                 <AnimatePresence>
                                   {activeMenuId === job._id && (
                                     <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-full mt-2 w-48 z-[100] bg-[#0F172A] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                        <button onClick={() => navigate(`/jobs/${job._id}/edit`)} className="w-full text-left px-5 py-4 text-[10px] font-black uppercase hover:bg-white/5 text-white flex items-center gap-3"><Edit className="w-4 h-4 text-primary" /> Edit Posting</button>
                                        <button onClick={() => handleDeleteJob(job._id)} className="w-full text-left px-5 py-4 text-[10px] font-black uppercase hover:bg-secondary/10 text-secondary-soft flex items-center gap-3 border-t border-white/5"><Trash2 className="w-4 h-4" /> Purge Matrix</button>
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                               </div>
                            </div>
                            <div className="space-y-1">
                               <h3 className="font-black text-white leading-tight line-clamp-1">{job.title}</h3>
                               <p className="text-[10px] text-text-muted font-bold flex items-center gap-2"><MapPin className="w-3 h-3" /> {job.location}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                               <div className="flex gap-4">
                                  <div className="text-center"><p className="text-sm font-black text-white">{job.applicantsCount || 0}</p><p className="text-[8px] text-text-muted uppercase">Apps</p></div>
                                  <div className="text-center"><p className="text-sm font-black text-emerald-400">0</p><p className="text-[8px] text-text-muted uppercase">New</p></div>
                               </div>
                               <button onClick={() => navigate(`/jobs/${job._id}/applications`)} className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-lg hover:bg-[#2563EB] transition-all"><ArrowRight className="w-4 h-4" /></button>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl border-white/5 bg-white/[0.01]">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-white/5 border-b border-white/10">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Job Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Metrics</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Operations</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {jobs.map((job) => (
                               <tr key={job._id} className="hover:bg-white/[0.02] transition-colors group">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center p-1.5"><Building2 className="w-4 h-4 text-white/20" /></div>
                                        <div>
                                           <p className="text-sm font-black text-white">{job.title}</p>
                                           <p className="text-[10px] text-text-muted font-bold">{job.location} • {new Date(job.createdAt).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                  </td>
                                   <td className="px-6 py-4 text-center">
                                      <span className={`px-3 py-1 border rounded-full text-[8px] font-black uppercase tracking-widest ${
                                        job.status === 'OPEN' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                        job.status === 'CLOSED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                      }`}>
                                         {job.status || 'OPEN'}
                                      </span>
                                   </td>
                                  <td className="px-6 py-4">
                                     <div className="flex items-center justify-center gap-4">
                                        <div className="text-center"><p className="text-sm font-black text-white">{job.applicantsCount || 0}</p><p className="text-[8px] text-text-muted uppercase">Total</p></div>
                                        <div className="text-center"><p className="text-sm font-black text-emerald-400">0</p><p className="text-[8px] text-text-muted uppercase">New</p></div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => navigate(`/jobs/${job._id}/applications`)} className="px-4 py-2 bg-[#2563EB]/10 text-[#2563EB] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#2563EB] hover:text-white transition-all">Screen</button>
                                        <div className="relative">
                                           <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === job._id ? null : job._id); }} className={`p-2 rounded-lg transition-colors ${activeMenuId === job._id ? 'bg-primary text-white' : 'text-text-muted hover:bg-white/5'}`}><MoreVertical className="w-4 h-4" /></button>
                                           <AnimatePresence>
                                              {activeMenuId === job._id && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-full mt-2 w-48 z-[100] bg-[#0F172A] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                                   <button onClick={() => navigate(`/jobs/${job._id}/edit`)} className="w-full text-left px-5 py-4 text-[10px] font-black uppercase hover:bg-white/5 text-white flex items-center gap-3"><Edit className="w-4 h-4 text-primary" /> Edit Posting</button>
                                                   <button onClick={() => handleDeleteJob(job._id)} className="w-full text-left px-5 py-4 text-[10px] font-black uppercase hover:bg-secondary/10 text-secondary-soft flex items-center gap-3 border-t border-white/5"><Trash2 className="w-4 h-4" /> Purge Matrix</button>
                                                </motion.div>
                                              )}
                                           </AnimatePresence>
                                        </div>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  )
                ) : (
                  <div className="py-16 text-center glass-card border-white/5 space-y-6 rounded-[3rem] group shadow-2xl max-w-2xl mx-auto overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB]/5 to-transparent pointer-events-none" />
                      <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                         <Activity className="w-8 h-8 text-white/20" />
                      </div>
                      <div className="space-y-2">
                          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-tight">Scale your next <span className="gradient-text">Global Elite Team</span>.</h3>
                          <p className="text-text-secondary text-sm font-medium opacity-60 px-12 leading-relaxed">Your corporate hiring sectors are currently inactive. Initialize a new recruitment matrix to start sourcing top-tier performers.</p>
                      </div>
                      <button onClick={() => navigate('/post-job')} className="btn-power !px-10 !py-5 !rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#2563EB]/20">Create Hiring Matrix</button>
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
