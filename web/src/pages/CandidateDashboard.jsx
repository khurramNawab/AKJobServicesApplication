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

  const [candidateSubscriptionEnabled, setCandidateSubscriptionEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [appRes, savedRes, profileRes, configRes] = await Promise.all([
          api.get('/applications/me'),
          api.get('/saved-jobs/me'),
          api.get('/candidates/me'),
          api.get('/platform-config')
        ]);
        if (isMounted) {
          setApplications(appRes.data.data || []);
          setSavedJobs(savedRes.data.data || []);
          setProfile(profileRes.data.data || null);
          setCandidateSubscriptionEnabled(configRes.data?.data?.candidateSubscriptionEnabled || false);
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
    { label: 'Total Applied',  value: applications.length, icon: Briefcase, color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10' },
    { label: 'Under Review',   value: applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING').length, icon: Clock, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10' },
    { label: 'Accepted',       value: applications.filter(a => a.status === 'HIRED' || a.status === 'SHORTLISTED').length, icon: UserCheck, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10' },
    { label: 'Declined',       value: applications.filter(a => a.status === 'REJECTED').length, icon: XCircle, color: 'text-[#F05674]', bg: 'bg-[#F05674]/10' }
  ];

  const filteredApplications = activeTab === 'All'
    ? applications
    : applications.filter(app => app.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main pt-40 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-[#4F8EF7]/20 border-t-[#4F8EF7] rounded-full animate-spin" />
        <p className="text-text-muted text-xs">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-bg-main pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-orb top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite' }} />
        <div className="glow-orb bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-5s' }} />
      </div>

      <div className="max-w-7xl mx-auto z-10 space-y-8 relative">
        {candidateSubscriptionEnabled && user?.planType === 'FREE' && (
           <div className="p-6 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl backdrop-blur-md">
              <div className="space-y-1 text-left">
                 <h3 className="text-sm font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                    <Zap className="text-purple-400 w-4 h-4 animate-pulse" />
                    Unlock Premium Applications
                 </h3>
                 <p className="text-text-secondary text-[11px] font-bold uppercase tracking-wider">Upgrade to Premium to get unlimited applications and highlight your resume to recruiters.</p>
              </div>
              <Link to="/candidate-pricing">
                 <button className="px-6 py-3 bg-white text-black hover:bg-purple-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">
                    Upgrade Now
                 </button>
              </Link>
           </div>
        )}

        {/* Welcome Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[10px] font-medium text-[#4F8EF7] uppercase tracking-wider">
              <Activity className="w-3 h-3" /> Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span></h1>
            <p className="text-text-secondary text-sm">Monitor your applications and accelerate your career.</p>
          </div>
          <Link to="/jobs">
            <button className="btn-power flex items-center gap-2 text-sm">
              Explore Roles <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-5">
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} w-fit mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="label-caps mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 🚀 MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SIDE: Applications List */}
          <div className="lg:col-span-2 space-y-4 w-full">
            <div className="glass-card p-6 min-h-[420px] flex flex-col">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5 mb-5">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#4F8EF7] rounded-full" /> Recent Applications
                </h2>
                <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 flex-wrap">
                  {['All', 'PENDING', 'SHORTLISTED', 'REJECTED', 'HIRED'].map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeTab === t
                          ? 'bg-[#4F8EF7] text-white'
                          : 'bg-white/[0.04] text-text-muted hover:text-text-secondary border border-[rgba(255,255,255,0.07)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <AnimatePresence mode="popLayout">
                  {filteredApplications.length > 0 ? (
                    <div className="space-y-3">
                      {filteredApplications.map((app) => (
                        <motion.div
                          key={app._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center border border-[rgba(255,255,255,0.07)] text-text-muted font-semibold text-sm">
                              {app?.jobId?.recruiterId?.companyName?.charAt(0) || 'J'}
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-text-primary">{app?.jobId?.title}</h3>
                              <p className="text-xs text-text-muted">{app?.jobId?.recruiterId?.companyName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`badge ${
                              app.status === 'PENDING' ? 'badge-yellow' :
                              app.status === 'HIRED' || app.status === 'SHORTLISTED' ? 'badge-green' :
                              'badge-red'
                            }`}>
                              {app.status}
                            </span>
                            <Link to={`/jobs/${app?.jobId?._id}`}>
                              <button className="p-2 bg-white/[0.04] border border-[rgba(255,255,255,0.07)] rounded-lg text-text-muted hover:text-[#4F8EF7] hover:border-[#4F8EF7]/30 transition-all">
                                <ExternalLink className="w-3.5 h-3.5" />
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
          <div className="lg:col-span-1 w-full lg:sticky lg:top-24 self-start space-y-4">
            <div className="glass-card p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#4F8EF7]/8 blur-3xl" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 p-1">
                    <div className="w-full h-full rounded-xl bg-bg-main flex items-center justify-center overflow-hidden">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-white/10" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#4F8EF7] text-white p-1.5 rounded-lg border-2 border-[#050B18]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-primary">{user?.name}</h3>
                  <div className="badge badge-blue text-[10px] mx-auto w-fit">Verified</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="label-caps">Profile Completion</span>
                  <span className="text-xs font-semibold text-[#4F8EF7]">{completionPercentage}%</span>
                </div>
                <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-[#4F8EF7] rounded-full"
                  />
                </div>
                
                <Link to="/profile" className="block pt-3">
                  <button className="w-full flex items-center justify-between p-3.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl hover:border-[#4F8EF7]/30 transition-all group">
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-text-muted group-hover:text-[#4F8EF7] transition-colors" />
                      <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">Edit Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>

              <div className="pt-5 border-t border-[rgba(255,255,255,0.06)] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="label-caps">Saved Jobs</h4>
                  <Zap className="w-3.5 h-3.5 text-[#FBBF24]" />
                </div>

                <div className="space-y-2">
                  {savedJobs.length > 0 ? (
                    savedJobs.slice(0, 3).map(bookmark => (
                      <Link key={bookmark._id} to={`/jobs/${bookmark.jobId?._id}`} className="block">
                        <div className="p-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:border-[#4F8EF7]/25 transition-all flex items-center justify-between group">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-text-primary line-clamp-1 group-hover:text-[#4F8EF7] transition-colors">{bookmark.jobId?.title}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{bookmark.jobId?.recruiterId?.companyName}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0 ml-2" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-5 bg-white/[0.01] rounded-xl border border-[rgba(255,255,255,0.05)] border-dashed">
                      <p className="text-xs text-text-muted">No saved jobs yet</p>
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

