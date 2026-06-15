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
      <div className="min-h-screen bg-bg-main pt-40 px-6 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-[#4F8EF7]/20 border-t-[#4F8EF7] rounded-full animate-spin" />
        <p className="text-text-muted text-xs">Loading recruitment data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-bg-main pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-left">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-orb top-[-10%] right-[-5%] w-[42%] h-[42%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite' }} />
        <div className="glow-orb bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-5s' }} />
      </div>

      <div className="max-w-7xl mx-auto z-10 space-y-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[10px] font-medium uppercase tracking-wider text-[#4F8EF7]">
                 <Target className="w-3 h-3" /> Talent Acquisition Hub
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">Command your <span className="gradient-text">Hiring</span>.</h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
                Control your corporate trajectory, manage talent pipelines, and build your global team.
              </p>
           </div>
           <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => navigate('/post-job')} className="btn-power w-full md:w-auto flex items-center justify-center gap-2 text-sm">
                 <Plus className="w-4 h-4" /> Post a Job
              </button>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Active Jobs',      value: stats.activeJobs,      icon: Briefcase,  color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10' },
             { label: 'Total Applicants', value: stats.totalApplicants,  icon: Users,      color: 'text-[#38BDF8]', bg: 'bg-[#38BDF8]/10' },
             { label: 'Shortlisted',      value: 0,                      icon: TrendingUp, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10' },
             { label: 'Elite Tier',       value: 0,                      icon: UserCheck,  color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10' }
           ].map((stat, i) => (
             <div key={i} className="glass-card p-5 flex flex-col gap-3 group h-full">
                <div className="flex justify-between items-start">
                   <div className={`p-2.5 rounded-lg ${stat.bg} border border-[rgba(255,255,255,0.06)] ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                   <BarChart3 className="w-4 h-4 text-text-muted" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                   <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                   <p className="label-caps">{stat.label}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] pb-4">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                 <div className="w-1 h-5 bg-[#4F8EF7] rounded-full" /> Job Pipeline
              </h2>
              <div className="hidden sm:flex gap-2">
                  <div className="bg-white/[0.04] p-1 rounded-lg flex gap-1 border border-[rgba(255,255,255,0.06)]">
                     {['Grid', 'Table'].map(v => (
                        <button key={v} onClick={() => setViewMode(v)} className={`px-3 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider transition-all ${viewMode === v ? 'bg-[#4F8EF7] text-white shadow-md' : 'text-text-muted hover:text-text-secondary'}`}>{v}</button>
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
                         <div key={job._id} className="glass-card p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                               <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-[rgba(255,255,255,0.07)] flex items-center justify-center p-2">
                                  {user?.companyLogo ? <img src={user.companyLogo} alt="Logo" className="w-full h-full object-contain" /> : <Building2 className="w-5 h-5 text-text-muted" />}
                               </div>
                               <div className="relative">
                                 <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === job._id ? null : job._id); }} className={`p-2 rounded-lg transition-colors ${activeMenuId === job._id ? 'bg-[#4F8EF7] text-white' : 'text-text-muted hover:bg-white/[0.05]'}`}><MoreVertical className="w-4 h-4" /></button>
                                 <AnimatePresence>
                                   {activeMenuId === job._id && (
                                     <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-44 z-[100] bg-[#162035] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden shadow-2xl">
                                        <button onClick={() => navigate(`/jobs/${job._id}/edit`)} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/[0.05] text-text-primary flex items-center gap-2.5"><Edit className="w-3.5 h-3.5 text-[#4F8EF7]" /> Edit Job</button>
                                        <button onClick={() => handleDeleteJob(job._id)} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F05674]/10 text-[#F05674] flex items-center gap-2.5 border-t border-[rgba(255,255,255,0.05)]"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                               </div>
                            </div>
                            <div className="space-y-1">
                               <h3 className="font-semibold text-text-primary leading-tight line-clamp-1">{job.title}</h3>
                               <p className="text-xs text-text-muted flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {job.location}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.05)]">
                               <div className="flex gap-4">
                                  <div className="text-center"><p className="text-sm font-bold text-text-primary">{job.applicantsCount || 0}</p><p className="text-[9px] text-text-muted uppercase">Apps</p></div>
                                  <div className="text-center"><p className="text-sm font-bold text-[#34D399]">0</p><p className="text-[9px] text-text-muted uppercase">New</p></div>
                               </div>
                               <button onClick={() => navigate(`/jobs/${job._id}/applications`)} className="p-2 bg-[#4F8EF7]/10 text-[#4F8EF7] rounded-lg hover:bg-[#4F8EF7] hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></button>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="glass-card rounded-xl overflow-hidden">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="border-b border-[rgba(255,255,255,0.06)]">
                                <th className="px-5 py-3.5 label-caps">Job</th>
                                <th className="px-5 py-3.5 label-caps text-center">Status</th>
                                <th className="px-5 py-3.5 label-caps text-center">Metrics</th>
                                <th className="px-5 py-3.5 label-caps text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                             {jobs.map((job) => (
                               <tr key={job._id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-5 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center p-1.5"><Building2 className="w-4 h-4 text-text-muted" /></div>
                                        <div>
                                           <p className="text-sm font-semibold text-text-primary">{job.title}</p>
                                           <p className="text-xs text-text-muted">{job.location} · {new Date(job.createdAt).toLocaleDateString()}</p>
                                        </div>
                                     </div>
                                  </td>
                                   <td className="px-5 py-4 text-center">
                                      <span className={`badge ${
                                        job.status === 'OPEN' ? 'badge-green' :
                                        job.status === 'CLOSED' ? 'badge-red' :
                                        'badge-yellow'
                                      }`}>
                                         {job.status || 'OPEN'}
                                      </span>
                                   </td>
                                  <td className="px-5 py-4">
                                     <div className="flex items-center justify-center gap-4">
                                        <div className="text-center"><p className="text-sm font-bold text-text-primary">{job.applicantsCount || 0}</p><p className="text-[9px] text-text-muted uppercase">Total</p></div>
                                        <div className="text-center"><p className="text-sm font-bold text-[#34D399]">0</p><p className="text-[9px] text-text-muted uppercase">New</p></div>
                                     </div>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => navigate(`/jobs/${job._id}/applications`)} className="px-3 py-1.5 bg-[#4F8EF7]/10 text-[#4F8EF7] text-xs font-medium rounded-lg hover:bg-[#4F8EF7] hover:text-white transition-all">Review</button>
                                        <div className="relative">
                                           <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === job._id ? null : job._id); }} className={`p-2 rounded-lg transition-colors ${activeMenuId === job._id ? 'bg-[#4F8EF7] text-white' : 'text-text-muted hover:bg-white/[0.05]'}`}><MoreVertical className="w-4 h-4" /></button>
                                           <AnimatePresence>
                                              {activeMenuId === job._id && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-44 z-[100] bg-[#162035] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden shadow-2xl">
                                                   <button onClick={() => navigate(`/jobs/${job._id}/edit`)} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/[0.05] text-text-primary flex items-center gap-2.5"><Edit className="w-3.5 h-3.5 text-[#4F8EF7]" /> Edit</button>
                                                   <button onClick={() => handleDeleteJob(job._id)} className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F05674]/10 text-[#F05674] flex items-center gap-2.5 border-t border-[rgba(255,255,255,0.05)]"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
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
                  <div className="py-16 text-center glass-card space-y-6 max-w-lg mx-auto relative">
                      <div className="w-16 h-16 bg-[#4F8EF7]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#4F8EF7]/15">
                         <Activity className="w-7 h-7 text-[#4F8EF7]" />
                      </div>
                      <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-text-primary">Ready to find great talent?</h3>
                          <p className="text-text-secondary text-sm px-8 leading-relaxed">Your job listings are empty. Post your first role to start building your team.</p>
                      </div>
                      <button onClick={() => navigate('/post-job')} className="btn-power">Post a Job</button>
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

