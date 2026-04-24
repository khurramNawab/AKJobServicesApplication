import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, IndianRupee, FileText, LayoutList, ChevronLeft, ArrowRight, CheckCircle2, AlertCircle, Info, Plus, X, ListChecks } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const PostJob = () => {
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Engineering', 'Other'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
  const expLevels = ['Entry Level', 'Mid-Level', 'Senior Level', 'Executive'];

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
    if (!user || user.role !== 'RECRUITER') {
        setError('Unauthorized access.');
        return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/jobs', {
          ...formData,
          requirements: formData.requirements.filter(r => r.trim() !== '')
      });
      setSuccess(true);
      setTimeout(() => navigate('/recruiter-dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center px-6">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 rounded-[3.5rem] border-white/5 text-center space-y-8 max-w-lg shadow-2xl"
        >
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight">Post <span className="text-emerald-400">Successful!</span></h2>
                <p className="text-slate-500 font-medium">Your job posting is now live. Redirecting your dashboard...</p>
            </div>
            <div className="pt-4 animate-pulse uppercase tracking-[0.3em] font-black text-[10px] text-slate-700">Please Wait</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main py-32 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto z-10 space-y-12">
        <Link to="/recruiter-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
        </Link>

        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight leading-tight">Post a <span className="gradient-text">Job Posting</span>.</h1>
          <p className="text-slate-400 font-medium text-lg">Define the role and find the talent that will shape your company's future.</p>
        </div>

        {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl bg-secondary/10 border border-secondary/20 text-secondary-soft text-sm font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5" /> {error}
            </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Base Info Section */}
          <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-10 shadow-xl">
             <h3 className="text-xl font-bold flex items-center gap-3 text-primary-light">
                <Info className="w-5 h-5" /> Basic <span className="text-white">Role Info</span>
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Job Title</label>
                    <div className="relative group">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Senior Software Architect"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                    <div className="relative group">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. New York or Remote"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Salary Range / Year</label>
                    <div className="relative group">
                        <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            name="salaryRange"
                            value={formData.salaryRange}
                            onChange={handleChange}
                            placeholder="e.g. 15L - 25L"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-bg-main-surface border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium appearance-none"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Job Type</label>
                    <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        className="w-full bg-bg-main-surface border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium appearance-none"
                    >
                        {jobTypes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience Level</label>
                    <select
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleChange}
                        className="w-full bg-bg-main-surface border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium appearance-none"
                    >
                        {expLevels.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
             </div>
          </div>

          <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-10 shadow-xl">
             <h3 className="text-xl font-bold flex items-center gap-3 text-primary-light">
                <FileText className="w-5 h-5" /> Role <span className="text-white">Details</span>
             </h3>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Describe the role, responsibilities and requirements in detail..."
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium leading-relaxed"
                />
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Key Requirements / Skills</label>
                    <button type="button" onClick={addRequirement} className="text-[10px] font-black text-primary-light flex items-center gap-2 hover:text-white transition-colors uppercase tracking-widest">
                       <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {formData.requirements.map((req, i) => (
                        <div key={i} className="flex gap-3">
                            <input
                                type="text"
                                value={req}
                                onChange={(e) => handleRequirementChange(i, e.target.value)}
                                placeholder="e.g. 5+ years React experience"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                            />
                            <button type="button" onClick={() => removeRequirement(i)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-700 hover:text-secondary-soft transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
          </div>

          <div className="flex items-center justify-end pt-6">
             <Button 
                type="submit" 
                size="lg" 
                variant="cta" 
                loading={isLoading}
                className="w-full md:w-auto px-16 py-6 rounded-3xl shadow-2xl shadow-primary/30 text-lg"
             >
                Publish Job Post <ArrowRight className="ml-3 w-6 h-6" />
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
