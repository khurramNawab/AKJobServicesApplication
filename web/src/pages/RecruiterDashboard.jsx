import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, Plus, LayoutDashboard, Search, Filter, Edit, Trash2, ChevronRight, BarChart3, TrendingUp, Building2, Calendar, MoreVertical, MessageSquare, UserCheck, Star, MapPin, IndianRupee, ArrowRight } from 'lucide-react';
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
        
        // Calculate basic stats
        setStats({
          activeJobs: jobsData.length,
          totalApplicants: jobsData.reduce((acc, job) => acc + (job.applicantsCount || 0), 0),
          shortlisted: 0, // Mock for now
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
            // await api.delete(`/jobs/${id}`); // Assuming delete route exists
            setJobs(jobs.filter(job => job._id !== id));
        } catch (err) {
            console.error('Failed to delete job:', err);
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 px-6 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-32 px-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 space-y-12">
        
        {/* Recruitment Command Center Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary-light italic">
                 RECRUITER COMMAND CENTER
              </div>
              <h1 className="text-5xl font-black tracking-tight leading-tight">Empower your <span className="gradient-text">Hiring</span>.</h1>
              <p className="text-slate-400 font-medium text-lg max-w-xl">Manage your open positions, track applicants, and discover top-tier talent from around the globe.</p>
           </div>
           <div className="flex gap-4">
              <Button size="lg" variant="cta" onClick={() => navigate('/post-job')} className="rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3 px-8">
                 <Plus className="w-5 h-5" /> Post New Job
              </Button>
           </div>
        </div>

        {/* Dash Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Active Openings', value: stats.activeJobs, icon: Briefcase, color: 'text-primary-light', trend: '+2 this month' },
             { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-indigo-400', trend: '+12% growth' },
             { label: 'New Apps', value: stats.newApplicants, icon: TrendingUp, color: 'text-emerald-400', trend: 'Critical attention' },
             { label: 'Shortlisted', value: stats.shortlisted, icon: UserCheck, color: 'text-amber-400', trend: 'Ongoing review' }
           ].map((stat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col gap-5 hover:border-white/10 transition-all shadow-xl group"
             >
                <div className="flex justify-between items-start">
                   <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-primary/10 transition-colors">
                      <BarChart3 className="w-4 h-4 text-slate-600 group-hover:text-primary-light" />
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-4xl font-black text-white">{stat.value}</p>
                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
                <div className="pt-4 mt-auto border-t border-white/5 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.trend}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Management Area */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                 Your <span className="text-primary-light">Active Postings</span>
              </h2>
              <div className="hidden sm:flex gap-3">
                  <div className="glass-card flex items-center p-1 rounded-xl border-white/5">
                     {['List', 'Grid'].map(v => (
                        <button key={v} className={`px-4 py-2 rounded-lg text-xs font-extrabold tracking-widest uppercase transition-all ${v === 'List' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600'}`}>{v}</button>
                     ))}
                  </div>
              </div>
           </div>

           <div className="space-y-5">
              {jobs.length > 0 ? (
                jobs.map((job, i) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-8 rounded-[3rem] border-white/5 group hover:border-white/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-10 shadow-xl overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-48 h-full bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                    
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/10 border border-primary/20 flex items-center justify-center p-4 shadow-inner group-hover:scale-110 transition-transform">
                           <Building2 className="w-full h-full text-primary-light" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-2xl font-black group-hover:text-primary-light transition-colors">{job.title}</h3>
                           <div className="flex flex-wrap items-center gap-5 text-slate-500 font-bold text-xs uppercase tracking-widest">
                               <span className="flex items-center gap-2 border-r border-white/10 pr-5"><MapPin className="w-4 h-4 text-slate-700" /> {job.location}</span>
                               <span className="flex items-center gap-2 border-r border-white/10 pr-5"><Calendar className="w-4 h-4 text-slate-700" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                               <span className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-slate-700" /> {job.salaryRange ? `${job.salaryRange.min || 0}-${job.salaryRange.max || 0} ${job.salaryRange.currency || 'USD'}` : 'Not Specified'}</span>
                           </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:gap-10">
                        {/* Status Stats for particular job */}
                        <div className="flex gap-8 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-3xl min-w-[200px] justify-around">
                            <div className="text-center">
                               <p className="text-xl font-black text-white">{job.applicantsCount || 0}</p>
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Applicants</p>
                            </div>
                            <div className="w-[1px] h-8 bg-white/5" />
                            <div className="text-center">
                               <p className="text-xl font-black text-emerald-400">0</p>
                               <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Shortlisted</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => navigate(`/jobs/${job._id}/applications`)}
                                className="flex items-center gap-3 px-6 py-4 bg-primary/10 border border-primary/20 text-primary-light font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                            >
                               View applicants <ArrowRight className="w-4 h-4" />
                            </button>
                            <div className="relative group/more">
                                <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-slate-500 hover:text-white">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 hidden group-hover/more:block z-50">
                                   <div className="glass-card border-white/10 shadow-2xl overflow-hidden rounded-2xl flex flex-col p-1">
                                      <button className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all"><Edit className="w-4 h-4" /> Edit details</button>
                                      <button 
                                        onClick={() => handleDeleteJob(job._id)}
                                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-secondary-soft hover:bg-secondary/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /> Delete post</button>
                                   </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center glass-card rounded-[4rem] border-white/5 space-y-8 max-w-2xl mx-auto">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 animate-float">
                       <Briefcase className="w-16 h-16 text-slate-700" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-4xl font-black tracking-tight">Hire your next <br/> <span className="gradient-text">Top Performer</span>.</h3>
                        <p className="text-slate-500 font-medium px-10">You currently have no active job postings. Start scaling your team now.</p>
                    </div>
                    <Button variant="cta" onClick={() => navigate('/post-job')} className="w-auto px-10 py-5 rounded-2xl">Create Job Posting</Button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
