import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, Clock, ChevronLeft, ArrowRight, Share2, Globe, Building2, CheckCircle2, AlertCircle, Info, Calendar, UserCheck, Bookmark, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);
      } catch (err) {
        setError('Job not found or error loading data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user.role === 'RECRUITER') return;

    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`);
      setApplied(true);
    } catch (err) {
      console.error('Failed to apply:', err);
      alert(err.response?.data?.message || 'Error applying for job.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-text-secondary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Connection...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 px-6 text-center space-y-10">
        <div className="w-24 h-24 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto border border-[#EF4444]/20 shadow-inner">
          <AlertCircle className="w-10 h-10 text-[#EF4444]" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tight">Opportunity Not Found</h2>
          <p className="text-text-secondary font-medium opacity-60">This role may have been filled or is no longer accepting applications.</p>
        </div>
        <Link to="/jobs">
          <Button variant="outline" className="px-10 py-5 rounded-2xl">Return to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-40 px-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto z-10 space-y-12 relative">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link to="/jobs" className="inline-flex items-center gap-3 text-text-secondary hover:text-[#2563EB] transition-all group">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#2563EB]/40 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Return to Listings</span>
          </Link>
          <div className="flex gap-4">
             <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-all shadow-xl"><Share2 className="w-5 h-5" /></button>
             <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-all shadow-xl"><Bookmark className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="glass-card p-12 lg:p-16 rounded-[3.5rem] border-white/5 relative shadow-2xl overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-[#2563EB]/5 to-transparent blur-3xl rounded-full translate-x-1/2 -z-10 opacity-60" />
             <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden group-hover:border-[#2563EB]/40 transition-all shadow-inner">
                  {job.recruiterId?.companyLogo ? <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-cover" /> : <span className="text-5xl font-black text-white/30 group-hover:text-white transition-all">{job.recruiterId?.companyName?.charAt(0) || 'J'}</span>}
                </div>
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#2563EB]/10 rounded-full text-[9px] font-black uppercase tracking-widest text-[#2563EB] border border-[#2563EB]/20 flex items-center gap-1.5"><Zap className="w-2.5 h-2.5" /> Featured Role</span>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-text-secondary border border-white/10">{job.jobType}</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1.1]">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-text-secondary font-bold text-sm opacity-80">
                    <span className="flex items-center gap-2.5"><Building2 className="w-4 h-4 text-[#2563EB]" /> {job.recruiterId?.companyName}</span>
                    <span className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-[#EF4444]" /> {job.location}</span>
                    <span className="flex items-center gap-2.5 text-white"><IndianRupee className="w-4 h-4 text-[#2563EB]" /> {job.salaryRange?.min}L - {job.salaryRange?.max}L / annum</span>
                  </div>
                </div>
                <div className="w-full md:w-auto self-stretch flex flex-col justify-center">
                   <button disabled={applied || user?.role === 'RECRUITER'} onClick={handleApply} className={`btn-power !w-full md:!w-64 !py-8 !rounded-[2rem] transition-all flex items-center justify-center gap-3 ${applied ? 'bg-emerald-500' : ''}`}>
                     {applying ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : applied ? <><CheckCircle2 className="w-5 h-5" /> Application Sent</> : <>Apply Now <ArrowRight className="w-5 h-5" /></>}
                   </button>
                   <p className="text-[10px] text-center mt-4 font-black text-text-muted uppercase tracking-[0.2em]">Application ends in 12 days</p>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="glass-card p-12 rounded-[3.5rem] border-white/5 shadow-2xl space-y-10">
               <div className="space-y-6">
                 <h2 className="text-2xl font-black flex items-center gap-4 text-white uppercase tracking-tight"><div className="w-1.5 h-6 bg-[#2563EB] rounded-full" /> Job Description</h2>
                 <p className="text-text-secondary text-lg leading-relaxed font-medium opacity-80 whitespace-pre-wrap">{job.description}</p>
               </div>
               <div className="space-y-8">
                  <h3 className="text-xl font-black flex items-center gap-4 text-white uppercase tracking-tight"><div className="w-1.5 h-6 bg-[#EF4444] rounded-full" /> Key Responsibilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     {job.requirements?.split('\n').filter(r => r.trim() !== '').map((req, i) => (
                       <div key={i} className="flex items-start gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl group/item hover:border-[#2563EB]/20 transition-all"><div className="w-8 h-8 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#2563EB]/20 transition-all"><CheckCircle2 className="w-4 h-4 text-[#2563EB]" /></div><span className="text-sm font-bold text-text-secondary opacity-80">{req}</span></div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
          <div className="space-y-12">
            <div className="glass-card p-10 rounded-[3.5rem] border-white/5 space-y-8 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Opportunity Overview</h3>
              <div className="space-y-8">
                  <div className="flex gap-5 items-center group/ov"><div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/ov:border-[#2563EB]/40 transition-all"><Calendar className="w-6 h-6 text-[#2563EB]" /></div><div><p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Posted On</p><p className="text-sm font-black text-white">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div></div>
                  <div className="flex gap-5 items-center group/ov"><div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/ov:border-[#EF4444]/40 transition-all"><UserCheck className="w-6 h-6 text-[#EF4444]" /></div><div><p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Experience Level</p><p className="text-sm font-black text-white">{job.experienceLevel}</p></div></div>
                  <div className="flex gap-5 items-center group/ov"><div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/ov:border-[#2563EB]/40 transition-all"><Globe className="w-6 h-6 text-[#2563EB]" /></div><div><p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Deployment Location</p><p className="text-sm font-black text-white">{job.location}</p></div></div>
              </div>
            </div>
            <div className="glass-card p-10 rounded-[3.5rem] border-white/5 space-y-8 shadow-2xl group/rec">
               <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Hiring Organization</h3>
               <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 mx-auto group-hover/rec:border-[#2563EB]/40 transition-all shadow-inner overflow-hidden">{job.recruiterId?.companyLogo ? <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-cover" /> : <Building2 className="w-10 h-10 text-white/20" />}</div>
                  <div className="space-y-1"><h4 className="font-black text-white text-xl tracking-tight">{job.recruiterId?.companyName}</h4><div className="flex items-center justify-center gap-2 text-[#2563EB] text-[10px] font-black uppercase tracking-widest"><div className="p-0.5 bg-[#2563EB] rounded-full text-white"><CheckCircle2 className="w-2 h-2" /></div>Verified Partner</div></div>
                  <button onClick={() => navigate(`/companies/${job.recruiterId?._id}`)} className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-white transition-all">View Corporate Profile</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

