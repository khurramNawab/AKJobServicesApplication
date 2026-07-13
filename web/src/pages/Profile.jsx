import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, FileText, Camera, Save, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Trash2, Upload, ExternalLink, ShieldCheck, ChevronLeft, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState({
    bio: '',
    location: '',
    skills: '',
    experience: '',
    resumeUrl: '',
    profilePhoto: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/candidates/me');
        if (res.data.success) {
           setProfile({
              bio: res.data.data.bio || '',
              location: res.data.data.location || '',
              skills: res.data.data.skills?.join(', ') || '',
              experience: res.data.data.experience || '',
              resumeUrl: res.data.data.resumeUrl || '',
              profilePhoto: res.data.data.profilePhoto || '',
           });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
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
      const dataToSave = {
        ...profile,
        skills: profile.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      await api.put('/candidates/me', dataToSave);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);
    const formData = new FormData();
    formData.append(type, file);

    try {
      const endpoint = type === 'resume' ? '/candidates/me/resume' : '/candidates/me/photo';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (type === 'resume') {
        setSuccess(res.data.message || 'Resume uploaded to security quarantine. Scanning...');
        // Refresh the profile after 3 seconds to fetch the updated resumeUrl
        setTimeout(async () => {
          try {
            const profileRes = await api.get('/candidates/me');
            if (profileRes.data.success) {
              setProfile(prev => ({ ...prev, resumeUrl: profileRes.data.data.resumeUrl }));
            }
          } catch (fetchErr) {
            console.error('Failed to reload profile after resume scan:', fetchErr);
          }
        }, 3000);
      } else {
        setProfile({ ...profile, profilePhoto: res.data.data.profilePhoto });
        setSuccess('Profile photo updated!');
      }
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Upload failed. Check file type and size.');
    } finally {
      setFileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main pt-40 px-6 flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pt-24 pb-10 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto z-10 space-y-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Return to Hub</span>
           </Link>
           <div className="flex gap-3">
              <div className="glass-card px-4 py-2 rounded-xl border-white/5 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-400" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity Verified</span>
              </div>
           </div>
        </div>

        <div className="space-y-2">
           <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Master your <span className="gradient-text">Identity</span>.</h1>
           <p className="text-slate-400 font-medium text-base">Control how companies see you. Maintain your digital resume and presence.</p>
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
           
           {/* Sidebar - Visual Identity */}
           <div className="space-y-8">
              <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8 flex flex-col items-center text-center group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -z-10 group-hover:bg-primary/20 transition-all" />
                 
                 <div className="relative group/photo">
                    <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover/photo:border-primary/40">
                       {profile.profilePhoto ? (
                          <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                          <User className="w-12 h-12 text-slate-700" />
                       )}
                    </div>
                    <label className="absolute bottom-1 right-1 p-2.5 bg-primary rounded-full border-4 border-[#0F172A] shadow-lg cursor-pointer hover:scale-110 active:scale-90 transition-all">
                       <Camera className="w-4 h-4 text-white" />
                       <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} />
                    </label>
                 </div>

                 <div className="space-y-1">
                    <h3 className="text-xl font-black">{user?.name}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user?.email}</p>
                 </div>

                 <div className="w-full pt-8 border-t border-white/5 space-y-6">
                    {/* 💎 Revenue Layer Status */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-left">Sector Status</h4>
                       <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 space-y-4 text-left">
                          <div className="flex items-center justify-between">
                             <CreditCard className="w-6 h-6 text-blue-400" />
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                user?.planType === 'PREMIUM' ? 'bg-amber-500 text-black' : 
                                user?.planType === 'BASIC' ? 'bg-blue-600 text-white' : 
                                'bg-white/10 text-gray-500'
                             }`}>
                                {user?.planType} TIER
                             </span>
                          </div>
                          <div>
                             <p className="text-sm font-black text-white mb-1">
                                {user?.isActive ? 'Active Subscription' : 'Upgrade Required'}
                             </p>
                             {user?.subscriptionEnd && (
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                   Expires: {new Date(user.subscriptionEnd).toLocaleDateString()}
                                </p>
                             )}
                          </div>
                          <Link 
                             to="/pricing" 
                             className="block w-full text-center py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                          >
                             Upgrade Matrix
                          </Link>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] text-left">Document Hub</h4>
                       <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 text-left group/resume">
                          <div className="flex items-center justify-between">
                             <FileText className={`w-6 h-6 ${profile.resumeUrl ? 'text-primary-light' : 'text-slate-700'}`} />
                             {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-white mb-1">{profile.resumeUrl ? 'Modern_CV.pdf' : 'No Resume'}</p>
                             <p className="text-[10px] text-slate-500 font-medium">{profile.resumeUrl ? 'Updated last week' : 'Required for applications'}</p>
                          </div>
                          <label className="block w-full text-center py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-primary/20 hover:text-white hover:border-primary/40 transition-all cursor-pointer">
                             {fileLoading ? 'Syncing...' : profile.resumeUrl ? 'Update Resume' : 'Upload Resume'}
                             <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'resume')} />
                          </label>
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
                             <Mail className="w-3.5 h-3.5" /> Email Address (Immutable)
                          </label>
                          <input type="text" readOnly value={user?.email || 'N/A'} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-slate-500 font-medium cursor-not-allowed" />
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <User className="w-3.5 h-3.5" /> Short Bio / Summary
                          </label>
                          <textarea 
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows="4" 
                            placeholder="Tell employers about your journey..." 
                            className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium leading-relaxed"
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Preferred Location
                             </label>
                             <input 
                                type="text" 
                                name="location"
                                value={profile.location}
                                onChange={handleChange}
                                placeholder="e.g. Mumbai, India" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" /> Years of Experience
                             </label>
                             <input 
                                type="text" 
                                name="experience"
                                value={profile.experience}
                                onChange={handleChange}
                                placeholder="e.g. 5+ years" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Core Tech Stack & Skills (Comma separated)</label>
                          <input 
                            type="text" 
                            name="skills"
                            value={profile.skills}
                            onChange={handleChange}
                            placeholder="e.g. React, Node.js, UI/UX" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-4">
                    <Button 
                      type="submit" 
                      loading={saving} 
                      className="px-8 py-4 rounded-xl shadow-md shadow-primary/20 text-sm"
                    >
                      Commit Changes <Save className="ml-2 w-4 h-4" />
                    </Button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
