import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Clock, CheckCircle2, XCircle, Search, MapPin, IndianRupee, ChevronRight, User, Settings, ExternalLink, Calendar, Filter, Star, Heart } from 'lucide-react';
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
    { label: 'Applied', value: applications.length, icon: Briefcase, color: 'text-primary-light' },
    { label: 'Pending', value: applications.filter(a => a.status === 'Pending').length, icon: Clock, color: 'text-amber-400' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'Accepted').length, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, icon: XCircle, color: 'text-secondary-soft' }
  ];

  const filteredApplications = activeTab === 'All' 
    ? applications 
    : applications.filter(app => app.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 px-6 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-32 px-6 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto z-10 space-y-12">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary-light italic">
                CANDIDATE DASHBOARD
             </div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight">Good day, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>.</h1>
             <p className="text-slate-400 font-medium text-lg">Keep track of your job applications and reach your dream career.</p>
          </div>
          <Link to="/jobs">
            <Button size="lg" variant="cta" className="rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 px-8">
               Explore New Jobs <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col gap-4 group hover:border-white/10 transition-all shadow-xl"
            >
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 w-fit ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Recent Applications Table/List Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black flex items-center gap-3">
                   Recent <span className="text-primary-light">Applications</span>
                </h2>
                <div className="flex gap-2">
                   {['All', 'Pending', 'Accepted', 'Rejected'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeTab === t ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}
                      >
                        {t}
                      </button>
                   ))}
                </div>
            </div>

            <div className="space-y-5">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, i) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 rounded-[2rem] border-white/5 hover:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 group transition-all"
                  >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:border-primary/30 transition-colors">
                           <Briefcase className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-lg font-bold group-hover:text-primary-light transition-colors">{app.jobId?.title}</h3>
                           <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                             TechVanguard Ltd <span className="w-1 h-1 bg-slate-700 rounded-full" /> {app.jobId?.location}
                           </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                              app.status === 'Pending' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 
                              app.status === 'Accepted' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                              'text-secondary-soft bg-secondary-soft/10 border-secondary-soft/20'
                            }`}>
                               {app.status}
                            </span>
                        </div>
                        <Link to={`/jobs/${app.jobId?._id}`}>
                          <button className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-light/20 text-slate-500 hover:text-primary-light transition-all flex items-center justify-center">
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center glass-card rounded-[3rem] border-white/5 space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                       <Search className="w-10 h-10 text-slate-700" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">No applications found</h3>
                        <p className="text-slate-500 text-sm font-medium">You haven't applied for any jobs under this category yet.</p>
                    </div>
                    <Link to="/jobs" className="inline-block"><Button variant="outline" size="sm">Explore Openings</Button></Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-10">
             {/* Profile Preview */}
             <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -z-10 group-hover:bg-primary/20 transition-all" />
                
                <div className="text-center space-y-4">
                   <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 mx-auto flex items-center justify-center shadow-2xl relative">
                      <User className="w-10 h-10 text-primary-light" />
                      <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full border-4 border-[#0F172A] shadow-lg" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold">{user?.name}</h3>
                      <p className="text-xs font-medium text-slate-500">{user?.phoneNumber}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <Link to="/profile">
                     <button className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all group/item">
                        <div className="flex items-center gap-3">
                           <Settings className="w-5 h-5 text-slate-500 group-hover/item:text-primary-light transition-colors" />
                           <span className="text-sm font-bold text-slate-400 group-hover/item:text-white transition-colors">Complete Profile</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover/item:translate-x-1 transition-all" />
                     </button>
                   </Link>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                   <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Saved Jobs</h4>
                   <div className="text-center py-4 text-slate-600 text-xs font-bold leading-relaxed">
                       Feature coming soon.<br/>Save your favorite jobs to apply later.
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
