import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Building2, Globe, Users, Briefcase, IndianRupee, Clock, ArrowLeft, ArrowRight, Star, Share2, CheckCircle2, XCircle, X } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';

const MOCK_FALLBACK_COMPANIES = [
  {
    _id: '6a4f7aeaf9cd511269978a57',
    companyName: 'Acme com',
    industry: 'HEALTH & DEVELOPMENT',
    location: 'San Francisco, Miami, delhi',
    companyWebsite: 'https://www.acmecrop.com',
    foundedDate: '2015',
    baseLocations: 'California, US',
    companyType: 'Private Enterprise',
    description: 'Acme com is a pioneering global healthcare informatics and clinical operations leader, delivering next-generation digital healthcare products and human-centric workflows.',
    companyLogo: '',
    companyPhotos: [],
    userId: {
      email: 'careers@acmecrop.com',
      name: 'Acme HR Coordinator'
    }
  }
];

const CompanyProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleContactHub = () => {
        const email = company?.userId?.email;
        if (!email) {
            showToast('error', 'No contact email listed for this company.');
            return;
        }
        navigator.clipboard.writeText(email);
        showToast('success', `Copied email (${email}) to clipboard! Opening mail client...`);
        setTimeout(() => {
            window.location.href = `mailto:${email}?subject=Inquiry regarding career opportunities at ${company.companyName}`;
        }, 1200);
    };

    const handleWebsiteClick = () => {
        const url = company?.website || company?.companyWebsite;
        if (url) {
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            window.open(fullUrl, '_blank');
        } else {
            showToast('error', 'Website not provided by company.');
        }
    };

    const handleShareClick = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('success', 'Profile link copied to clipboard!');
    };

    const handleScrollToJobs = () => {
        document.getElementById('active-jobs')?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const res = await api.get(`/recruiters/${id}`);
                if (res.data?.success && res.data.data) {
                    setCompany(res.data.data);
                    setJobs(res.data.jobs || []);
                } else {
                    throw new Error('Not found');
                }
            } catch (err) {
                console.error('Company details API fetch error, falling back to mock details:', err);
                const mockMatch = MOCK_FALLBACK_COMPANIES.find(c => c._id === id) || {
                    _id: id,
                    companyName: 'AK Job Services Group',
                    industry: 'HUMAN CAPITAL SOLUTIONS',
                    location: 'Gurugram, Bengaluru, Mumbai',
                    companyWebsite: 'https://akjobservices.com',
                    foundedDate: '2020',
                    baseLocations: 'Haryana, India',
                    companyType: 'Corporate Agency',
                    description: 'AK Job Services is India\'s premier talent acquisition partner and business consultant, connecting top professionals with global market leaders.',
                    companyLogo: '',
                    companyPhotos: [],
                    userId: {
                      email: 'support@akjobservices.com',
                      name: 'AK Services Support'
                    }
                };
                setCompany(mockMatch);
                setError(null);

                // Set fallback jobs for this company
                const mockJobs = [
                    {
                        _id: '6a4f7aeaf9cd511269978a5d',
                        title: 'Operations Manager & Administration Lead',
                        location: 'Mumbai, India',
                        jobType: 'Full-time',
                        salaryRange: { min: 800000, max: 1400000, currency: 'INR' },
                        createdAt: new Date().toISOString()
                    }
                ];
                setJobs(mockJobs);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanyData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-main pt-40 px-6 flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Corporate Profile...</p>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-bg-main pt-40 px-6 text-center space-y-8">
                <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto border border-secondary/20 font-black text-4xl text-secondary">?</div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">Company not found</h2>
                    <p className="text-slate-500 font-medium">{error || "The company you're looking for doesn't exist."}</p>
                </div>
                <Link to="/companies">
                    <Button variant="outline" className="w-auto px-8">Back to Directory</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-main pt-32 pb-20 px-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Header / Intro Card */}
                <div className="glass-card p-10 md:p-16 rounded-[4rem] border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start text-center lg:text-left">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-full" />
                            <div className="w-40 h-40 md:w-56 md:h-56 bg-white/5 border border-white/10 rounded-[3rem] p-8 shadow-inner relative z-10 flex items-center justify-center">
                                {company.companyLogo ? (
                                    <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-contain" />
                                ) : (
                                    <Building2 className="w-20 h-20 text-slate-700" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter">{company.companyName}</h1>
                                    <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                                    </span>
                                </div>
                                <p className="text-primary-light font-black text-xl uppercase tracking-widest">{company.industry || 'Tech Innovation Group'}</p>
                            </div>

                            <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed italic">
                                "{company.description || `Pioneering the future of ${company.industry?.toLowerCase() || 'innovation'} through dedication and absolute hardware-software synergy.`}"
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-bold text-slate-300">{company.location || 'Global Presence'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-bold text-slate-300">5,000+ Innovators</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-bold text-slate-300">
                                        {company.companyWebsite || company.website ? (
                                            <a href={company.companyWebsite || company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-light transition-colors">
                                                {(company.companyWebsite || company.website).replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : (
                                            'Website not provided'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button onClick={handleContactHub} variant="cta" className="rounded-2xl px-10 py-5">Contact Hub</Button>
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={handleWebsiteClick} 
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 text-slate-500 hover:text-white transition-all"
                                    title="Visit Website"
                                >
                                    <Globe className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleShareClick} 
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 text-slate-500 hover:text-white transition-all"
                                    title="Copy Profile Link"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleScrollToJobs} 
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 text-slate-500 hover:text-white transition-all"
                                    title="View Active Listings"
                                >
                                    <Briefcase className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workspace Photos */}
                {company.companyPhotos && company.companyPhotos.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-white px-2">Inside the <span className="gradient-text">Workspace</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {company.companyPhotos.map((photo, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => setLightboxImage(photo.url || photo)}
                                  className="aspect-video rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer group relative shadow-xl"
                                >
                                    <img src={photo.url || photo} alt="Workspace" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sub Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* Company Stats / About */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-8">
                            <h3 className="text-2xl font-black">About <span className="text-primary-light">Mission</span></h3>
                            <div className="space-y-6">
                                <p className="text-slate-400 font-medium leading-relaxed whitespace-pre-wrap">
                                    {company.description || "A global leader in high-performance computing and sustainable energy management, dedicated to enabling a better world through sophisticated engineering and human-centric design."}
                                </p>
                                <div className="space-y-4 pt-4">
                                    {company.foundedDate && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Founded</span>
                                            <span className="text-white font-black">{company.foundedDate}</span>
                                        </div>
                                    )}
                                    {(company.baseLocations || company.location) && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Base</span>
                                            <span className="text-white font-black">{company.baseLocations || company.location || 'Remote'}</span>
                                        </div>
                                    )}
                                    {company.companyType && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-bold uppercase tracking-widest">Type</span>
                                            <span className="text-white font-black">{company.companyType}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Jobs Section */}
                    <div id="active-jobs" className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black">Active <span className="gradient-text">Openings</span></h3>
                            <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary-light uppercase tracking-widest">
                                {jobs.length} Positions Available
                            </div>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {jobs.length > 0 ? (
                                    jobs.map((job, i) => (
                                        <motion.div
                                            key={job._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all group cursor-pointer"
                                            onClick={() => navigate(`/jobs/${job._id}`)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="space-y-3">
                                                    <h4 className="text-xl font-bold group-hover:text-primary-light transition-colors">{job.title}</h4>
                                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-light" /> {job.location}</span>
                                                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-light" /> {job.jobType}</span>
                                                        <span className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-primary-light" /> {job.salaryRange?.min} - {job.salaryRange?.max} / annum</span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="rounded-xl px-6 py-3 text-xs w-full md:w-auto">
                                                    View Details <ArrowRight className="ml-2 w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="glass-card p-12 rounded-[3.5rem] border-white/5 border-dashed text-center flex flex-col items-center gap-6">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                            <Briefcase className="w-10 h-10 text-slate-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-bold">No active listings</h4>
                                            <p className="text-slate-500 font-medium">This company currently isn't hiring. Check back later!</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
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
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border font-bold text-sm backdrop-blur-xl ${
                            toast.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                        }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            : <XCircle className="w-5 h-5 flex-shrink-0" />
                        }
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanyProfile;
