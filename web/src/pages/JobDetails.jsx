import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isSaved, setIsSaved] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Apply Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
     degree: '',
     institution: '',
     year: '',
     jobTitle: '',
     company: '',
     duration: '',
     jobDesc: '',
     skills: '',
     expectedSalary: '',
     noticePeriod: ''
  });

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
    
    if (user && user.role === 'CANDIDATE') {
       api.get(`/saved-jobs/check/${id}`).then(res => setIsSaved(res.data.isSaved)).catch(() => {});
       api.get(`/applications/check/${id}`).then(res => setApplied(res.data.hasApplied)).catch(() => {});
    }
  }, [id, user]);

  const handleApply = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user.role === 'RECRUITER') return;
    if (user.role !== 'CANDIDATE') return;

    setShowApplyModal(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const payload = {
         educationDetails: [{
            degree: applyForm.degree,
            institution: applyForm.institution,
            year: applyForm.year
         }],
         workExperience: [{
            title: applyForm.jobTitle,
            company: applyForm.company,
            duration: applyForm.duration,
            description: applyForm.jobDesc
         }],
         skills: applyForm.skills ? applyForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
         expectedSalary: applyForm.expectedSalary,
         noticePeriod: applyForm.noticePeriod
      };

      await api.post(`/jobs/${id}/apply`, payload);
      setApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      console.error('Failed to apply:', err);
      alert(err.response?.data?.message || 'Error submitting application.');
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
     if (!user) { navigate('/login'); return; }
     if (user.role !== 'CANDIDATE') return;
     try {
       await api.post(`/saved-jobs/toggle/${id}`);
       setIsSaved(!isSaved);
     } catch (err) {
       console.error('Failed to bookmark:', err);
     }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main pt-40 flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-2 border-[#4F8EF7]/20 border-t-[#4F8EF7] rounded-full animate-spin" />
        <p className="text-text-muted text-xs">Loading opportunity...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-bg-main pt-40 px-6 text-center space-y-8">
        <div className="w-20 h-20 bg-[#F05674]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#F05674]/20">
          <AlertCircle className="w-8 h-8 text-[#F05674]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-text-primary">Opportunity Not Found</h2>
          <p className="text-text-secondary text-sm">This role may have been filled or is no longer accepting applications.</p>
        </div>
        <Link to="/jobs">
          <Button variant="secondary">Return to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-bg-main pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-orb top-[-10%] right-[-5%] w-[42%] h-[42%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite' }} />
        <div className="glow-orb bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-5s' }} />
      </div>

      <div className="max-w-6xl mx-auto z-10 space-y-12 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-text-secondary hover:text-[#4F8EF7] transition-colors group">
            <div className="p-2 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.07)] group-hover:border-[#4F8EF7]/30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">Back to Jobs</span>
          </Link>
          <div className="flex gap-2">
             <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }} className="p-2.5 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.07)] text-text-muted hover:text-[#4F8EF7] hover:border-[#4F8EF7]/30 transition-all"><Share2 className="w-4 h-4" /></button>
             <button onClick={handleBookmark} className={`p-2.5 rounded-lg border transition-all ${isSaved ? 'bg-[#F05674]/10 border-[#F05674]/30 text-[#F05674]' : 'bg-white/[0.04] border-[rgba(255,255,255,0.07)] text-text-muted hover:text-[#F05674] hover:border-[#F05674]/30'}`}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /></button>
          </div>
        </div>

        <div className="glass-card p-6 lg:p-8 relative overflow-hidden group">
             <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/[0.05] border border-[rgba(255,255,255,0.08)] p-2 flex items-center justify-center overflow-hidden group-hover:border-[#4F8EF7]/30 transition-all flex-shrink-0">
                  {job.recruiterId?.companyLogo ? <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-contain" /> : <span className="text-2xl font-bold text-text-muted group-hover:text-[#4F8EF7] transition-colors">{job.recruiterId?.companyName?.charAt(0) || 'J'}</span>}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-blue text-[10px] uppercase tracking-wider"><Zap className="w-3 h-3 mr-1" /> Featured</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium text-text-secondary border border-[rgba(255,255,255,0.08)] bg-white/[0.03]">{job.jobType}</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-text-secondary text-sm">
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-[#4F8EF7]" /> {job.recruiterId?.companyName}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#F05674]" /> {job.location}</span>
                    <span className="flex items-center gap-1.5 text-text-primary font-medium"><IndianRupee className="w-4 h-4 text-[#4F8EF7]" /> {job.salaryRange?.min} - {job.salaryRange?.max} / annum</span>
                  </div>
                </div>
                <div className="w-full md:w-auto self-stretch flex flex-col justify-center gap-2">
                   <button 
                     disabled={applied || applying || user?.role === 'RECRUITER'} 
                     onClick={handleApply} 
                     className={`w-full md:w-44 py-3 rounded-[10px] transition-all flex items-center justify-center gap-2 text-sm font-semibold
                       ${applied 
                         ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/25 cursor-not-allowed' 
                         : 'btn-power'
                       } 
                       ${(applying || user?.role === 'RECRUITER') ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     {applying ? (
                       <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
                     ) : applied ? (
                       <><CheckCircle2 className="w-4 h-4" /> Applied</>
                     ) : (
                       <>Apply Now <ArrowRight className="w-4 h-4" /></>
                     )}
                   </button>
                   <p className="text-[10px] text-center text-text-muted">Application ends soon</p>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 md:p-8 space-y-6">
               <div className="space-y-3">
                 <h2 className="text-lg font-semibold flex items-center gap-2.5 text-text-primary"><div className="w-1 h-5 bg-[#4F8EF7] rounded-full" /> Job Description</h2>
                 <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
               </div>
               <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center gap-2.5 text-text-primary"><div className="w-1 h-4 bg-[#34D399] rounded-full" /> Key Responsibilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {job.requirements?.split('\n').filter(r => r.trim() !== '').map((req, i) => (
                       <div key={i} className="flex items-start gap-3 p-3.5 bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#4F8EF7]/20 transition-all"><div className="w-5 h-5 rounded-lg bg-[#4F8EF7]/10 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-3 h-3 text-[#4F8EF7]" /></div><span className="text-sm text-text-secondary">{req}</span></div>
                     ))}
                  </div>
               </div>
               {job.skills && job.skills.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                     <h3 className="text-base font-semibold flex items-center gap-2.5 text-text-primary"><div className="w-1 h-4 bg-[#38BDF8] rounded-full" /> Key Skills</h3>
                     <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, idx) => (
                          <span key={idx} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#38BDF8] border border-[#38BDF8]/20 bg-[#38BDF8]/5 hover:bg-[#38BDF8]/10 transition-colors uppercase tracking-wider">{skill}</span>
                        ))}
                     </div>
                  </div>
                )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="label-caps">Overview</h3>
              <div className="space-y-4">
                  <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-lg bg-[#4F8EF7]/10 flex items-center justify-center border border-[#4F8EF7]/15"><Calendar className="w-4 h-4 text-[#4F8EF7]" /></div><div><p className="label-caps">Posted On</p><p className="text-sm font-medium text-text-primary mt-0.5">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div></div>
                  <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-lg bg-[#34D399]/10 flex items-center justify-center border border-[#34D399]/15"><UserCheck className="w-4 h-4 text-[#34D399]" /></div><div><p className="label-caps">Experience</p><p className="text-sm font-medium text-text-primary mt-0.5">{job.experienceLevel}</p></div></div>
                  <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-lg bg-[#38BDF8]/10 flex items-center justify-center border border-[#38BDF8]/15"><Globe className="w-4 h-4 text-[#38BDF8]" /></div><div><p className="label-caps">Location</p><p className="text-sm font-medium text-text-primary mt-0.5">{job.location}</p></div></div>
                  
                  {/* New fields */}
                  {job.educationQualification && (
                    <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/15"><UserCheck className="w-4 h-4 text-indigo-400" /></div><div><p className="label-caps">Education</p><p className="text-sm font-medium text-text-primary mt-0.5">{job.educationQualification}</p></div></div>
                  )}
                  {job.vacancies !== undefined && (
                    <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/15"><Users className="w-4 h-4 text-purple-400" /></div><div><p className="label-caps">Vacancies</p><p className="text-sm font-medium text-text-primary mt-0.5">{job.vacancies} open position{job.vacancies > 1 ? 's' : ''}</p></div></div>
                  )}
                  {job.interviewMode && (
                    <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/15"><Info className="w-4 h-4 text-amber-400" /></div><div><p className="label-caps">Interview Mode</p><p className="text-sm font-medium text-text-primary mt-0.5">{job.interviewMode}</p></div></div>
                  )}
                  {job.applicationDeadline && (
                    <div className="flex gap-3 items-center"><div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/15"><Clock className="w-4 h-4 text-rose-400" /></div><div><p className="label-caps">Deadline</p><p className="text-sm font-medium text-text-primary mt-0.5">{new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div></div>
                  )}
              </div>
            </div>
            <div className="glass-card p-5 space-y-4">
               <h3 className="label-caps">Hiring Company</h3>
               <div className="space-y-3 text-center">
                  <div className="w-14 h-14 bg-white/[0.05] rounded-xl flex items-center justify-center border border-[rgba(255,255,255,0.08)] mx-auto overflow-hidden">{job.recruiterId?.companyLogo ? <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-contain p-1" /> : <Building2 className="w-7 h-7 text-text-muted" />}</div>
                  <div className="space-y-1"><h4 className="font-semibold text-text-primary">{job.recruiterId?.companyName}</h4><div className="badge badge-green text-[10px] mx-auto w-fit"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</div></div>
                  <button onClick={() => navigate(`/companies/${job.recruiterId?._id}`)} className="text-xs font-medium text-text-muted hover:text-[#4F8EF7] transition-colors">View Company Profile</button>
               </div>
            </div>
            
            {job.recruiterId?.companyPhotos && job.recruiterId.companyPhotos.length > 0 && (
                <div className="glass-card p-6 rounded-2xl border-white/5 space-y-4 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Workspace Gallery</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {job.recruiterId.companyPhotos.map((photo, i) => (
                            <div 
                                key={i} 
                                onClick={() => setLightboxImage(photo.url || photo)}
                                className={`aspect-square rounded-xl overflow-hidden border border-white/5 cursor-pointer group relative ${i === 2 && job.recruiterId.companyPhotos.length === 3 ? 'col-span-2 aspect-[2/1]' : ''}`}
                            >
                                <img src={photo.url || photo} alt="Workspace" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
          {lightboxImage && (
              <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
                  onClick={() => setLightboxImage(null)}
              >
                  <motion.img 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      src={lightboxImage} 
                      className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl border border-white/10"
                      alt="Workspace Fullscreen"
                  />
              </motion.div>
          )}

          {showApplyModal && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
              >
                  <motion.div
                      initial={{ scale: 0.95, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 20 }}
                      className="bg-[#1E293B] border border-white/10 rounded-[2.5rem] p-8 md:p-10 w-full max-w-2xl shadow-2xl relative my-8"
                  >
                      <button 
                         onClick={() => setShowApplyModal(false)}
                         className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                         ✕
                      </button>

                      <div className="space-y-1 mb-8 text-left">
                         <h3 className="text-2xl font-black text-white uppercase tracking-tight">Complete Application</h3>
                         <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Submit your details to apply for this position</p>
                      </div>

                      <form onSubmit={submitApplication} className="space-y-6 text-left">
                         {/* Education Section */}
                         <div className="space-y-4">
                            <h4 className="text-xs font-black text-primary-light uppercase tracking-widest border-b border-white/5 pb-2">Education Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <input
                                  type="text"
                                  placeholder="Degree (e.g. B.Tech)"
                                  value={applyForm.degree}
                                  onChange={e => setApplyForm(p => ({ ...p, degree: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                               <input
                                  type="text"
                                  placeholder="Institution / School"
                                  value={applyForm.institution}
                                  onChange={e => setApplyForm(p => ({ ...p, institution: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                               <input
                                  type="text"
                                  placeholder="Year of Passing"
                                  value={applyForm.year}
                                  onChange={e => setApplyForm(p => ({ ...p, year: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                            </div>
                         </div>

                         {/* Experience Section */}
                         <div className="space-y-4">
                            <h4 className="text-xs font-black text-primary-light uppercase tracking-widest border-b border-white/5 pb-2">Work Experience</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <input
                                  type="text"
                                  placeholder="Job Title"
                                  value={applyForm.jobTitle}
                                  onChange={e => setApplyForm(p => ({ ...p, jobTitle: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                               <input
                                  type="text"
                                  placeholder="Company"
                                  value={applyForm.company}
                                  onChange={e => setApplyForm(p => ({ ...p, company: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                               <input
                                  type="text"
                                  placeholder="Duration (e.g. 2 years)"
                                  value={applyForm.duration}
                                  onChange={e => setApplyForm(p => ({ ...p, duration: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                            </div>
                            <textarea
                               placeholder="Briefly describe your responsibilities..."
                               value={applyForm.jobDesc}
                               onChange={e => setApplyForm(p => ({ ...p, jobDesc: e.target.value }))}
                               rows="3"
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                         </div>

                         {/* Requirements / Extras */}
                         <div className="space-y-4">
                            <h4 className="text-xs font-black text-primary-light uppercase tracking-widest border-b border-white/5 pb-2">Additional Parameters</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <input
                                  type="text"
                                  placeholder="Expected Salary"
                                  value={applyForm.expectedSalary}
                                  onChange={e => setApplyForm(p => ({ ...p, expectedSalary: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                               <input
                                  type="text"
                                  placeholder="Notice Period (e.g. 30 days)"
                                  value={applyForm.noticePeriod}
                                  onChange={e => setApplyForm(p => ({ ...p, noticePeriod: e.target.value }))}
                                  required
                                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                               />
                            </div>
                            <input
                               type="text"
                               placeholder="Your Skills (comma separated)"
                               value={applyForm.skills}
                               onChange={e => setApplyForm(p => ({ ...p, skills: e.target.value }))}
                               required
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                         </div>

                         <div className="pt-4 flex gap-4">
                            <button
                               type="button"
                               onClick={() => setShowApplyModal(false)}
                               className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5"
                            >
                               Cancel
                            </button>
                            <button
                               type="submit"
                               disabled={applying}
                               className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                               {applying ? 'Submitting...' : 'Submit Application'}
                            </button>
                         </div>
                      </form>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default JobDetails;


