import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Clock, CheckCircle2, XCircle, Search, MapPin, ChevronRight, User, Settings, ExternalLink, Zap, ArrowRight, UserCheck, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [appRes, savedRes, profileRes] = await Promise.all([
          api.get('/applications/me'),
          api.get('/saved-jobs/me'),
          api.get('/candidates/me')
        ]);
        if (isMounted) {
          setApplications(appRes.data.data || []);
          setSavedJobs(savedRes.data.data || []);
          setProfile(profileRes.data.data || null);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    const fields = ['bio', 'location', 'skills', 'experience', 'resumeUrl', 'profilePhoto'];
    const completed = fields.filter(f => {
      if (Array.isArray(profile[f])) return profile[f].length > 0;
      return !!profile[f];
    }).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const stats = [
    { label: 'Total Applied', value: applications.length, icon: Briefcase, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Accepted', value: applications.filter(a => a.status === 'HIRED' || a.status === 'SHORTLISTED').length, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Declined', value: applications.filter(a => a.status === 'REJECTED').length, icon: XCircle, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' }
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
    <div className="min-h-[60vh] bg-[#020617] pt-24 pb-6 px-6 relative overflow-hidden">
      {/* 🌌 Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto z-10 space-y-10 relative">

        {/* Welcome Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[9px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
              <Activity className="w-3 h-3" /> Operations Center
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">Welcome, <span className="text-[#2563EB]">{user?.name?.split(' ')[0]}</span></h1>
            <p className="text-text-secondary text-sm font-medium opacity-60">Monitor your applications and accelerate your career trajectory.</p>
          </div>
          <Link to="/jobs">
            <button className="bg-[#2563EB] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:bg-[#2563EB]/90 transition-all">
              Explore Roles <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* Stats Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl backdrop-blur-md">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} w-fit mb-4`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 🚀 MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SIDE: Applications List */}
          <div className="lg:col-span-2 space-y-6 w-full">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 min-h-[450px] flex flex-col">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#2563EB] rounded-full" /> Recent Applications
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {['All', 'PENDING', 'SHORTLISTED', 'REJECTED', 'HIRED'].map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-text-muted hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <AnimatePresence mode="popLayout">
                  {filteredApplications.length > 0 ? (
                    <div className="space-y-4">
                      {filteredApplications.map((app) => (
                        <motion.div
                          key={app._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 hover:border-[#2563EB]/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/30 font-black">
                              {app?.jobId?.recruiterId?.companyName?.charAt(0) || 'J'}
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white">{app?.jobId?.title}</h3>
                              <p className="text-[10px] font-bold text-text-secondary opacity-60 uppercase tracking-widest">{app?.jobId?.recruiterId?.companyName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                              app.status === 'PENDING' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                              app.status === 'HIRED' || app.status === 'SHORTLISTED' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                              'text-red-400 border-red-400/20 bg-red-400/5'
                            }`}>
                              {app.status}
                            </span>
                            <Link to={`/jobs/${app?.jobId?._id}`}>
                              <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-text-muted hover:text-white hover:border-[#2563EB]/40 transition-all">
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-6">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <Search className="w-6 h-6 text-white/20" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">No applications yet</h3>
                        <p className="text-text-secondary text-xs opacity-50 max-w-[250px]">Your application history is currently empty. Start exploring new roles today.</p>
                      </div>
                      <Link to="/jobs">
                        <Button variant="secondary" className="px-8 rounded-xl font-black text-[10px] uppercase tracking-widest">Search Jobs</Button>
                      </Link>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Profile Intelligence Sidebar */}
          <div className="lg:col-span-1 w-full lg:sticky lg:top-24 self-start space-y-6">
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 blur-3xl" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-1">
                    <div className="w-full h-full rounded-xl bg-[#020617] flex items-center justify-center overflow-hidden">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-white/10" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#2563EB] text-white p-1.5 rounded-lg border-4 border-[#020617]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white tracking-tight">{user?.name}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[8px] font-black uppercase tracking-widest text-[#2563EB]">
                    ID Verified
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Matrix Completion</span>
                  <span className="text-[9px] font-black text-[#2563EB]">{completionPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    className="h-full bg-[#2563EB]"
                  />
                </div>
                
                <Link to="/profile" className="block pt-4">
                  <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[#2563EB]/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-text-muted group-hover:text-[#2563EB]" />
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest group-hover:text-white">Profile Config</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Market Bookmarks</h4>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>

                <div className="space-y-3">
                  {savedJobs.length > 0 ? (
                    savedJobs.slice(0, 3).map(bookmark => (
                      <Link key={bookmark._id} to={`/jobs/${bookmark.jobId?._id}`} className="block">
                        <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-[#2563EB]/30 transition-all flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-black text-white line-clamp-1">{bookmark.jobId?.title}</p>
                            <p className="text-[8px] font-bold text-text-secondary opacity-50 uppercase tracking-widest">{bookmark.jobId?.recruiterId?.companyName}</p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-white/20" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-white/[0.01] rounded-2xl border border-white/5 border-dashed">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-relaxed">No active <br /> bookmarks</p>
                    </div>
                  )}
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
