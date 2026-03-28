import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, Clock, ChevronLeft, ArrowRight, Share2, Globe, Building2, CheckCircle2, AlertCircle, Info, Calendar, UserCheck, Bookmark } from 'lucide-react';
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

    if (user.role === 'RECRUITER') {
        return; // Recruiters can't apply
    }

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
      <div className="min-h-screen bg-[#020617] pt-40 px-6 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Job Details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#020617] pt-40 px-6 text-center space-y-8">
        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto border border-secondary/20">
          <AlertCircle className="w-10 h-10 text-secondary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Oops! Job not found</h2>
          <p className="text-slate-500 font-medium">The link might be broken or the job posting is no longer active.</p>
        </div>
        <Link to="/jobs">
          <Button variant="outline" className="w-auto px-8">Back to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-32 px-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[130px] rounded-full opacity-40" />
      </div>

      <div className="max-w-5xl mx-auto z-10 space-y-10">
        
        {/* Breadcrumb / Back Button */}
        <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Back to Listings</span>
        </Link>

        {/* Hero Section */}
        <div className="glass-card p-10 rounded-[3rem] border-white/5 relative shadow-2xl overflow-hidden">
             {/* Large background decorative image or blur */}
             <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/5 blur-3xl rounded-full translate-x-1/2 -z-10" />

             <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-1 shadow-2xl flex items-center justify-center overflow-hidden">
                  {job.recruiterId?.companyLogo ? (
                    <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-12 h-12 text-slate-700" />
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-light border border-primary/20">{job.category}</span>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5 tracking-tighter">{job.jobType}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                    <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary-light" /> {job.recruiterId?.companyName}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-light" /> {job.location}</span>
                    <span className="flex items-center gap-2 text-primary-light">
                      <IndianRupee className="w-4 h-4" /> 
                      {job.salaryRange ? `${job.salaryRange.min || 0}-${job.salaryRange.max || 0} ${job.salaryRange.currency || 'USD'}` : 'Not Specified'} / yr
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto">
                   <Button 
                    size="lg" 
                    variant={applied ? 'secondary' : 'cta'} 
                    className="w-full md:w-48 py-5 h-auto shadow-2xl shadow-primary/20 disabled:cursor-not-allowed"
                    disabled={applied || user?.role === 'RECRUITER'}
                    onClick={handleApply}
                    loading={applying}
                   >
                     {applied ? <><CheckCircle2 className="mr-2 w-5 h-5" /> Applied</> : 'Apply Now'}
                   </Button>
                   <button className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-3 font-bold group">
                      <Bookmark className="w-5 h-5 flex-shrink-0" /> <span className="md:hidden">Save Job</span>
                   </button>
                </div>
             </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass-card p-10 rounded-[3rem] border-white/5 shadow-xl space-y-8">
               <div className="space-y-4">
                 <h2 className="text-2xl font-black flex items-center gap-3">
                   <Info className="w-6 h-6 text-primary-light" /> Job <span className="text-primary-light">Description</span>
                 </h2>
                 <p className="text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                   {job.description}
                 </p>
               </div>

               <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">Key Responsibilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {job.requirements?.split('\n').filter(r => r.trim() !== '').map((req, i) => (
                       <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <CheckCircle2 className="w-5 h-5 text-primary-light flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-300">{req}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            {/* Quick Stats */}
            <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-primary-light/60">Overview</h3>
              <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Calendar className="w-5 h-5 text-slate-500" /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Posted on</p>
                        <p className="text-sm font-bold">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><UserCheck className="w-5 h-5 text-slate-500" /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Level</p>
                        <p className="text-sm font-bold">{job.experienceLevel}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><Globe className="w-5 h-5 text-slate-500" /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Region</p>
                        <p className="text-sm font-bold">{job.location}</p>
                    </div>
                  </div>
              </div>
            </div>

            {/* Company Card */}
            <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-6 group">
               <h3 className="text-lg font-black uppercase tracking-widest text-primary-light/60">The Recruiter</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-all"><Building2 className="w-7 h-7 text-slate-500" /></div>
                    <div>
                        <h4 className="font-bold">{job.recruiterId?.companyName}</h4>
                        <p className="text-xs text-slate-500 font-medium">Verified Organization</p>
                    </div>
                  </div>
                  <Button variant="outline" className="py-4 rounded-2xl w-full text-xs" onClick={() => navigate(`/companies/${job.recruiterId?._id}`)}>
                    View Company Profile
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
