import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, IndianRupee, FileText, ChevronLeft, ArrowRight, CheckCircle2, AlertCircle, Info, Plus, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salaryRange: '',
    category: 'Technology',
    jobType: 'Full-time',
    experienceLevel: 'Entry Level',
    requirements: [''],
    educationQualification: '',
    vacancies: 1,
    applicationDeadline: '',
    interviewMode: 'Online',
    skills: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Engineering', 'Other'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  const expLevels = ['Entry Level', 'Mid-Level', 'Senior Level', 'Executive'];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        const job = res.data.data;
        
        setFormData({
          title: job.title || '',
          description: job.description || '',
          location: job.location || '',
          salaryRange: job.salaryRange || '',
          category: job.category || 'Technology',
          jobType: job.jobType || 'Full-time',
          experienceLevel: job.experienceLevel || 'Entry Level',
          requirements: job.requirements?.length > 0 ? job.requirements : [''],
          educationQualification: job.educationQualification || '',
          vacancies: job.vacancies || 1,
          applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
          interviewMode: job.interviewMode || 'Online',
          skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
        });
      } catch (err) {
        setError('Failed to fetch job data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRequirementChange = (index, value) => {
    const newReqs = [...formData.requirements];
    newReqs[index] = value;
    setFormData({ ...formData, requirements: newReqs });
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const newReqs = formData.requirements.filter((_, i) => i !== index);
      setFormData({ ...formData, requirements: newReqs });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUpdating(true);

    try {
      const payload = {
          ...formData,
          requirements: formData.requirements.filter(r => r.trim() !== ''),
          vacancies: Number(formData.vacancies),
          skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          applicationDeadline: formData.applicationDeadline || null
      };
      await api.put(`/jobs/${jobId}`, payload);
      setSuccess(true);
      setTimeout(() => navigate('/recruiter-dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Retrieving Sector Data...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 rounded-[3.5rem] border-white/5 text-center space-y-8 max-w-lg shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight text-white">Update <span className="text-emerald-400">Successful!</span></h2>
                <p className="text-slate-500 font-medium">Job matrix has been successfully recalibrated.</p>
            </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main py-32 px-6 relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto z-10 space-y-12">
        <Link to="/recruiter-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
        </Link>

        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight leading-tight text-white">Edit <span className="gradient-text">Job Posting</span>.</h1>
          <p className="text-slate-400 font-medium text-lg">Modify the role parameters to optimize your talent acquisition.</p>
        </div>

        {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-secondary/10 border border-secondary/20 text-secondary-soft text-sm font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5" /> {error}
            </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-10 shadow-xl bg-white/[0.01]">
             <h3 className="text-xl font-bold flex items-center gap-3 text-primary-light">
                <Info className="w-5 h-5" /> Basic <span className="text-white">Role Info</span>
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Job Title</label>
                    <div className="relative group">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                    <div className="relative group">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Salary Range / Year</label>
                    <div className="relative group">
                        <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-bg-main border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium appearance-none">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Job Type</label>
                    <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full bg-bg-main border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium appearance-none">
                        {jobTypes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* ── New Spec Fields ── */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Education Qualification</label>
                    <input
                        type="text"
                        name="educationQualification"
                        value={formData.educationQualification || ''}
                        onChange={handleChange}
                        placeholder="e.g. B.Tech, MCA, or Equivalent"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Number of Vacancies</label>
                    <input
                        type="number"
                        name="vacancies"
                        min="1"
                        value={formData.vacancies || 1}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Application Deadline</label>
                    <input
                        type="date"
                        name="applicationDeadline"
                        value={formData.applicationDeadline || ''}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Interview Mode</label>
                    <select
                        name="interviewMode"
                        value={formData.interviewMode || 'Online'}
                        onChange={handleChange}
                        className="w-full bg-bg-main border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium appearance-none"
                    >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Both">Both</option>
                    </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Key Skills (Comma Separated)</label>
                    <input
                        type="text"
                        name="skills"
                        value={formData.skills || ''}
                        onChange={handleChange}
                        placeholder="e.g. React, Node.js, TypeScript, Docker"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                    />
                </div>
                {/* ───────────────────── */}
             </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-10 shadow-xl bg-white/[0.01]">
             <h3 className="text-xl font-bold flex items-center gap-3 text-primary-light">
                <FileText className="w-5 h-5" /> Role <span className="text-white">Details</span>
             </h3>
             <textarea name="description" value={formData.description} onChange={handleChange} rows="6" required className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium leading-relaxed" />
          </div>

          <div className="flex items-center justify-end pt-6">
             <Button type="submit" size="lg" variant="cta" loading={isUpdating} className="px-16 py-6 rounded-3xl text-lg">Update Job Post <ArrowRight className="ml-3 w-6 h-6" /></Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;

