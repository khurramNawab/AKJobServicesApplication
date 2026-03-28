import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Clock, CheckCircle2, XCircle, FileText, Mail, Phone, ExternalLink, ChevronLeft, Filter, Search, Download, MessageSquare, MoreVertical, Briefcase } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get(`/applications/job/${jobId}`)
        ]);
        setJob(jobRes.data.data);
        setApplicants(appsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleStatusUpdate = async (appId, status) => {
    setUpdating(appId);
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplicants(applicants.map(app => 
        app._id === appId ? { ...app, status } : app
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const filteredApplicants = activeFilter === 'All' 
    ? applicants 
    : applicants.filter(app => app.status === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 px-6 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Reviewing Applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-32 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto z-10 space-y-12">
        
        {/* Header section with back button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="space-y-4">
              <Link to="/recruiter-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                 <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                 <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
              </Link>
              <div className="space-y-1">
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Applicant <span className="gradient-text">Matrix</span>.</h1>
                 <p className="text-slate-400 font-medium">Reviewing candidates for <span className="text-white font-bold">{job?.title}</span></p>
              </div>
           </div>
           
           <div className="flex gap-4">
              <div className="glass-card px-6 py-3 rounded-2xl border-white/5 flex items-center gap-4">
                 <div className="text-center">
                    <p className="text-xl font-black text-white">{applicants.length}</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Total</p>
                 </div>
                 <div className="w-[1px] h-8 bg-white/10" />
                 <div className="text-center">
                    <p className="text-xl font-black text-emerald-400">{applicants.filter(a => a.status === 'Accepted').length}</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Shortlisted</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Filters Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-8">
           <div className="flex overflow-x-auto gap-3 pb-2 md:pb-0 scroll-hide">
              {['All', 'Pending', 'Accepted', 'Rejected'].map(filter => (
                 <button 
                  key={filter} 
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeFilter === filter ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'
                  }`}
                 >
                    {filter === 'Accepted' ? 'Shortlisted' : filter}
                 </button>
              ))}
           </div>
           <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Search applicants by name..." className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
           </div>
        </div>

        {/* Applicants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((app, i) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-1 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all group overflow-hidden shadow-2xl relative"
                  >
                    <div className="p-8 space-y-8">
                      {/* Top Header */}
                      <div className="flex justify-between items-start">
                         <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-primary/20 border border-primary/20 flex items-center justify-center relative shadow-inner">
                            <User className="w-8 h-8 text-primary-light" />
                            <div className={`absolute -bottom-1 -right-1 p-1 borderRadius-md ${
                              app.status === 'Pending' ? 'bg-amber-400' : app.status === 'Accepted' ? 'bg-emerald-500' : 'bg-secondary'
                            } rounded-lg shadow-lg`}>
                               {app.status === 'Pending' ? <Clock className="w-3 h-3 text-white" /> : app.status === 'Accepted' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <XCircle className="w-3 h-3 text-white" />}
                            </div>
                         </div>
                         <button className="p-3 bg-white/5 rounded-xl text-slate-600 hover:text-white transition-colors border border-white/5">
                            <MessageSquare className="w-5 h-5" />
                         </button>
                      </div>

                      {/* Info Body */}
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight line-clamp-1">{app.candidateId?.name || 'Anonymous User'}</h3>
                        <div className="flex flex-col gap-3 pt-2">
                           <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                              <Mail className="w-4 h-4 text-slate-700" /> {app.candidateId?.email || 'N/A'}
                           </div>
                           <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                              <Phone className="w-4 h-4 text-slate-700" /> {app.candidateId?.phoneNumber || 'N/A'}
                           </div>
                        </div>
                      </div>

                      {/* Experience / Resume Preview Mock */}
                      <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-5 h-5 text-primary-light" /></div>
                        <div className="flex-1">
                           <p className="text-xs font-black uppercase tracking-widest text-primary-light/60">Resume Attached</p>
                           <p className="text-sm font-bold truncate">cv_v4_frontend.pdf</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-600 mt-1 hover:text-white cursor-pointer" />
                      </div>

                      {/* Actions */}
                      <div className="pt-6 border-t border-white/5 flex gap-3">
                         {app.status === 'Pending' ? (
                            <>
                               <Button 
                                variant="cta" 
                                size="sm" 
                                className="flex-1 py-4 text-[10px]" 
                                loading={updating === app._id}
                                onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                               >
                                 Shortlist
                               </Button>
                               <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 py-4 text-[10px] text-secondary-soft border-secondary/20 hover:bg-secondary/10"
                                loading={updating === app._id}
                                onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                               >
                                 Reject
                               </Button>
                            </>
                         ) : (
                            <div className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                               <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${app.status === 'Accepted' ? 'text-emerald-400' : 'text-secondary-soft'}`}>
                                  {app.status === 'Accepted' ? <><CheckCircle2 className="w-4 h-4" /> Shortlisted</> : <><XCircle className="w-4 h-4" /> Rejected</>}
                               </span>
                               <button 
                                onClick={() => handleStatusUpdate(app._id, 'Pending')}
                                className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest underline underline-offset-4"
                               >
                                  UNDO
                               </button>
                            </div>
                         )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center space-y-8">
                   <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto shadow-inner animate-float">
                      <Users className="w-10 h-10 text-slate-700" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-3xl font-black">No candidates <span className="text-primary-light">yet</span>.</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto">This position hasn't received any applications under this category. Keep your job post optimized!</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;
