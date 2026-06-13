import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Globe, Camera, Save, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Trash2, Upload, ExternalLink, ShieldCheck, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import api from '../services/api';

const RecruiterProfile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    location: '',
    companyWebsite: '',
    companyLogo: '',
    designation: '',
    description: '',
    companyPhotos: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/recruiters/me');
        if (res.data.success) {
           setProfile({
              companyName: res.data.data.companyName || '',
              industry: res.data.data.industry || '',
              location: res.data.data.location || '',
              companyWebsite: res.data.data.companyWebsite || '',
              companyLogo: res.data.data.companyLogo || '',
              designation: res.data.data.designation || '',
              description: res.data.data.description || '',
              companyPhotos: res.data.data.companyPhotos || [],
           });
        }
      } catch (err) {
        console.error('Failed to fetch recruiter profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await api.put('/recruiters/me', profile);
      setSuccess('Company profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update company profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await api.post('/recruiters/me/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, companyLogo: res.data.data.companyLogo });
      setSuccess('Company logo updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Upload failed. Check file type and size.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleWorkspacePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (profile.companyPhotos.length >= 3) {
      setError('Maximum 3 workspace photos allowed.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size must be less than 5MB.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setFileLoading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.post('/recruiters/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({
         ...prev,
         companyPhotos: [...prev.companyPhotos, res.data.data.url]
      }));
      setSuccess('Workspace photo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload workspace photo.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleWorkspacePhotoDelete = async (photoUrl) => {
    try {
       const res = await api.delete('/recruiters/me/photo', {
         data: { urls: [photoUrl] }
       });
       if (res.data.success) {
          setProfile(prev => ({
             ...prev,
             companyPhotos: prev.companyPhotos.filter(p => p !== photoUrl)
          }));
          setSuccess('Workspace photo removed!');
          setTimeout(() => setSuccess(''), 3000);
       }
    } catch (err) {
       setError(err.response?.data?.message || 'Failed to delete photo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main pt-40 px-6 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Company Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main py-32 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto z-10 space-y-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <Link to="/recruiter-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
              <span className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-all"><ArrowLeft className="w-5 h-5" /></span>
              <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
           </Link>
           <div className="glass-card px-4 py-2 rounded-xl border-white/5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization Verified</span>
           </div>
        </div>

        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Company <span className="gradient-text">Identity</span>.</h1>
           <p className="text-slate-400 font-medium text-lg">Control your organization's presence and establish trust with top candidates.</p>
        </div>

        <AnimatePresence>
           {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5" /> {success}
              </motion.div>
           )}
           {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary-soft text-sm font-bold flex items-center gap-3">
                 <AlertCircle className="w-5 h-5" /> {error}
              </motion.div>
           )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Sidebar - Logo Identity */}
           <div className="space-y-8">
              <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8 flex flex-col items-center text-center group relative overflow-hidden shadow-2xl">
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -z-10 group-hover:bg-primary/20 transition-all" />
                 
                 <div className="relative group/logo">
                    <div className="w-32 h-32 rounded-[2rem] bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover/logo:border-primary/40 p-1">
                       {profile.companyLogo ? (
                          <img src={profile.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                       ) : (
                          <Building2 className="w-12 h-12 text-slate-700" />
                       )}
                    </div>
                    <label className="absolute bottom-[-10px] right-[-10px] p-3.5 bg-primary rounded-2xl border-4 border-[#0F172A] shadow-lg cursor-pointer hover:scale-110 active:scale-90 transition-all">
                       <Upload className="w-4 h-4 text-white" />
                       <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                 </div>

                 <div className="space-y-1">
                    <h3 className="text-xl font-black">{profile.companyName || 'Anonymous Corp'}</h3>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">{profile.industry || 'Global Trade'}</p>
                 </div>

                 <div className="w-full pt-8 border-t border-white/5 space-y-4">
                    <div className="text-left space-y-4">
                       <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                          <Mail className="w-4 h-4 text-primary-light" /> {user?.email}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Main Form Area */}
           <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-10">
                 <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-10 shadow-xl">
                    <div className="grid grid-cols-1 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <Building2 className="w-3.5 h-3.5" /> Company Name
                          </label>
                          <input 
                            type="text" 
                            name="companyName"
                            value={profile.companyName}
                            onChange={handleChange}
                            placeholder="Your legal organization name..." 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" /> Industry sector
                             </label>
                             <input 
                                type="text" 
                                name="industry"
                                value={profile.industry}
                                onChange={handleChange}
                                placeholder="e.g. Technology / Finance" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Headquarters
                             </label>
                             <input 
                                type="text" 
                                name="location"
                                value={profile.location}
                                onChange={handleChange}
                                placeholder="e.g. Bangalore, India" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <Globe className="w-3.5 h-3.5" /> Company Website URL
                          </label>
                          <input 
                            type="url" 
                            name="companyWebsite"
                            value={profile.companyWebsite}
                            onChange={handleChange}
                            placeholder="https://www.yourcompany.com" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                          />
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <ShieldCheck className="w-3.5 h-3.5" /> Your Designation
                          </label>
                          <select 
                            name="designation"
                            value={profile.designation}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                          >
                            <option value="" className="bg-slate-800 text-slate-400">Select Designation...</option>
                            <option value="HR" className="bg-slate-800 text-white">HR</option>
                            <option value="Company Owner" className="bg-slate-800 text-white">Company Owner</option>
                            <option value="CEO" className="bg-slate-800 text-white">CEO</option>
                            <option value="Other" className="bg-slate-800 text-white">Other</option>
                          </select>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <Building2 className="w-3.5 h-3.5" /> Company Description
                          </label>
                          <textarea 
                            name="description"
                            value={profile.description}
                            onChange={handleChange}
                            placeholder="Tell candidates about your company's mission and culture..." 
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"
                          />
                       </div>

                       <div className="space-y-6 pt-6 border-t border-white/5">
                          <div>
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Camera className="w-3.5 h-3.5" /> Workspace Photos
                             </label>
                             <p className="text-sm text-slate-500 mt-1 ml-1">Upload up to 3 photos of your office, team, or events. Max 5MB per photo.</p>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             {profile.companyPhotos.map((photo, index) => (
                                <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group/photo bg-white/5">
                                   <img src={photo} alt={`Workspace ${index + 1}`} className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 transition-all flex items-center justify-center">
                                      <button 
                                        type="button"
                                        onClick={() => handleWorkspacePhotoDelete(photo)}
                                        className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                   </div>
                                </div>
                             ))}

                             {profile.companyPhotos.length < 3 && (
                                <label className="aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden group/upload">
                                   <Upload className="w-6 h-6 text-slate-500 group-hover/upload:text-primary transition-colors" />
                                   <span className="text-xs font-bold text-slate-500 group-hover/upload:text-primary transition-colors">Add Photo</span>
                                   <input type="file" accept="image/*" className="hidden" onChange={handleWorkspacePhotoUpload} disabled={fileLoading} />
                                   {fileLoading && (
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                     </div>
                                   )}
                                </label>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      loading={saving} 
                      className="px-12 py-5 rounded-3xl shadow-2xl shadow-primary/20 text-lg"
                    >
                      Save Organization Identity <Save className="ml-2 w-5 h-5" />
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
